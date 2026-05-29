#!/usr/bin/env node
/**
 * Seed demo camp data for DEPLOYMENT_KEY=minecraft-camp
 * Usage: DATABASE_URL=... node scripts/seed/minecraft-camp-demo.mjs
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "../..")
const envPath = join(root, ".env")
try {
  const env = readFileSync(envPath, "utf8")
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "")
  }
} catch {
  /* no .env */
}

const uri = process.env.DATABASE_URL
if (!uri) {
  console.error("DATABASE_URL required")
  process.exit(1)
}

const CampSchema = new mongoose.Schema(
  {
    slug: String,
    title: String,
    description: String,
    sortOrder: Number,
    isPublished: Boolean,
  },
  { timestamps: true }
)
const CampSessionSchema = new mongoose.Schema(
  {
    campId: mongoose.Schema.Types.ObjectId,
    label: String,
    startDate: Date,
    endDate: Date,
    capacity: Number,
    soldCount: Number,
    reservedCount: Number,
    isPublished: Boolean,
  },
  { timestamps: true }
)
const CampTicketTypeSchema = new mongoose.Schema(
  {
    sessionId: mongoose.Schema.Types.ObjectId,
    name: String,
    priceHuf: Number,
    pricingMode: String,
    isActive: Boolean,
    sortOrder: Number,
  },
  { timestamps: true }
)

async function main() {
  await mongoose.connect(uri)
  const Camp = mongoose.models.Camp || mongoose.model("Camp", CampSchema)
  const CampSession =
    mongoose.models.CampSession || mongoose.model("CampSession", CampSessionSchema)
  const CampTicketType =
    mongoose.models.CampTicketType || mongoose.model("CampTicketType", CampTicketTypeSchema)

  await Camp.deleteMany({ slug: "minecraft-nyar-2026" })
  const camp = await Camp.create({
    slug: "minecraft-nyar-2026",
    title: "Minecraft nyári tábor 2026",
    description:
      "Kreatív építés, csapatjáték és szabad játék professzionális felügyelet mellett.",
    sortOrder: 0,
    isPublished: true,
  })

  const sessions = [
    {
      label: "I. turnus",
      startDate: new Date("2026-07-07"),
      endDate: new Date("2026-07-11"),
      capacity: 24,
    },
    {
      label: "II. turnus",
      startDate: new Date("2026-07-14"),
      endDate: new Date("2026-07-18"),
      capacity: 24,
    },
  ]

  for (const s of sessions) {
    const session = await CampSession.create({
      campId: camp._id,
      ...s,
      soldCount: 0,
      reservedCount: 0,
      isPublished: true,
    })
    await CampTicketType.create([
      {
        sessionId: session._id,
        name: "Teljes turnus",
        priceHuf: 89000,
        pricingMode: "per_child",
        isActive: true,
        sortOrder: 0,
      },
      {
        sessionId: session._id,
        name: "Napi jegy (csak szerda)",
        priceHuf: 25000,
        pricingMode: "flat",
        isActive: true,
        sortOrder: 1,
      },
    ])
  }

  console.log("Seeded camp", camp._id.toString())
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
