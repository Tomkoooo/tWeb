import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopTradingSetting extends Document {
  key: string;
  /** Uppercase ISO2. Empty array = shipping to any country. */
  shippingAllowedCountryCodes: string[];
  /** Uppercase ISO2. Empty array = invoicing OK for any country. */
  invoicingAllowedCountryCodes: string[];
}

const ShopTradingSettingSchema = new Schema<IShopTradingSetting>(
  {
    key: { type: String, required: true, unique: true, default: "trading" },
    shippingAllowedCountryCodes: [{ type: String, trim: true }],
    invoicingAllowedCountryCodes: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const ShopTradingSetting: Model<IShopTradingSetting> =
  mongoose.models.ShopTradingSetting ||
  mongoose.model<IShopTradingSetting>("ShopTradingSetting", ShopTradingSettingSchema);

export default ShopTradingSetting;
