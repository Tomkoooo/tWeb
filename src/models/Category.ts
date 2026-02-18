import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = 
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
