import mongoose, { Schema, Document, Model, Types } from "mongoose"
import type { CampPricingMode } from "./CampTicketType"
import type { CampChildDraft } from "./CampCheckoutHold"

export interface ICampRegistration extends Document {
  campId: Types.ObjectId
  sessionId: Types.ObjectId
  ticketTypeId: Types.ObjectId
  holdId?: Types.ObjectId
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  children: CampChildDraft[]
  ticketTypeName: string
  sessionLabel: string
  campTitle: string
  pricingMode: CampPricingMode
  childCount: number
  totalHuf: number
  stripeSessionId?: string
  paidAt: Date
  status: "paid" | "cancelled"
}

const ChildSchema = new Schema<CampChildDraft>(
  {
    name: { type: String, required: true },
    birthDate: { type: String, required: true },
    dietaryRequest: { type: String },
    allergies: { type: String },
  },
  { _id: false }
)

const CampRegistrationSchema = new Schema<ICampRegistration>(
  {
    campId: { type: Schema.Types.ObjectId, ref: "Camp", required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "CampSession", required: true, index: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "CampTicketType", required: true },
    holdId: { type: Schema.Types.ObjectId, ref: "CampCheckoutHold" },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    children: { type: [ChildSchema], required: true },
    ticketTypeName: { type: String, required: true },
    sessionLabel: { type: String, required: true },
    campTitle: { type: String, required: true },
    pricingMode: { type: String, enum: ["per_child", "flat"], required: true },
    childCount: { type: Number, required: true, min: 1 },
    totalHuf: { type: Number, required: true, min: 0 },
    stripeSessionId: { type: String },
    paidAt: { type: Date, required: true },
    status: { type: String, enum: ["paid", "cancelled"], default: "paid" },
  },
  { timestamps: true }
)

const CampRegistration: Model<ICampRegistration> =
  mongoose.models.CampRegistration ||
  mongoose.model<ICampRegistration>("CampRegistration", CampRegistrationSchema)

export default CampRegistration
