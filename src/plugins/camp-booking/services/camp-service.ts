import mongoose from "mongoose"
import dbConnect from "@/lib/db"
import Camp from "../models/Camp"
import CampSession from "../models/CampSession"
import CampTicketType from "../models/CampTicketType"
import CampRegistration from "../models/CampRegistration"
import { formatSessionLabel } from "../lib/session-label"
import { seatsRequiredForBooking } from "../lib/pricing"

function spotsLeft(session: { capacity: number; soldCount: number; reservedCount: number }) {
  return Math.max(0, session.capacity - session.soldCount - session.reservedCount)
}

export class CampService {
  static async listPublishedCampsWithSessions() {
    await dbConnect()
    const camps = await Camp.find({ isPublished: true }).sort({ sortOrder: 1, title: 1 }).lean()
    const campIds = camps.map((c) => c._id)
    const sessions = await CampSession.find({
      campId: { $in: campIds },
      isPublished: true,
    })
      .sort({ startDate: 1 })
      .lean()
    const sessionIds = sessions.map((s) => s._id)
    const ticketTypes = await CampTicketType.find({
      sessionId: { $in: sessionIds },
      isActive: true,
    })
      .sort({ sortOrder: 1 })
      .lean()

    const ticketsBySession = new Map<string, typeof ticketTypes>()
    for (const t of ticketTypes) {
      const key = String(t.sessionId)
      if (!ticketsBySession.has(key)) ticketsBySession.set(key, [])
      ticketsBySession.get(key)!.push(t)
    }

    const sessionsByCamp = new Map<string, typeof sessions>()
    for (const s of sessions) {
      const key = String(s.campId)
      if (!sessionsByCamp.has(key)) sessionsByCamp.set(key, [])
      sessionsByCamp.get(key)!.push(s)
    }

    return camps.map((camp) => ({
      id: String(camp._id),
      slug: camp.slug,
      title: camp.title,
      description: camp.description || "",
      heroImage: camp.heroImage || "",
      sessions: (sessionsByCamp.get(String(camp._id)) || []).map((session) => ({
        id: String(session._id),
        label: session.label,
        startDate: session.startDate,
        endDate: session.endDate,
        capacity: session.capacity,
        spotsLeft: spotsLeft(session),
        sessionLabel: formatSessionLabel(session.label, session.startDate, session.endDate),
        ticketTypes: (ticketsBySession.get(String(session._id)) || []).map((tt) => ({
          id: String(tt._id),
          name: tt.name,
          priceHuf: tt.priceHuf,
          pricingMode: tt.pricingMode,
        })),
      })),
    }))
  }

  static async getSessionForBooking(sessionId: string) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) return null
    await dbConnect()
    const session = await CampSession.findOne({
      _id: sessionId,
      isPublished: true,
    }).lean()
    if (!session) return null
    const camp = await Camp.findById(session.campId).lean()
    if (!camp?.isPublished) return null
    const ticketTypes = await CampTicketType.find({ sessionId, isActive: true })
      .sort({ sortOrder: 1 })
      .lean()
    return {
      camp: {
        id: String(camp._id),
        title: camp.title,
        slug: camp.slug,
      },
      session: {
        id: String(session._id),
        label: session.label,
        startDate: session.startDate,
        endDate: session.endDate,
        capacity: session.capacity,
        spotsLeft: spotsLeft(session),
        sessionLabel: formatSessionLabel(session.label, session.startDate, session.endDate),
      },
      ticketTypes: ticketTypes.map((tt) => ({
        id: String(tt._id),
        name: tt.name,
        priceHuf: tt.priceHuf,
        pricingMode: tt.pricingMode,
      })),
    }
  }

  static async reserveSessionSeats(sessionId: mongoose.Types.ObjectId, seats: number) {
    const updated = await CampSession.findOneAndUpdate(
      {
        _id: sessionId,
        $expr: {
          $lte: [{ $add: ["$soldCount", "$reservedCount", seats] }, "$capacity"],
        },
      },
      { $inc: { reservedCount: seats } },
      { new: true }
    )
    if (!updated) {
      throw new Error("Nincs elég szabad hely ezen a turnuson.")
    }
    return updated
  }

  static async releaseSessionSeats(sessionId: mongoose.Types.ObjectId, seats: number) {
    await CampSession.findByIdAndUpdate(sessionId, {
      $inc: { reservedCount: -seats },
    })
  }

  static async confirmSessionSeats(sessionId: mongoose.Types.ObjectId, seats: number) {
    const updated = await CampSession.findOneAndUpdate(
      { _id: sessionId, reservedCount: { $gte: seats } },
      { $inc: { reservedCount: -seats, soldCount: seats } },
      { new: true }
    )
    if (!updated) {
      throw new Error("Foglalás megerősítése sikertelen (helyek).")
    }
    return updated
  }

  static seatsRequired = seatsRequiredForBooking

  // --- Admin ---

  static async listCampsAdmin() {
    await dbConnect()
    return Camp.find().sort({ sortOrder: 1, title: 1 }).lean()
  }

  static async createCamp(data: {
    slug: string
    title: string
    description?: string
    heroImage?: string
    sortOrder?: number
    isPublished?: boolean
  }) {
    await dbConnect()
    return Camp.create(data)
  }

  static async updateCamp(
    id: string,
    data: Partial<{
      slug: string
      title: string
      description: string
      heroImage: string
      sortOrder: number
      isPublished: boolean
    }>
  ) {
    await dbConnect()
    return Camp.findByIdAndUpdate(id, { $set: data }, { new: true })
  }

  static async deleteCamp(id: string) {
    await dbConnect()
    const sessions = await CampSession.find({ campId: id }).select("_id").lean()
    const sessionIds = sessions.map((s) => s._id)
    await CampTicketType.deleteMany({ sessionId: { $in: sessionIds } })
    await CampRegistration.deleteMany({ campId: id })
    await CampSession.deleteMany({ campId: id })
    return Camp.findByIdAndDelete(id)
  }

  static async listSessionsAdmin(campId: string) {
    await dbConnect()
    return CampSession.find({ campId }).sort({ startDate: 1 }).lean()
  }

  static async createSession(
    campId: string,
    data: {
      label: string
      startDate: Date
      endDate: Date
      capacity: number
      isPublished?: boolean
    }
  ) {
    await dbConnect()
    return CampSession.create({
      campId,
      soldCount: 0,
      reservedCount: 0,
      ...data,
    })
  }

  static async updateSession(
    id: string,
    data: Partial<{
      label: string
      startDate: Date
      endDate: Date
      capacity: number
      isPublished: boolean
    }>
  ) {
    await dbConnect()
    return CampSession.findByIdAndUpdate(id, { $set: data }, { new: true })
  }

  static async listTicketTypesAdmin(sessionId: string) {
    await dbConnect()
    return CampTicketType.find({ sessionId }).sort({ sortOrder: 1 }).lean()
  }

  static async createTicketType(
    sessionId: string,
    data: {
      name: string
      priceHuf: number
      pricingMode: "per_child" | "flat"
      isActive?: boolean
      sortOrder?: number
    }
  ) {
    await dbConnect()
    return CampTicketType.create({ sessionId, ...data })
  }

  static async updateTicketType(
    id: string,
    data: Partial<{
      name: string
      priceHuf: number
      pricingMode: "per_child" | "flat"
      isActive: boolean
      sortOrder: number
    }>
  ) {
    await dbConnect()
    return CampTicketType.findByIdAndUpdate(id, { $set: data }, { new: true })
  }

  static async listRegistrationsForSession(sessionId: string) {
    await dbConnect()
    return CampRegistration.find({ sessionId, status: "paid" })
      .sort({ paidAt: -1 })
      .lean()
  }

  static async getSessionExportContext(sessionId: string) {
    await dbConnect()
    const session = await CampSession.findById(sessionId).lean()
    if (!session) return null
    const camp = await Camp.findById(session.campId).lean()
    const registrations = await CampRegistration.find({ sessionId, status: "paid" }).lean()
    return {
      session,
      camp,
      registrations,
      sessionLabel: formatSessionLabel(session.label, session.startDate, session.endDate),
    }
  }
}
