import { IOrder } from "@/models/Order";
import { normalizeHuMobilePhone } from "@/lib/parcel-locker";

type FoxpostConfig = {
  apiBaseUrl: string;
  username: string;
  password: string;
  apiKey: string;
  parcelSize: string;
  labelPageSize: string;
  isWeb: boolean;
};

type FoxpostParcelResponseItem = {
  clFoxId?: string;
  barcode?: string;
  refCode?: string;
  destination?: string;
  valid?: boolean;
  errors?: Array<{ field?: string; message?: string }>;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name}`);
  }
  return value.trim();
}

function ensureFoxpostConfig(): FoxpostConfig {
  const base = (process.env.FOXPOST_API_BASE_URL || "https://webapi-test.foxpost.hu/api").replace(
    /\/+$/,
    ""
  );
  const isSandbox = base.includes("webapi-test");
  return {
    apiBaseUrl: base,
    username: requireEnv("FOXPOST_API_USERNAME"),
    password: requireEnv("FOXPOST_API_PASSWORD"),
    apiKey: requireEnv("FOXPOST_API_KEY"),
    parcelSize: (process.env.FOXPOST_PARCEL_SIZE || "M").trim(),
    labelPageSize: (process.env.FOXPOST_LABEL_PAGE_SIZE || "A6").trim(),
    isWeb: process.env.FOXPOST_IS_WEB === "true" ? true : !isSandbox,
  };
}

function authHeaders(config: FoxpostConfig, acceptPdf = false): HeadersInit {
  const token = Buffer.from(`${config.username}:${config.password}`, "utf8").toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Api-key": config.apiKey,
    "Content-Type": "application/json",
    ...(acceptPdf ? { Accept: "application/pdf" } : {}),
  };
}

function parseParcelResponseItems(data: unknown): FoxpostParcelResponseItem[] {
  if (Array.isArray(data)) return data as FoxpostParcelResponseItem[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.parcels)) return obj.parcels as FoxpostParcelResponseItem[];
    if (Array.isArray(obj.data)) return obj.data as FoxpostParcelResponseItem[];
    return [obj as FoxpostParcelResponseItem];
  }
  return [];
}

function extractParcelError(item: FoxpostParcelResponseItem): string | null {
  if (item.errors && item.errors.length > 0) {
    const first = item.errors[0];
    return first?.message || first?.field || "Foxpost csomag létrehozási hiba.";
  }
  if (item.valid === false) {
    return "Foxpost csomag létrehozása sikertelen.";
  }
  return null;
}

export class FoxpostService {
  static async createParcelForOrder(order: IOrder): Promise<FoxpostParcelResponseItem> {
    if (!order.foxpostParcelPoint?.id) {
      throw new Error("A rendeléshez nincs Foxpost csomagautomata mentve.");
    }

    const config = ensureFoxpostConfig();
    const phone = normalizeHuMobilePhone(order.shippingAddress.phone);
    const refCode = order._id.toString().slice(-30);

    const payload = [
      {
        destination: order.foxpostParcelPoint.id,
        recipientName: order.shippingAddress.name,
        recipientPhone: phone,
        recipientEmail: order.shippingAddress.email,
        size: config.parcelSize,
        refCode,
        cod: 0,
      },
    ];

    const url = `${config.apiBaseUrl}/parcel?isWeb=${config.isWeb ? "true" : "false"}`;
    const response = await fetch(url, {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Foxpost API hiba (${response.status})${text ? `: ${text.slice(0, 200)}` : ""}`);
    }

    const data = await response.json();
    const items = parseParcelResponseItems(data);
    const first = items[0];
    if (!first) {
      throw new Error("A Foxpost válasz nem tartalmaz csomag adatot.");
    }

    const err = extractParcelError(first);
    if (err) throw new Error(err);

    const clFoxId = first.clFoxId || first.barcode;
    if (!clFoxId) {
      throw new Error("A Foxpost válasz nem tartalmaz csomag azonosítót (clFoxId).");
    }

    return { ...first, clFoxId, refCode: first.refCode || refCode };
  }

  static async fetchLabelPdf(clFoxIds: string[], pageSize?: string): Promise<string> {
    if (clFoxIds.length === 0) {
      throw new Error("Nincs Foxpost csomag azonosító a címke generáláshoz.");
    }

    const config = ensureFoxpostConfig();
    const size = (pageSize || config.labelPageSize).trim();
    const url = `${config.apiBaseUrl}/label/${encodeURIComponent(size)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: authHeaders(config, true),
      body: JSON.stringify(clFoxIds),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Foxpost címke API hiba (${response.status})${text ? `: ${text.slice(0, 200)}` : ""}`
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      throw new Error("A Foxpost válasz nem tartalmaz nyomtatható címkét.");
    }
    return buffer.toString("base64");
  }

  static async createShipmentForOrder(order: IOrder): Promise<{
    clFoxId: string;
    refCode?: string;
    labelDataBase64: string;
    labelPageSize: string;
    trackingStatus?: string;
  }> {
    const config = ensureFoxpostConfig();
    let clFoxId = order.foxpostShipment?.clFoxId;

    if (!clFoxId) {
      const created = await this.createParcelForOrder(order);
      clFoxId = created.clFoxId || created.barcode;
      if (!clFoxId) {
        throw new Error("Foxpost csomag azonosító hiányzik a létrehozás után.");
      }
    }

    const labelDataBase64 = await this.fetchLabelPdf([clFoxId], config.labelPageSize);
    let trackingStatus: string | undefined;
    try {
      trackingStatus = await this.getTrackingStatus(clFoxId);
    } catch {
      trackingStatus = undefined;
    }

    return {
      clFoxId,
      refCode: order.foxpostShipment?.refCode,
      labelDataBase64,
      labelPageSize: config.labelPageSize,
      trackingStatus,
    };
  }

  static async getTrackingStatus(barcode: string): Promise<string | undefined> {
    const config = ensureFoxpostConfig();
    const response = await fetch(
      `${config.apiBaseUrl}/tracking/${encodeURIComponent(barcode)}`,
      {
        method: "GET",
        headers: authHeaders(config),
      }
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as {
      status?: string;
      statusCode?: string;
      lastStatus?: string;
      events?: Array<{ status?: string; statusCode?: string }>;
    };

    if (data.status || data.statusCode || data.lastStatus) {
      return data.status || data.statusCode || data.lastStatus;
    }
    const last = data.events?.[data.events.length - 1];
    return last?.status || last?.statusCode;
  }
}
