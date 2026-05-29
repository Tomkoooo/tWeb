import mongoose, { Schema, Document, Model, Types } from "mongoose"

export type CampPricingMode = "per_child" | "flat"

export interface ICampTicketType extends Document {
  sessionId: Types.ObjectId
  name: string
  priceHuf: number
  pricingMode: CampPricingMode
  isActive: boolean
  sortOrder: number
}

const CampTicketTypeSchema = new Schema<ICampTicketType>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "CampSession", required: true, index: true },
    name: { type: String, required: true, trim: true },
    priceHuf: { type: Number, required: true, min: 0 },
    pricingMode: { type: String, enum: ["per_child", "flat"], required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const CampTicketType: Model<ICampTicketType> =
  mongoose.models.CampTicketType ||
  mongoose.model<ICampTicketType>("CampTicketType", CampTicketTypeSchema)

export default CampTicketType
