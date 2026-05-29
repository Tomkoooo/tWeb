import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICamp extends Document {
  slug: string
  title: string
  description?: string
  heroImage?: string
  sortOrder: number
  isPublished: boolean
}

const CampSchema = new Schema<ICamp>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    heroImage: { type: String },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const Camp: Model<ICamp> =
  mongoose.models.Camp || mongoose.model<ICamp>("Camp", CampSchema)

export default Camp
