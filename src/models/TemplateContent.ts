import mongoose, { Schema, Document, Model } from "mongoose"

export interface ITemplateContent extends Document {
  templateId: string
  pageKey: string
  value: string
  updatedBy?: string
}

const TemplateContentSchema = new Schema<ITemplateContent>(
  {
    templateId: { type: String, required: true, index: true },
    pageKey: { type: String, required: true },
    value: { type: String, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true }
)

TemplateContentSchema.index({ templateId: 1, pageKey: 1 }, { unique: true })

const TemplateContent: Model<ITemplateContent> =
  mongoose.models.TemplateContent ||
  mongoose.model<ITemplateContent>("TemplateContent", TemplateContentSchema)

export default TemplateContent
