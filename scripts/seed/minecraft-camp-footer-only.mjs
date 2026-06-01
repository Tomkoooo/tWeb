#!/usr/bin/env node
/**
 * Upsert minecraft-camp footer settings only (safe when camp data must be preserved).
 *
 * Usage: node scripts/seed/minecraft-camp-footer-only.mjs
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { buildMinecraftCampFooterDoc } from "./lib/minecraft-camp-footer.mjs"

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

const uri = process.env.SEED_DB_URL || process.env.DATABASE_URL
if (!uri) {
  console.error("SEED_DB_URL or DATABASE_URL required")
  process.exit(1)
}

const FooterSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    tagline: String,
    quickLinksTitle: String,
    quickLinks: [{ label: String, href: String }],
    categoriesTitle: String,
    browseProductsLabel: String,
    contactTitle: String,
    newsletterLabel: String,
    newsletterPlaceholder: String,
    copyrightText: String,
    socialLinks: [
      {
        platform: { type: String, enum: ["facebook", "instagram", "twitter", "youtube"] },
        enabled: Boolean,
        url: String,
      },
    ],
    organizerSection: {
      title: String,
      companyName: String,
      registeredAddress: String,
      mailingAddress: String,
      openingHours: String,
    },
    paymentMethodsNote: String,
  },
  { timestamps: true, strict: false }
)

async function main() {
  const dbLabel = uri.includes("@") ? uri.replace(/\/\/[^@]+@/, "//***@") : uri
  console.log(`Connecting to ${dbLabel} …`)
  await mongoose.connect(uri)

  const FooterSetting =
    mongoose.models.FooterSetting || mongoose.model("FooterSetting", FooterSettingSchema)

  const doc = buildMinecraftCampFooterDoc()
  await FooterSetting.findOneAndUpdate({ key: "footer" }, { $set: doc }, { upsert: true })

  console.log("Footer settings updated:")
  console.log(`  organizer: ${doc.organizerSection.title}`)
  console.log(`  quickLinks: ${doc.quickLinks.map((l) => l.label).join(", ")}`)
  console.log(`  facebook: ${doc.socialLinks[0].url.slice(0, 48)}…`)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
