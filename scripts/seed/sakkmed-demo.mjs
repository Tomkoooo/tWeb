#!/usr/bin/env node
/**
 * Seed sakkmed deployment (homepage CMS + static pages + branding).
 *
 * Usage:
 *   node scripts/seed/sakkmed-demo.mjs
 *
 * Uses SEED_DB_URL when set, otherwise DATABASE_URL (loads .env from repo root).
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { seedSakkmedMediaAssets } from "./lib/sakkmed-public-assets.mjs"
import { STATIC_PAGE_SLUGS } from "./sakkmed-constants.mjs"
import { buildSakkmedHomeContent, buildSakkmedStaticPages } from "./sakkmed-content.mjs"

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

const TEMPLATE_ID = "sakkmed"
const BRAND_NAME = "SAKKMED 2005 Kft."
const CONTACT_EMAIL = "balazs.gabor@esemenyszervezes.hu"

async function seedMedia() {
  console.log("Uploading SAKKMED images to database (media collection) …")
  return seedSakkmedMediaAssets()
}

const TemplateContentSchema = new mongoose.Schema(
  {
    templateId: String,
    pageKey: String,
    value: String,
    draftValue: String,
    publishedAt: Date,
    publishedBy: String,
  },
  { timestamps: true }
)

const BrandingSettingSchema = new mongoose.Schema(
  { key: String, brandName: String, logoNav: String, logoFooter: String, logoHero: String },
  { timestamps: true }
)

const SeoSettingSchema = new mongoose.Schema(
  {
    key: String,
    siteTitle: String,
    siteDescription: String,
    favicon: String,
    ogImage: String,
    twitterImage: String,
    defaultLocale: String,
    robotsIndex: Boolean,
    robotsFollow: Boolean,
  },
  { timestamps: true }
)

const ShopContentSchema = new mongoose.Schema(
  { key: String, value: String, section: String },
  { timestamps: true }
)

const ActiveTemplateSchema = new mongoose.Schema(
  { key: String, templateId: String, activatedAt: Date, activatedBy: String },
  { timestamps: true }
)


async function upsertTemplateContent(TemplateContent, pageKey, valueObj) {
  const json = JSON.stringify(valueObj)
  const now = new Date()
  await TemplateContent.findOneAndUpdate(
    { templateId: TEMPLATE_ID, pageKey },
    {
      templateId: TEMPLATE_ID,
      pageKey,
      value: json,
      draftValue: json,
      publishedAt: now,
      publishedBy: "seed:sakkmed-demo",
    },
    { upsert: true }
  )
}

async function main() {
  const dbLabel = uri.includes("@") ? uri.replace(/\/\/[^@]+@/, "//***@") : uri
  console.log(`Connecting to ${dbLabel} …`)
  await mongoose.connect(uri)

  const TemplateContent =
    mongoose.models.TemplateContent || mongoose.model("TemplateContent", TemplateContentSchema)
  const BrandingSetting =
    mongoose.models.BrandingSetting || mongoose.model("BrandingSetting", BrandingSettingSchema)
  const SeoSetting = mongoose.models.SeoSetting || mongoose.model("SeoSetting", SeoSettingSchema)
  const ShopContent =
    mongoose.models.ShopContent || mongoose.model("ShopContent", ShopContentSchema)
  const ActiveTemplate =
    mongoose.models.ActiveTemplate || mongoose.model("ActiveTemplate", ActiveTemplateSchema)

  const { urls, pages: crawledPages } = await seedMedia()
  const home = buildSakkmedHomeContent(urls)
  const staticPages = buildSakkmedStaticPages(urls, crawledPages)

  await upsertTemplateContent(TemplateContent, "page:home", home)
  for (const slug of STATIC_PAGE_SLUGS) {
    await upsertTemplateContent(TemplateContent, `page:${slug}`, staticPages[slug])
  }

  await BrandingSetting.findOneAndUpdate(
    { key: "branding" },
    {
      key: "branding",
      brandName: BRAND_NAME,
      logoNav: urls.logo,
      logoFooter: urls.logo,
      logoHero: urls.hero1,
    },
    { upsert: true }
  )

  await SeoSetting.findOneAndUpdate(
    { key: "seo" },
    {
      key: "seo",
      siteTitle: home.meta.seoTitle,
      siteDescription: home.meta.seoDescription,
      favicon: urls.logo,
      ogImage: urls.hero1,
      twitterImage: urls.hero1,
      defaultLocale: "hu_HU",
      robotsIndex: true,
      robotsFollow: true,
    },
    { upsert: true }
  )

  const contactEmailsJson = JSON.stringify([
    { id: "general", label: "Általános megkeresés", email: CONTACT_EMAIL },
  ])
  await ShopContent.findOneAndUpdate(
    { key: "contact_emails" },
    { key: "contact_emails", value: contactEmailsJson, section: "contact" },
    { upsert: true }
  )
  await ShopContent.findOneAndUpdate(
    { key: "contact_email" },
    { key: "contact_email", value: CONTACT_EMAIL, section: "contact" },
    { upsert: true }
  )

  await ActiveTemplate.findOneAndUpdate(
    { $or: [{ key: "active" }, { templateId: TEMPLATE_ID }] },
    {
      key: "active",
      templateId: TEMPLATE_ID,
      templateVersion: "1.0.0",
      activatedAt: new Date(),
      activatedBy: "seed:sakkmed-demo",
    },
    { upsert: true }
  )

  console.log("Seeded sakkmed deployment:")
  console.log(`  Template: ${TEMPLATE_ID} (active)`)
  console.log(`  CMS: page:home + ${STATIC_PAGE_SLUGS.length} static pages`)
  console.log(`  Branding: ${BRAND_NAME}`)
  console.log(`  Contact: ${CONTACT_EMAIL}`)
  console.log("Set DEPLOYMENT_KEY=sakkmed and ENABLE_SHOP=false in your environment.")

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
