import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId | unknown;
    variantId?: string;
    variantLabel?: string;
    selectedAttributes?: Record<string, string>;
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
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    zip: string;
    city: string;
    street: string;
    comment?: string;
    email: string;
    phone: string;
  };
  glsParcelPoint?: {
    id: string;
    name: string;
    contact?: {
      countryCode?: string;
      postalCode?: string;
      city?: string;
      address?: string;
      name?: string;
      email?: string;
    };
  };
  glsLabel?: {
    parcelId?: number;
    parcelNumber?: string;
    parcelNumberWithCheckdigit?: string;
    pin?: string;
    labelUrl?: string;
    labelDataBase64?: string;
    generatedAt?: Date;
    generatedBy?: mongoose.Types.ObjectId;
    lastError?: string;
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
  invoiceMode?: "automatic" | "manual" | "none";
  invoiceId?: string;
  invoiceExternalId?: string;
  invoiceIssuedAt?: Date;
  invoiceStatus?: "pending" | "issued" | "failed" | "manual";
  invoicePdfFileName?: string;
  invoiceLastError?: string;
  invoiceEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantId: { type: String },
        variantLabel: { type: String },
        selectedAttributes: { type: Schema.Types.Mixed },
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
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      name: { type: String, required: true },
      zip: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      comment: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    glsParcelPoint: {
      id: { type: String },
      name: { type: String },
      contact: {
        countryCode: { type: String },
        postalCode: { type: String },
        city: { type: String },
        address: { type: String },
        name: { type: String },
        email: { type: String },
      },
    },
    glsLabel: {
      parcelId: { type: Number },
      parcelNumber: { type: String },
      parcelNumberWithCheckdigit: { type: String },
      pin: { type: String },
      labelUrl: { type: String },
      labelDataBase64: { type: String },
      generatedAt: { type: Date },
      generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      lastError: { type: String },
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
    invoiceMode: {
      type: String,
      enum: ["automatic", "manual", "none"],
      default: "none",
    },
    invoiceId: { type: String },
    invoiceExternalId: { type: String },
    invoiceIssuedAt: { type: Date },
    invoiceStatus: {
      type: String,
      enum: ["pending", "issued", "failed", "manual"],
      default: "pending",
    },
    invoicePdfFileName: { type: String },
    invoiceLastError: { type: String },
    invoiceEmailSentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
