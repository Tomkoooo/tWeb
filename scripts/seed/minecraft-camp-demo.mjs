#!/usr/bin/env node
/**
 * Seed minecraft-camp deployment (camp plugin + homepage CMS + email templates).
 *
 * Usage:
 *   node scripts/seed/minecraft-camp-demo.mjs
 *
 * Uses SEED_DB_URL when set, otherwise DATABASE_URL (loads .env from repo root).
 */
import mongoose from "mongoose"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { MINESHOW_FAQ as MINESHOW_FAQ_FALLBACK } from "./minecraft-camp-content.mjs"
import { fetchMineshowFaq } from "./lib/fetch-mineshow-faq.mjs"
import { seedMinecraftCampMedia } from "./lib/seed-media.mjs"

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

const CAMP_SLUG = "minecraft-nyar-2026"
const TEMPLATE_ID = "minecraft-camp"
const PAGE_KEY = "page:home"
const BRAND_NAME = "KockaKemp"
const CONTACT_EMAIL = "tabor@kockakemp.hu"

const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16512.43395838978!2d19.072352850677607!3d47.50229386689003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc85dbc2eaf5%3A0x4ae6f260ce6f87bf!2sR%C3%A9csei%20Center!5e0!3m2!1shu!2shu!4v1777970244559!5m2!1shu!2shu"

function buildSiteSeo(img) {
  return {
    siteTitle: "KockaKemp tábor | Minecraft napközis tábor Budapest",
    siteDescription:
      "KockaKemp — Minecraft nyári tábor zsDavval a Récsei Centerben. Programozás, MiniGame party, jelentkezés online.",
    favicon: img.logo,
    ogImage: img.heroMain,
    twitterImage: img.heroMain,
    defaultLocale: "hu_HU",
    robotsIndex: true,
    robotsFollow: true,
  }
}

/** Homepage CMS text/images — copy from https://mineshow.hu/tabor (camp sessions/tickets use separate spec below). */
const STORY_PARAGRAPH = `Napközis programozótábort indítunk, ahol a délelőttök a programozásról és alkotásról, a délutánok pedig a közös játékról szólnak – a szabadban és az online térben egyaránt, izgalmas, Minecraft-alapú party játékokkal.

Júliusban és augusztusban várjuk a 6–12 éves gyerekeket heti turnusokban, Budapesten, a 14. kerületi Récsei Centerben. A bejárós tábor során minden résztvevő a saját laptopján tanulja meg a Minecraft-modkészítés alapjait. A gyerekek modellező program segítségével új karaktereket alkotnak, megismerkednek pályageneráló eszközökkel, valamint belekóstolnak egy kifejezetten Minecraft-hoz optimalizált animációs programba is, amelyben saját kisfilmeket készítenek.

A gyerekek nemcsak csapatban tanulnak együttműködni, hanem önálló programozási készségeiket is fejlesztik. Délutánonként – a szabadtéri és sportprogramok mellett – MiniGame partykkal készülünk: lesz építőverseny, PvP-alapú harc, akadálypálya és túlélő kihívás is.

Célunk, hogy a nyári szünet ne csak szórakoztató, hanem hasznos is legyen.

Sztárvendégünk zsDav, aki a hét zárásaként egy játékos kvízzel méri fel a megszerzett tudást, emellett fotózásra és dedikálásra is lehetőség lesz.

Jelentkezz még ma, ne maradj le az élményről!`

const PRICING_PARAGRAPH = `A heti turnus 75 000 Ft-ba kerül gyerekenként. A testvéreknek 10% kedvezményt biztosítunk a normál jegyárból.

Június első hetében early bird kedvezménnyel 67 500 FT áron lehet jelentkezni. Jelentkezz még ma, ne maradj le az élményről!

Elfogadjuk mindhárom SZÉP-kártyát, bankkártyát, valamint készpénzes fizetésre is van lehetőség a belvárosi irodánkban.

Amennyiben szükséged van rá, tudsz tőlünk a turnus idejére laptopot kölcsönözni. Ezt a jegyek között 10 000 Ft/hét értékben megtalálod.

Lemondás esetén jegy árát 100%-ban visszafizetjük, a turnus előtt 2 héttel. Azt követően, a turnus kezdéséig a befizetett összeg 50%-át, a turnus alatt pedig a fennmaradó napok 30%-át.`

const PROGRAMS_HTML =
  "Meet & Greet zsDavval, Build Battle, Speed builedrs, BlockBench, Bedwars, Death Run, World Painter, Splegg, Guess my drawing, Mine lmator, Murder Mystery, Impostor Builders, Kahoot, UHC, Bingo survival, MINIGAME Party!"

function buildHomeContent(img, siteSeo, faq) {
  return {
    meta: {
      seoTitle: siteSeo.siteTitle,
      seoDescription: siteSeo.siteDescription,
    },
    blocks: [
      {
        id: "hero-mineshow",
        type: "hero",
        enabled: true,
        data: {
          title: "",
          description: "",
          primaryCtaLabel: "Jelentkezés",
          primaryCtaHref: "/jegyvasarlas",
          secondaryCtaLabel: "",
          secondaryCtaHref: "",
          heroImage: img.heroMain,
          heroImages: [img.heroMain, img.heroBanner],
          imageDurationSeconds: 4,
          heroDurationSeconds: 6,
          heroSlides: [],
          badges: ["Récsei Center, 2026 nyár"],
        },
      },
      {
        id: "story-zsdav",
        type: "about",
        enabled: true,
        data: {
          title: "Mineshow tábor zsDavval Budapesten",
          paragraph: STORY_PARAGRAPH,
          image: img.story,
          boxHeading: "Alkoss, játssz, programozz!",
          ctaLabel: "Jelentkezés",
          ctaHref: "/jegyvasarlas",
          bannerText: "Jelezd, hogy ott leszel, értesülj a friss infókról",
          accordions: [],
          cards: [],
        },
      },
      {
        id: "programs-intro",
        type: "richText",
        enabled: true,
        data: {
          title: "",
          html: PROGRAMS_HTML,
        },
      },
      {
        id: "programs-gallery",
        type: "gallery",
        enabled: true,
        data: {
          title: "Programok",
          items: [
            { image: img.programBedwars, caption: "Bedwars" },
            { image: img.programMurder, caption: "Murder Mystery" },
            { image: img.programMineimator, caption: "Mine-imator" },
            { image: img.programBuildBattle, caption: "Build Battle" },
            { image: img.programUhc, caption: "UHC verseny" },
            { image: img.programDeathRun, caption: "Death Run" },
          ],
        },
      },
      {
        id: "pricing-info",
        type: "about",
        enabled: true,
        data: {
          title: "Árak és fizetés",
          paragraph: PRICING_PARAGRAPH,
          accordions: [],
          cards: [],
        },
      },
      {
        id: "faq-mineshow",
        type: "about",
        enabled: true,
        data: {
          title: "Gyakori Kérdések",
          paragraph: "",
          accordions: faq,
          cards: [],
        },
      },
      {
        id: "contact-venue",
        type: "contact",
        enabled: true,
        data: {
          title: "Récsei Center, 1146 Budapest, Istvánmezei út 6.",
          description: "",
          companyName: "PlayIT Entertainment Kft.",
          address: "Récsei Center, 1146 Budapest, Istvánmezei út 6.",
          venueShort: "Récsei Center, 2026 nyár",
          mapEmbedUrl: DEFAULT_MAP_EMBED,
          phone: "",
          email: CONTACT_EMAIL,
        },
      },
    ],
  }
}

const CAMP_REGISTRATION_EMAIL_BODY = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h1 style="text-transform:uppercase;">Köszönjük a jelentkezést!</h1>
          <p>Kedves {{buyerName}},</p>
          <p>Örülünk, hogy részt veszel napközis, KockaKemp táborunkban. Jelentkezésed ezzel a jeggyel végleges.</p>
          <p>Várunk a tábor első napján 8:00 – 9:00 között a Récsei Center, 1146 Budapest, Istvánmezei út 6., Remíz Darts klubban.</p>
          <div style="background:#f4f4f4;padding:15px;margin:20px 0;">
            <p><strong>Tábor:</strong> {{campTitle}}</p>
            <p><strong>Turnus:</strong> {{sessionLabel}}</p>
            <p><strong>Jegytípus:</strong> {{ticketTypeName}}</p>
            <p><strong>Gyerekek száma:</strong> {{childCount}}</p>
            <p><strong>Fizetett összeg:</strong> {{totalHuf}} Ft</p>
          </div>
          <p>Regisztráció azonosító: {{registrationId}}</p>
          <p style="font-size:12px;color:#666;">Ez egy automatikus üzenet. Kérdés esetén írj a weboldal kapcsolatfelvételi űrlapján.</p>
        </div>
      `.trim()

const CampPricingSettingsSchema = new mongoose.Schema(
  {
    multiChildDiscountPercent: { type: Number, default: 0 },
    multiChildMinCount: { type: Number, default: 2 },
    siblingDiscountPercent: { type: Number, default: 0 },
    siblingMatchByLastName: { type: Boolean, default: true },
  },
  { _id: false }
)

const CampSchema = new mongoose.Schema(
  {
    slug: String,
    title: String,
    description: String,
    heroImage: String,
    sortOrder: Number,
    isPublished: Boolean,
    pricingSettings: { type: CampPricingSettingsSchema, default: () => ({}) },
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
    description: String,
    priceHuf: Number,
    pricingMode: String,
    kind: { type: String, enum: ["base", "addon"], default: "base" },
    earlyBirdEndsAt: Date,
    earlyBirdPriceHuf: Number,
    earlyBirdDiscountPercent: Number,
    isActive: Boolean,
    sortOrder: Number,
  },
  { timestamps: true }
)

const TemplateContentSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, index: true },
    pageKey: { type: String, required: true },
    value: { type: String, required: true },
    draftValue: { type: String },
    updatedBy: { type: String },
    publishedAt: { type: Date },
    publishedBy: { type: String },
  },
  { timestamps: true }
)
TemplateContentSchema.index({ templateId: 1, pageKey: 1 }, { unique: true })

const BrandingSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "branding" },
    brandName: { type: String, default: "Generic Webshop" },
    logoNav: { type: String, default: "/generic-logo.svg" },
    logoFooter: { type: String, default: "/generic-logo.svg" },
    logoHero: { type: String, default: "/generic-hero.svg" },
  },
  { timestamps: true }
)

const SeoSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "seo" },
    siteTitle: { type: String, default: "Generic Webshop" },
    siteDescription: { type: String, default: "" },
    favicon: { type: String, default: "/generic-favicon.svg" },
    ogImage: { type: String, default: "/generic-hero.svg" },
    twitterImage: { type: String, default: "/generic-hero.svg" },
    defaultLocale: { type: String, default: "en_US" },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
    canonicalBaseUrl: { type: String, default: "" },
  },
  { timestamps: true }
)

const ShopContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    section: { type: String, required: true },
  },
  { timestamps: true }
)

const EmailTemplateSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    description: { type: String },
    variables: [{ type: String }],
    tags: { type: [String], default: [] },
    pluginId: { type: String, default: null },
  },
  { timestamps: true }
)

function formatHuDate(d) {
  const x = d instanceof Date ? d : new Date(d)
  const y = x.getUTCFullYear()
  const m = String(x.getUTCMonth() + 1).padStart(2, "0")
  const day = String(x.getUTCDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

function ticketTypesForSession(sessionId, label, startDate, endDate) {
  const turnusDates = `${formatHuDate(startDate)}–${formatHuDate(endDate)}`
  return [
    {
      sessionId,
      name: `${label} — early bird jegy`,
      description: `Elérhető 2026.06.01–06.07 23:59-ig, max 34 db. ${turnusDates}, 67 500 Ft.`,
      priceHuf: 67500,
      pricingMode: "per_child",
      kind: "base",
      isActive: true,
      sortOrder: 0,
    },
    {
      sessionId,
      name: `${label} — normál jegy`,
      description:
        "Elérhető 2026.06.08 0:00-tól (készlet = 34 − eladott early bird) a készlet erejéig. 75 000 Ft.",
      priceHuf: 75000,
      pricingMode: "per_child",
      kind: "base",
      isActive: true,
      sortOrder: 1,
    },
    {
      sessionId,
      name: `${label} — testvér jegy`,
      description: "Elérhető 2026.06.01-től, max 6 db. 67 500 Ft.",
      priceHuf: 67500,
      pricingMode: "per_child",
      kind: "base",
      isActive: true,
      sortOrder: 2,
    },
    {
      sessionId,
      name: `${label} — laptop bérlés`,
      description: "Elérhető 2026.06.01-től, max 10 db. 10 000 Ft.",
      priceHuf: 10000,
      pricingMode: "per_child",
      kind: "addon",
      isActive: true,
      sortOrder: 10,
    },
  ]
}

async function removeExistingCamp(Camp, CampSession, CampTicketType) {
  const existing = await Camp.findOne({ slug: CAMP_SLUG })
  if (!existing) return
  const sessionIds = await CampSession.find({ campId: existing._id }).distinct("_id")
  if (sessionIds.length > 0) {
    await CampTicketType.deleteMany({ sessionId: { $in: sessionIds } })
  }
  await CampSession.deleteMany({ campId: existing._id })
  await Camp.deleteOne({ _id: existing._id })
}

/** Camp plugin data — operator spec (not sourced from mineshow.hu). */
async function seedCamp(Camp, CampSession, CampTicketType, img) {
  await removeExistingCamp(Camp, CampSession, CampTicketType)

  const camp = await Camp.create({
    slug: CAMP_SLUG,
    title: "Minecraft nyári tábor 2026",
    description:
      "KockaKemp napközis tábor — turnusok, early bird / normál / testvér jegyek, laptop bérlés.",
    heroImage: img.heroMain,
    sortOrder: 0,
    isPublished: true,
    pricingSettings: {
      multiChildDiscountPercent: 0,
      multiChildMinCount: 2,
      siblingDiscountPercent: 0,
      siblingMatchByLastName: true,
    },
  })

  const sessions = [
    {
      label: "1. turnus",
      startDate: new Date("2026-07-20T00:00:00.000Z"),
      endDate: new Date("2026-07-24T23:59:59.000Z"),
      capacity: 34,
    },
    {
      label: "2. turnus",
      startDate: new Date("2026-07-27T00:00:00.000Z"),
      endDate: new Date("2026-07-31T23:59:59.000Z"),
      capacity: 34,
    },
    {
      label: "3. turnus",
      startDate: new Date("2026-07-27T00:00:00.000Z"),
      endDate: new Date("2026-07-31T23:59:59.000Z"),
      capacity: 34,
    },
  ]

  let ticketCount = 0
  for (const s of sessions) {
    const session = await CampSession.create({
      campId: camp._id,
      ...s,
      soldCount: 0,
      reservedCount: 0,
      isPublished: true,
    })
    const tickets = ticketTypesForSession(session._id, s.label, s.startDate, s.endDate)
    await CampTicketType.insertMany(tickets)
    ticketCount += tickets.length
  }

  return { campId: camp._id.toString(), sessionCount: sessions.length, ticketCount }
}

async function seedCampPageContent(TemplateContent, pageKey, valueObj) {
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
      publishedBy: "seed:minecraft-camp-demo",
    },
    { upsert: true, returnDocument: "after" }
  )
}

async function seedCampPages(TemplateContent) {
  await seedCampPageContent(TemplateContent, "page:jegyvasarlas", {
    pageTitle: "Jegyvásárlás",
    pageIntro:
      "Válassz turnust és jegytípust, add meg a vásárló és gyerek adatait, majd fizesd ki a foglalást biztonságosan online.",
    meta: { seoTitle: "Jegyvásárlás", seoDescription: "" },
  })
  await seedCampPageContent(TemplateContent, "page:foglalas", {
    stepOffers: "Ajánlatok",
    stepDetails: "Adatok megadása",
    stepReview: "Áttekintés",
    ticketsHeading: "Jegyek, bérletek",
    ticketTypeLabel: "Jegytípus",
    childCountLabel: "Gyerekek száma",
    addonsHint:
      "Kiegészítők (pl. laptop bérlés) a következő lépésben választhatók gyerekenként.",
    buyerHeading: "Kapcsolattartó",
    childrenHeading: "Gyerekek adatai",
    payCta: "Tovább a fizetéshez",
    reviewHeading: "Áttekintés",
    payStripeCta: "Fizetés Stripe-on",
    payStripeLoading: "Átirányítás…",
    backLabel: "Vissza",
    nextLabel: "Tovább",
    venueAddress: "Récsei Center Remíz Darts klub, Budapest, Istvánmezei út 6., 1146",
    meta: { seoTitle: "Foglalás", seoDescription: "" },
  })
  await seedCampPageContent(TemplateContent, "page:foglalas-siker", {
    loadingText: "Fizetés ellenőrzése…",
    successTitle: "Sikeres foglalás!",
    successBody: "Köszönjük! Visszaigazolást küldünk emailben. Azonosító: {registrationId}",
    successCta: "Vissza a főoldalra",
    errorBody:
      "Nem sikerült megerősíteni a fizetést. Ha levonták az összeget, írjon nekünk.",
    errorCta: "Főoldal",
    meta: { seoTitle: "Sikeres foglalás", seoDescription: "" },
  })
}

async function seedHomepageCms(TemplateContent, img, siteSeo, faq) {
  const homeJson = JSON.stringify(buildHomeContent(img, siteSeo, faq))
  const now = new Date()
  await TemplateContent.findOneAndUpdate(
    { templateId: TEMPLATE_ID, pageKey: PAGE_KEY },
    {
      templateId: TEMPLATE_ID,
      pageKey: PAGE_KEY,
      value: homeJson,
      draftValue: homeJson,
      publishedAt: now,
      publishedBy: "seed:minecraft-camp-demo",
    },
    { upsert: true, returnDocument: "after" }
  )
}

async function seedBranding(BrandingSetting, img) {
  await BrandingSetting.findOneAndUpdate(
    { key: "branding" },
    {
      key: "branding",
      brandName: BRAND_NAME,
      logoNav: img.logo,
      logoFooter: img.logo,
      logoHero: img.heroMain,
    },
    { upsert: true, returnDocument: "after" }
  )
}

async function seedSeo(SeoSetting, siteSeo) {
  await SeoSetting.findOneAndUpdate(
    { key: "seo" },
    { key: "seo", ...siteSeo },
    { upsert: true, returnDocument: "after" }
  )
}

async function seedContactEmails(ShopContent) {
  const contactEmailsJson = JSON.stringify([
    { id: "tabor", label: "Tábor jelentkezés", email: CONTACT_EMAIL },
  ])
  await ShopContent.findOneAndUpdate(
    { key: "contact_emails" },
    {
      key: "contact_emails",
      value: contactEmailsJson,
      section: "contact",
    },
    { upsert: true, returnDocument: "after" }
  )
  await ShopContent.findOneAndUpdate(
    { key: "contact_email" },
    {
      key: "contact_email",
      value: CONTACT_EMAIL,
      section: "contact",
    },
    { upsert: true, returnDocument: "after" }
  )
}

async function seedEmailTemplate(EmailTemplate) {
  await EmailTemplate.findOneAndUpdate(
    { type: "camp_registration_confirmation" },
    {
      type: "camp_registration_confirmation",
      pluginId: "camp-booking",
      tags: ["camp-booking", "transactional", "registration"],
      subject: "KockaKemp — tábor jelentkezés visszaigazolása ({{sessionLabel}})",
      body: CAMP_REGISTRATION_EMAIL_BODY,
      description:
        "Tábor foglalás — vásárló e-mail Stripe fizetés után (KockaKemp / Mineshow).",
      variables: [
        "buyerName",
        "buyerEmail",
        "campTitle",
        "sessionLabel",
        "ticketTypeName",
        "childCount",
        "totalHuf",
        "registrationId",
      ],
    },
    { upsert: true, returnDocument: "after" }
  )
}

async function main() {
  const dbLabel = uri.includes("@") ? uri.replace(/\/\/[^@]+@/, "//***@") : uri
  console.log(`Connecting to ${dbLabel} ...`)
  await mongoose.connect(uri)

  const Camp = mongoose.models.Camp || mongoose.model("Camp", CampSchema)
  const CampSession =
    mongoose.models.CampSession || mongoose.model("CampSession", CampSessionSchema)
  const CampTicketType =
    mongoose.models.CampTicketType || mongoose.model("CampTicketType", CampTicketTypeSchema)
  const TemplateContent =
    mongoose.models.TemplateContent ||
    mongoose.model("TemplateContent", TemplateContentSchema)
  const EmailTemplate =
    mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", EmailTemplateSchema)
  const BrandingSetting =
    mongoose.models.BrandingSetting ||
    mongoose.model("BrandingSetting", BrandingSettingSchema)
  const SeoSetting =
    mongoose.models.SeoSetting || mongoose.model("SeoSetting", SeoSettingSchema)
  const ShopContent =
    mongoose.models.ShopContent || mongoose.model("ShopContent", ShopContentSchema)

  let faq = MINESHOW_FAQ_FALLBACK
  try {
    faq = await fetchMineshowFaq()
    console.log(`FAQ: ${faq.length} items from mineshow.hu/tabor`)
  } catch (err) {
    console.warn(
      `FAQ: could not fetch mineshow.hu/tabor (${err instanceof Error ? err.message : err}) — using bundled fallback`
    )
  }

  console.log("Uploading camp images to MongoDB media collection …")
  const IMG = await seedMinecraftCampMedia(root)
  const siteSeo = buildSiteSeo(IMG)

  const campResult = await seedCamp(Camp, CampSession, CampTicketType, IMG)
  await seedBranding(BrandingSetting, IMG)
  await seedSeo(SeoSetting, siteSeo)
  await seedContactEmails(ShopContent)
  await seedHomepageCms(TemplateContent, IMG, siteSeo, faq)
  await seedCampPages(TemplateContent)
  await seedEmailTemplate(EmailTemplate)

  console.log("Seeded minecraft-camp deployment:")
  console.log(`  Camp: ${campResult.campId} (${CAMP_SLUG})`)
  console.log(`  Sessions: ${campResult.sessionCount}, ticket types: ${campResult.ticketCount}`)
  console.log(`  Branding: ${BRAND_NAME}, logos ${IMG.logo}`)
  console.log(`  SEO: favicon + OG ${siteSeo.favicon}`)
  console.log(`  Contact: ${CONTACT_EMAIL}`)
  console.log(
    `  CMS: ${TEMPLATE_ID} / ${PAGE_KEY} (published + draft; FAQ: ${faq.length} accordions)`
  )
  console.log("  Email: camp_registration_confirmation")

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
