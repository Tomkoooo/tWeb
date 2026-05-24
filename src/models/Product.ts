import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRating {
  user: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface IVariantOption {
  name: string;
  values: string[];
}

export interface IProductVariant {
  id: string;
  slugPart?: string;
  sku?: string;
  attributes: Record<string, string>;
  nameOverride?: string;
  descriptionOverride?: string;
  netPrice: number;
  /** Merchant-entered customer gross (HUF); when set, overrides netToGross for display/checkout. */
  grossPrice?: number;
  discount: number;
  stock: number;
  isActive: boolean;
  isDefault?: boolean;
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface IProduct extends Document {
  /** VAT % included in gross price calculations (Hungary default 27). */
  vatPercent: number;
  name: string;
  images: string[];
  description: string;
  ratings: IRating[];
  variantOptions: IVariantOption[];
  variants: IProductVariant[];
  requireVariantSelection: boolean;
  stock: number;
  netPrice: number;
  grossPrice?: number;
  discount: number;
  category: mongoose.Types.ObjectId | any;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  slug: string;
  isActive: boolean;
  isVisible: boolean;
  /** Lower = earlier in homepage featured section (within category / manual lists). */
  featuredListIndex?: number | null;
}

const ProductSchema = new Schema<IProduct>(
  {
    vatPercent: { type: Number, default: 27, min: 0, max: 100 },
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
    variantOptions: [
      {
        name: { type: String, required: true },
        values: [{ type: String, required: true }],
      },
    ],
    variants: [
      {
        id: { type: String, required: true },
        slugPart: { type: String },
        sku: { type: String },
        attributes: { type: Schema.Types.Mixed, default: {} },
        nameOverride: { type: String },
        descriptionOverride: { type: String },
        netPrice: { type: Number, required: true },
        grossPrice: { type: Number },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true, default: 0 },
        isActive: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false },
        images: [{ type: String }],
        seo: {
          title: { type: String },
          description: { type: String },
          keywords: [{ type: String }],
        },
      },
    ],
    requireVariantSelection: { type: Boolean, default: false },
    stock: { type: Number, required: true, default: 0 },
    netPrice: { type: Number, required: true },
    grossPrice: { type: Number },
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
    featuredListIndex: { type: Number, default: null },
  },
  { timestamps: true }
);

ProductSchema.pre("validate", function () {
  const product = this as IProduct;
  const variants = Array.isArray(product.variants) ? product.variants : [];

  if (variants.length > 0) {
    const seenIds = new Set<string>();
    for (const variant of variants) {
      if (seenIds.has(variant.id)) {
        throw new Error(`Duplicate variant id: ${variant.id}`);
      }
      seenIds.add(variant.id);
    }
  }
});


ProductSchema.index({ isVisible: 1, category: 1, createdAt: -1 });
ProductSchema.index({ isVisible: 1, createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
