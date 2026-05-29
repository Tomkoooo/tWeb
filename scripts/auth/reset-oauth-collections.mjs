#!/usr/bin/env node
/**
 * Clear Auth.js OAuth collections in the active DATABASE_URL database.
 * Use when Google login fails after switching to a fresh DB or copying data without accounts.
 *
 * Usage: node scripts/auth/reset-oauth-collections.mjs
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "../..")
try {
  const env = readFileSync(join(root, ".env"), "utf8")
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

const collections = ["users", "accounts", "sessions", "verification_tokens"]

await mongoose.connect(uri)
const db = mongoose.connection.db
for (const name of collections) {
  const exists = (await db.listCollections({ name }).toArray()).length > 0
  if (!exists) {
    console.log(`skip ${name} (missing)`)
    continue
  }
  const result = await db.collection(name).deleteMany({})
  console.log(`cleared ${name}: ${result.deletedCount} documents`)
}
await mongoose.disconnect()
console.log("Done. Restart npm run dev, then sign in with Google again.")
