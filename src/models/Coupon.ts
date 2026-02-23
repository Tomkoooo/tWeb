import mongoose, { Schema, Document, Model } from "mongoose";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
  FREE_SHIPPING = "free_shipping"
}

export interface ICoupon extends Document {
  code: string;
  type: DiscountType;
  value: number; // For percentage or fixed amount
  minCartValue?: number;
  startDate: Date;
  endDate: Date;
  applicableProducts: mongoose.Types.ObjectId[];
  applicableUsers: mongoose.Types.ObjectId[];
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { 
      type: String, 
      enum: Object.values(DiscountType), 
      required: true,
      default: DiscountType.PERCENTAGE
    },
    value: { type: Number, required: true, default: 0 },
    minCartValue: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon: Model<ICoupon> = 
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
