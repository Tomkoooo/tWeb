import mongoose, { Schema, Document, Model, Types } from "mongoose"
import type { CampPricingMode } from "./CampTicketType"

export type CampHoldStatus =
  | "created"
  | "checkout_started"
  | "paid"
  | "finalized"
  | "expired"
  | "cancelled"
  | "failed"

export type CampChildDraft = {
  name: string
  birthDate: string
  dietaryRequest?: string
  allergies?: string
}

const ChildDraftSchema = new Schema<CampChildDraft>(
  {
    name: { type: String, required: true },
    birthDate: { type: String, required: true },
    dietaryRequest: { type: String },
    allergies: { type: String },
  },
  { _id: false }
)

export interface ICampCheckoutHold extends Document {
  sessionId: Types.ObjectId
  ticketTypeId: Types.ObjectId
  campId: Types.ObjectId
  childCount: number
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  children: CampChildDraft[]
  ticketTypeName: string
  sessionLabel: string
  pricingMode: CampPricingMode
  totalHuf: number
  status: CampHoldStatus
  expiresAt: Date
  stripeSessionId?: string
  stripePaymentIntentId?: string
  registrationId?: Types.ObjectId
  lastError?: string
}

const CampCheckoutHoldSchema = new Schema<ICampCheckoutHold>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "CampSession", required: true, index: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "CampTicketType", required: true },
    campId: { type: Schema.Types.ObjectId, ref: "Camp", required: true },
    childCount: { type: Number, required: true, min: 1 },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    children: { type: [ChildDraftSchema], required: true },
    ticketTypeName: { type: String, required: true },
    sessionLabel: { type: String, required: true },
    pricingMode: { type: String, enum: ["per_child", "flat"], required: true },
    totalHuf: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["created", "checkout_started", "paid", "finalized", "expired", "cancelled", "failed"],
      default: "created",
    },
    expiresAt: { type: Date, required: true, index: true },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },
    registrationId: { type: Schema.Types.ObjectId, ref: "CampRegistration" },
    lastError: { type: String },
  },
  { timestamps: true }
)

const CampCheckoutHold: Model<ICampCheckoutHold> =
  mongoose.models.CampCheckoutHold ||
  mongoose.model<ICampCheckoutHold>("CampCheckoutHold", CampCheckoutHoldSchema)

export default CampCheckoutHold
