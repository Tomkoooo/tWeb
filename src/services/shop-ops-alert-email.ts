import dbConnect from "@/lib/db";
import { ShopContentService } from "@/services/shop-content";

/** Shop CMS contact or env override (same chain as invoice failure alerts). */
export async function resolveShopOpsAlertEmail(): Promise<string> {
  await dbConnect();
  const content = await ShopContentService.getAll();
  return String(content.contact_email || process.env.INVOICE_ERROR_ALERT_EMAIL || "").trim();
}
