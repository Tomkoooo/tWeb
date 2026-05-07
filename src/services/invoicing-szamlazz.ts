import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Buyer,
  Client,
  Currencies,
  Invoice,
  Item,
  Languages,
  PaymentMethods,
  Seller,
} from "szamlazz.js";
import { IOrder } from "@/models/Order";

type InvoiceIssueResult = {
  invoiceId: string;
  pdfFileName?: string;
  netTotal?: string;
  grossTotal?: string;
};

function parseNumber(input: unknown): number {
  const n = Number(input ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getUploadDir(): string {
  return path.join(process.cwd(), "uploads");
}

function ensureUploadDir() {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

function mapPaymentMethod(order: IOrder) {
  const paymentName = String((order as unknown as { paymentMethod?: { name?: string } }).paymentMethod?.name || "").toLowerCase();
  if (paymentName.includes("kárty") || paymentName.includes("card") || paymentName.includes("stripe")) {
    return PaymentMethods.CreditCard;
  }
  return PaymentMethods.BankTransfer;
}

export class InvoicingSzamlazzService {
  private static getClient(requestInvoiceDownload: boolean = true) {
    const authToken = process.env.SZAMLAZZ_AGENT_KEY;
    const user = process.env.SZAMLAZZ_USER;
    const password = process.env.SZAMLAZZ_PASSWORD;

    if (!authToken && (!user || !password)) {
      throw new Error("Számlázz credentials are missing. Set SZAMLAZZ_AGENT_KEY or SZAMLAZZ_USER/SZAMLAZZ_PASSWORD.");
    }

    return new Client({
      authToken,
      user,
      password,
      eInvoice: false,
      requestInvoiceDownload,
      downloadedInvoiceCount: 1,
      responseVersion: 1,
      timeout: parseNumber(process.env.SZAMLAZZ_TIMEOUT_MS || 10000),
    });
  }

  private static buildSeller() {
    return new Seller({
      bank: {
        name: process.env.SZAMLAZZ_SELLER_BANK_NAME || "",
        accountNumber: process.env.SZAMLAZZ_SELLER_BANK_ACCOUNT || "",
      },
      issuerName: process.env.SZAMLAZZ_ISSUER_NAME || "",
      email: {
        replyToAddress: process.env.EMAIL_FROM || "",
        subject: process.env.SZAMLAZZ_EMAIL_SUBJECT || "Számla",
        message: process.env.SZAMLAZZ_EMAIL_MESSAGE || "",
      },
    });
  }

  private static buildBuyer(order: IOrder) {
    return new Buyer({
      name: order.billingInfo.name,
      country: "HU",
      zip: order.billingInfo.zip,
      city: order.billingInfo.city,
      address: order.billingInfo.street,
      taxNumber: order.billingInfo.taxNumber || "",
      phone: order.billingInfo.phone || "",
    });
  }

  private static buildItems(order: IOrder) {
    return order.items.map((line) => {
      const quantity = parseNumber(line.quantity) || 1;
      const grossUnitPrice = parseNumber(line.price);
      return new Item({
        label: line.variantLabel ? `${line.name} [${line.variantLabel}]` : line.name,
        quantity,
        unit: "db",
        vat: 27,
        grossUnitPrice,
      });
    });
  }

  private static async savePdfBuffer(pdfBuffer: Buffer, orderId: string): Promise<string> {
    ensureUploadDir();
    const fileName = `invoice-${orderId}-${crypto.randomUUID()}.pdf`;
    const target = path.join(getUploadDir(), fileName);
    fs.writeFileSync(target, pdfBuffer);
    return fileName;
  }

  static async issueInvoice(order: IOrder): Promise<InvoiceIssueResult> {
    const client = this.getClient(true);
    const invoice = new Invoice({
      paymentMethod: mapPaymentMethod(order),
      currency: Currencies.HUF,
      language: Languages.Hungarian,
      seller: this.buildSeller(),
      buyer: this.buildBuyer(order),
      items: this.buildItems(order),
      orderNumber: order._id.toString(),
    });

    const response = await client.issueInvoice(invoice);
    const invoiceId = String(response.invoiceId || "");
    if (!invoiceId) {
      throw new Error("Számlázás sikertelen: hiányzó invoice azonosító.");
    }

    let pdfFileName: string | undefined;
    const maybePdf = (response as unknown as { pdf?: Buffer }).pdf;
    if (maybePdf && Buffer.isBuffer(maybePdf)) {
      pdfFileName = await this.savePdfBuffer(maybePdf, order._id.toString());
    }

    return {
      invoiceId,
      pdfFileName,
      netTotal: String((response as unknown as { netTotal?: string }).netTotal || ""),
      grossTotal: String((response as unknown as { grossTotal?: string }).grossTotal || ""),
    };
  }

  static async downloadInvoicePdf(params: { invoiceId?: string; orderNumber?: string; fallbackFileName?: string }) {
    const client = this.getClient(false);

    try {
      const result = await client.getInvoiceData({
        invoiceId: params.invoiceId,
        orderNumber: params.orderNumber,
        pdf: true,
      });
      const maybePdf = (result as unknown as { pdf?: Buffer }).pdf;
      if (maybePdf && Buffer.isBuffer(maybePdf)) {
        return maybePdf;
      }
    } catch {
      // Fallback handled below.
    }

    if (params.fallbackFileName) {
      const fallbackPath = path.join(getUploadDir(), params.fallbackFileName);
      if (fs.existsSync(fallbackPath)) {
        return fs.readFileSync(fallbackPath);
      }
    }

    return null;
  }
}
