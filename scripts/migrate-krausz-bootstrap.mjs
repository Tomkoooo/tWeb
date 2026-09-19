/**
 * One-off bootstrap for a Krausz database on the krausz-classic template:
 *
 * 1) Marks krausz-classic as the active template (`activetemplates` collection,
 *    key "active"). Without this row, TemplateService falls back to the LEGACY
 *    deployments.config.json "default" deployment's defaultTemplateId
 *    (default-modern) — completely ignoring the v2 site app's own baked
 *    WSE_SITE_CONFIG_JSON.templateId. That fallback is why the storefront can
 *    render with default-modern's theme (near-identical to krausz-classic's
 *    except accent, which is why only the accent looked wrong) even though
 *    apps/krausz is wired to krausz-classic.
 * 2) Reads the legacy per-key ShopContent fields (hero_title, hero_description,
 *    story_title, story_content, story_accordions, contact_email/phone/address)
 *    and writes them as a proper homepage-cms snapshot (same ShopContent
 *    collection, new keys homepage_snapshot_published/_draft) so the real DB
 *    content — not the template's static defaultContent.ts fallback — is what
 *    the live site shows.
 * 3) Clears any theme override accidentally saved under the wrong
 *    (default-modern) template key while step 1 hadn't run yet, so the
 *    storefront falls back cleanly to krausz-classic's baked-in theme.ts.
 *
 * Usage: node scripts/migrate-krausz-bootstrap.mjs "mongodb://host:27017/dbname"
 */
import { MongoClient } from "mongodb"

const TEMPLATE_ID = "krausz-classic"
const TEMPLATE_VERSION = "1.0.0"

const DEFAULT_ACCORDIONS = [
  {
    title: "Küldetésünk: erő és precizitás",
    content:
      "Nem csak szerszámokat adunk el; eszközöket biztosítunk az építéshez és az alkotáshoz. Minden darabot úgy tesztelünk, hogy kibírja a legextrémebb ipari igénybevételt is.",
  },
  {
    title: "Krausz minőségi ígéret",
    content:
      "Szerszámaink magas széntartalmú acélból készülnek, ergonomikus markolattal. Ha Krausz szerszámot fogsz a kezedben, azonnal érzed a különbséget a tömegtermék és a mestermunka között.",
  },
  {
    title: "Innovatív fejlesztések",
    content:
      "Folyamatosan keressük az új technológiákat, legyen szó rezgéscsillapításról vagy intelligens akkumulátor kezelésről, hogy munkád hatékonyabb legyen.",
  },
]

function buildSnapshot(shopContent) {
  const get = (key, fallback = "") => {
    const v = shopContent[key]
    return typeof v === "string" && v.trim() ? v : fallback
  }

  let accordions = DEFAULT_ACCORDIONS
  const rawAccordions = shopContent.story_accordions
  if (typeof rawAccordions === "string" && rawAccordions.trim()) {
    try {
      const parsed = JSON.parse(rawAccordions)
      if (Array.isArray(parsed) && parsed.length > 0) accordions = parsed
    } catch {
      /* keep default */
    }
  }

  return {
    meta: {
      seoTitle: get("shop_seo_title", "Webshop | Krausz Barkácsmester"),
      seoDescription: get(
        "shop_seo_description",
        "Válogasson prémium szerszámaink és ipari gépeink közül. Krausz - A minőség garanciája."
      ),
    },
    blocks: [
      {
        id: "hero-krausz",
        type: "hero",
        enabled: true,
        data: {
          title: get("hero_title", "Mestermunka a kezedben"),
          description: get(
            "hero_description",
            "Kiváló minőségű kalapácsok, csavarkulcsok és elektromos szerszámok a modern mesterembernek. Fedezd fel a Krausz minőséget!"
          ),
          primaryCtaLabel: "Irány a bolt",
          primaryCtaHref: "/shop",
          secondaryCtaLabel: "Rólunk",
          secondaryCtaHref: "#about",
          heroImage: "/generic-hero.svg",
          heroImages: ["/generic-hero.svg"],
          imageDurationSeconds: 4,
          heroDurationSeconds: 6,
          heroSlides: [],
          badges: ["Prémium minőség", "Garanciavállalás", "Gyors szállítás"],
        },
      },
      {
        id: "about-krausz",
        type: "about",
        enabled: true,
        data: {
          title: get("story_title", "A Krausz Örökség"),
          paragraph: get(
            "story_content",
            "Családi vállalkozásunk több mint 50 éve elkötelezett a minőségi szerszámok gyártása mellett. Minden darab, ami kikerül a kezünk közül, a precizitás és a tartósság jegyében készül. Hiszünk abban, hogy a jó munka alapja a kiváló szerszám."
          ),
          accordions,
          cards: [
            { title: "Biztonság", description: "Maximális védelem a legveszélyesebb munkák során is.", icon: "Shield" },
            { title: "Mesterség", description: "Minden kalapácsütésnél érezhető szakértelem.", icon: "Hammer" },
            { title: "Közösség", description: "Több ezer elégedett magyar mesterember bizalma.", icon: "Users" },
            { title: "Okos tervezés", description: "Ergonómia, ami kíméli az ízületeket hosszú távon.", icon: "Lightbulb" },
          ],
        },
      },
      {
        id: "features-krausz",
        type: "features",
        enabled: true,
        data: {
          title: "A Krausz előny",
          subtitle: "Amiért mesteremberek ezrei választják a Krausz szerszámokat.",
          cards: [
            { title: "Maximális teljesítmény", description: "Nagy teljesítményű és nehéz feladatokra tervezett ipari eszközök.", icon: "Zap" },
            { title: "Vaskezű garancia", description: "Élettartam garanciát vállalunk minden mester-szériás szerszámunkra.", icon: "ShieldCheck" },
            { title: "Villámgyors szállítás", description: "Szerszámaid 24 órán belül útnak indulnak a budapesti központunkból.", icon: "Truck" },
            { title: "Mester szaktanács", description: "Beszélj profi szakembereinkkel, ha nem tudod melyik szerszám a legjobb neked.", icon: "Headphones" },
            { title: "Mérnöki precizitás", description: "Minden darab tizedmilliméter pontosan illeszkedik a feladathoz.", icon: "Wrench" },
            { title: "Ipari minősítés", description: "Szigorú teszteknek vetjük alá minden termékünket, hogy bírhassák a gyűrődést.", icon: "Award" },
          ],
        },
      },
      {
        id: "products-krausz",
        type: "productGrid",
        enabled: true,
        data: {
          title: "Válogass szerszámaink közül",
          description: "Prémium szerszámok és ipari gépek — a minőség garanciája.",
          viewAllLabel: "Az összes termék",
          viewAllHref: "/shop",
          categoriesTitle: "Kiemelt kategóriák",
          categoriesDescription: "A legnépszerűbb kategóriáink, amelyekkel mestereink dolgoznak.",
          layout: "grid",
          maxItems: 8,
          selectedProductIds: [],
        },
      },
      {
        id: "testimonials-krausz",
        type: "testimonials",
        enabled: true,
        data: {
          title: "Amit a mestereink mondanak",
          subtitle: "Valódi vásárlói vélemények jelennek meg itt, amint beérkeznek.",
          items: [],
        },
      },
      {
        id: "contact-krausz",
        type: "contact",
        enabled: true,
        data: {
          title: "Lépj velünk kapcsolatba",
          description:
            "Kérdésed van a szerszámokkal kapcsolatban? Egyedi projekthez keresel megoldást? Szakértő csapatunk készen áll a segítségre.",
          companyName: "Krausz Barkácsmester",
          address: get("contact_address", "8000 Székesfehérvár szárcsa utca 31."),
          phone: get("contact_phone", "+36307890399"),
          email: get("contact_email", "krauszbarkacs@gmail.com"),
          sendButtonLabel: "Üzenet küldése",
          nameLabel: "Teljes név",
          emailLabel: "E-mail cím",
          messageLabel: "Üzenet",
        },
      },
    ],
  }
}

async function main() {
  const uri = process.argv[2]
  if (!uri) {
    console.error("Usage: node scripts/migrate-krausz-bootstrap.mjs <mongodb-uri-with-db>")
    process.exit(1)
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
  await client.connect()
  const db = client.db()

  const activeRes = await db.collection("activetemplates").updateOne(
    { key: "active" },
    {
      $set: {
        key: "active",
        templateId: TEMPLATE_ID,
        templateVersion: TEMPLATE_VERSION,
        activatedAt: new Date(),
        activatedBy: "migration",
      },
    },
    { upsert: true }
  )
  console.log(`active template: ${activeRes.upsertedCount ? "created" : "updated"} -> ${TEMPLATE_ID}`)

  const staleThemeRes = await db
    .collection("themesettings")
    .deleteMany({ key: { $in: ["theme:default-modern", "theme"] } })
  if (staleThemeRes.deletedCount) {
    console.log(`removed ${staleThemeRes.deletedCount} stale theme override(s) saved before activation`)
  }

  const coll = db.collection("shopcontents")

  const existing = await coll.find({}).toArray()
  const shopContent = Object.fromEntries(existing.map((d) => [d.key, d.value]))

  const snapshot = buildSnapshot(shopContent)
  const value = JSON.stringify(snapshot)

  for (const key of ["homepage_snapshot_published", "homepage_snapshot_draft"]) {
    const res = await coll.updateOne(
      { key },
      { $set: { key, value, section: "homepage_cms" } },
      { upsert: true }
    )
    console.log(`${key}: ${res.upsertedCount ? "created" : "updated"}`)
  }

  console.log("\nMigrated snapshot summary:")
  console.log("  hero.title       =", snapshot.blocks[0].data.title)
  console.log("  about.title      =", snapshot.blocks[1].data.title)
  console.log("  about.accordions =", snapshot.blocks[1].data.accordions.length, "item(s)")
  console.log("  contact.email    =", snapshot.blocks[5].data.email)

  await client.close()
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
