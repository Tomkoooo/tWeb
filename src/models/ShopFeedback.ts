import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShopFeedback extends Document {
  user: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
}

const ShopFeedbackSchema = new Schema<IShopFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const ShopFeedback: Model<IShopFeedback> =
  mongoose.models.ShopFeedback || mongoose.model<IShopFeedback>("ShopFeedback", ShopFeedbackSchema);

export default ShopFeedback;
