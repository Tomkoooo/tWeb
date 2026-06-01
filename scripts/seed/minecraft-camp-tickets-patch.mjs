#!/usr/bin/env node
/**
 * Patch camp ticket types in place (normál inactive, laptop label) — no camp re-seed.
 *
 * Usage: node scripts/seed/minecraft-camp-tickets-patch.mjs
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const LAPTOP_ADDON_DESCRIPTION = "Laptop bérlés, 10 000 Ft/gyerek/turnus"

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

async function main() {
  const dbLabel = uri.includes("@") ? uri.replace(/\/\/[^@]+@/, "//***@") : uri
  console.log(`Connecting to ${dbLabel} …`)
  await mongoose.connect(uri)

  const col = mongoose.connection.db.collection("camptickettypes")

  const normalResult = await col.updateMany(
    { name: { $regex: /normál/i } },
    { $set: { isActive: false } }
  )
  const laptopResult = await col.updateMany(
    { name: { $regex: /laptop/i } },
    { $set: { description: LAPTOP_ADDON_DESCRIPTION } }
  )

  console.log("Ticket patches applied:")
  console.log(`  normál jegy deactivated: ${normalResult.modifiedCount} document(s)`)
  console.log(`  laptop description updated: ${laptopResult.modifiedCount} document(s)`)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
