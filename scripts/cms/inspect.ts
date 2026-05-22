#!/usr/bin/env npx tsx
/**
 * Inspect CMS state for a template (agent discovery).
 *
 * Usage:
 *   npm run cms:inspect -- --template=default-modern
 *   npm run cms:inspect -- --template=atelier-showcase --json
 */
import "dotenv/config"
import mongoose from "mongoose"
import { buildCmsInspectReport } from "./lib/build-inspect-report"

function parseArgs(argv: string[]) {
  let templateId: string | undefined
  let json = false

  for (const arg of argv) {
    if (arg === "--json") json = true
    else if (arg.startsWith("--template=")) templateId = arg.slice("--template=".length)
    else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npm run cms:inspect -- --template=<template-id> [--json]

Required:
  --template=<id>   Template to inspect (e.g. default-modern, atelier-showcase)

Options:
  --json            Machine-readable JSON (default: pretty-printed JSON)
`)
      process.exit(0)
    }
  }

  if (!templateId?.trim()) {
    console.error("Error: --template=<id> is required.")
    process.exit(1)
  }

  return { templateId: templateId.trim(), json }
}

async function main() {
  const { templateId, json } = parseArgs(process.argv.slice(2))
  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error("DATABASE_URL is not defined")
  }

  await mongoose.connect(uri)
  try {
    const report = await buildCmsInspectReport(templateId)
    const out = json ? JSON.stringify(report) : JSON.stringify(report, null, 2)
    console.log(out)
  } finally {
    await mongoose.connection.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
