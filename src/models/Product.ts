import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRating {
  user: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  images: string[];
  description: string;
  ratings: IRating[];
  stock: number;
  netPrice: number;
  discount: number;
  category: mongoose.Types.ObjectId;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  slug: string;
  isActive: boolean;
  isVisible: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    images: { type: [String], required: true, default: [] },
    description: { type: String, required: true },
    ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    stock: { type: Number, required: true, default: 0 },
    netPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true }, // "Disabled but not hidden" by default
  },
  { timestamps: true }
);


const Product: Model<IProduct> = 
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
