import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId | any;
    name: string;
    price: number;
    quantity: number;
  }[];
  billingInfo: {
    type: "personal" | "company";
    name: string;
    taxNumber?: string;
    zip: string;
    city: string;
    street: string;
  };
  shippingAddress: {
    name: string;
    zip: string;
    city: string;
    street: string;
    comment?: string;
  };
  shippingMethod: mongoose.Types.ObjectId;
  paymentMethod: mongoose.Types.ObjectId;
  couponCodes?: string[];
  subtotal: number;
  shippingFee: number;
  paymentFee: number;
  discount: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    billingInfo: {
      type: { type: String, enum: ["personal", "company"], required: true },
      name: { type: String, required: true },
      taxNumber: { type: String },
      zip: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
    },
    shippingAddress: {
      name: { type: String, required: true },
      zip: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      comment: { type: String },
    },
    shippingMethod: { type: Schema.Types.ObjectId, ref: "ShippingMethod", required: true },
    paymentMethod: { type: Schema.Types.ObjectId, ref: "PaymentMethod", required: true },
    couponCodes: [{ type: String }],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
