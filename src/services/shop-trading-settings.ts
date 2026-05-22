import dbConnect from "@/lib/db";
import ShopTradingSetting from "@/models/ShopTradingSetting";
import { normalizeIso2 } from "@/lib/country-codes";

export type ShopTradingSettings = {
  shippingAllowedCountryCodes: string[];
  invoicingAllowedCountryCodes: string[];
};

function normalizeCodeList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const item of raw) {
    const c = normalizeIso2(String(item ?? "").trim());
    if (c) out.add(c);
  }
  return [...out].sort((a, b) => a.localeCompare(b))
}

export class ShopTradingSettingsService {
  static async get(): Promise<ShopTradingSettings> {
    await dbConnect();
    let doc = await ShopTradingSetting.findOne({ key: "trading" }).lean();
    if (!doc) {
      await ShopTradingSetting.create({
        key: "trading",
        shippingAllowedCountryCodes: [],
        invoicingAllowedCountryCodes: [],
      });
      doc = await ShopTradingSetting.findOne({ key: "trading" }).lean();
    }
    return {
      shippingAllowedCountryCodes: normalizeCodeList(doc?.shippingAllowedCountryCodes),
      invoicingAllowedCountryCodes: normalizeCodeList(doc?.invoicingAllowedCountryCodes),
    };
  }

  static async update(input: Partial<ShopTradingSettings>): Promise<ShopTradingSettings> {
    await dbConnect();
    const prev = await this.get();

    const merged: ShopTradingSettings = {
      shippingAllowedCountryCodes:
        input.shippingAllowedCountryCodes !== undefined
          ? normalizeCodeList(input.shippingAllowedCountryCodes)
          : prev.shippingAllowedCountryCodes,
      invoicingAllowedCountryCodes:
        input.invoicingAllowedCountryCodes !== undefined
          ? normalizeCodeList(input.invoicingAllowedCountryCodes)
          : prev.invoicingAllowedCountryCodes,
    };

    await ShopTradingSetting.findOneAndUpdate(
      { key: "trading" },
      {
        $set: {
          shippingAllowedCountryCodes: merged.shippingAllowedCountryCodes,
          invoicingAllowedCountryCodes: merged.invoicingAllowedCountryCodes,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return merged
  }
}
