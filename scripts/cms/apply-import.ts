#!/usr/bin/env npx tsx
/**
 * Apply agent-prepared CMS import payload (validated, written as draft).
 *
 * Usage:
 *   npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json
 *   npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json --publish
 *   npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json --dry-run
 */
import "dotenv/config"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import { cmsImportPayloadSchema } from "./lib/payload-schema"
import { applyCmsImportPayload } from "./lib/apply-payload"

function parseArgs(argv: string[]) {
  let templateId: string | undefined
  let payloadPath: string | undefined
  let publish = false
  let dryRun = false

  for (const arg of argv) {
    if (arg === "--publish") publish = true
    else if (arg === "--dry-run") dryRun = true
    else if (arg.startsWith("--template=")) templateId = arg.slice("--template=".length)
    else if (arg.startsWith("--payload=")) payloadPath = arg.slice("--payload=".length)
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run cms:apply-import -- --template=<id> --payload=<file> [options]

Required:
  --template=<id>     Target template (must match what the user specified)
  --payload=<file>    JSON file (see scripts/imports/payload.example.json)

Options:
  --publish           Publish each page after saving (default: draft only)
  --dry-run           Validate and print plan without writing to MongoDB

Workflow:
  1. User pastes copy in scripts/imports/customer-copy.txt
  2. Agent runs: npm run cms:inspect -- --template=<id>
  3. Agent writes payload JSON from customer copy + inspect report
  4. Agent runs this script (add --publish when user confirms go-live)
`)
      process.exit(0)
    }
  }

  if (!templateId?.trim()) {
    console.error("Error: --template=<id> is required.")
    process.exit(1)
  }
  if (!payloadPath?.trim()) {
    console.error("Error: --payload=<file> is required.")
    process.exit(1)
  }

  return {
    templateId: templateId.trim(),
    payloadPath: path.resolve(payloadPath.trim()),
    publish,
    dryRun,
  }
}

async function main() {
  const { templateId, payloadPath, publish, dryRun } = parseArgs(process.argv.slice(2))
  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error("DATABASE_URL is not defined")
  }

  if (!fs.existsSync(payloadPath)) {
    throw new Error(`Payload file not found: ${payloadPath}`)
  }

  const raw = JSON.parse(fs.readFileSync(payloadPath, "utf8"))
  const payload = cmsImportPayloadSchema.parse({
    ...raw,
    publish: raw.publish ?? publish,
  })

  await mongoose.connect(uri)
  try {
    const result = await applyCmsImportPayload({
      templateId,
      payload,
      dryRun,
    })

    console.log(
      dryRun
        ? "[dry-run] Validation OK — no database writes."
        : "[applied] Draft saved to TemplateContent."
    )
    console.log(JSON.stringify(result, null, 2))
    if (!dryRun && !payload.publish) {
      console.log(
        "\nDraft only. Review at /admin/cms and publish from the UI, or re-run with --publish."
      )
    }
  } finally {
    await mongoose.connection.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
