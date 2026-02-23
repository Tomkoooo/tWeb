import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShippingMethod extends Document {
  name: string;
  grossPrice: number;
  isActive: boolean;
}

const ShippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: { type: String, required: true },
    grossPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ShippingMethod: Model<IShippingMethod> = 
  mongoose.models.ShippingMethod || mongoose.model<IShippingMethod>("ShippingMethod", ShippingMethodSchema);

export default ShippingMethod;
