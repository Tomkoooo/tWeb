/**
 * Crawl https://balazsgabor3.wixsite.com/sakkmed2 for text + image URLs.
 * Wix uses opaque slugs (copy-of-*) — mapped to our CMS slugs below.
 */
const BASE = "https://balazsgabor3.wixsite.com/sakkmed2"
const LOGO_ID = "935bc1_000eb3e632644830901e4d3bfe420a98"

/** @type {Array<{ slug: string, wixPath: string }>} */
export const WIX_PAGES = [
  { slug: "butoraink", wixPath: "/butor" },
  { slug: "installaciok", wixPath: "/copy-of-butoraink-1" },
  { slug: "traverz", wixPath: "/copy-of-installaciok" },
  { slug: "emelestechnika", wixPath: "/copy-of-traverz" },
  { slug: "layher", wixPath: "/copy-of-traverz-1" },
  { slug: "alutent", wixPath: "/copy-of-butoraink" },
  { slug: "aramhalozat", wixPath: "/copy-of-alutent" },
  { slug: "vizmu", wixPath: "/copy-of-aramhalozat" },
  { slug: "syma", wixPath: "/syma" },
  { slug: "fesztival-vip", wixPath: "/fesztival-vip" },
  { slug: "sigma-kontener", wixPath: "/sigma" },
]

/** Homepage image mapping (matched to Wix section order). */
export const HOME_IMAGES = {
  logo: `${LOGO_ID}~mv2.png`,
  hero1: "935bc1_64c242aa35ab4b0192c8574dae0ff9d1~mv2.png",
  hero2: "935bc1_c1a48b54cc814dfaa4fdc38ae0aa9b9e~mv2.png",
  projectFesztival: "935bc1_abc26d6b8e6945b38ac0cef0ead73cc6~mv2.jpg",
  projectSigma: "935bc1_cf6a3d94c8cd4d96bfd97369586f4cc9~mv2.jpg",
  client1: "935bc1_99a06514c98f48ba9910271d26ca7699~mv2.png",
  client2: "935bc1_b1363f4812f343059dc4f6c625335eb8~mv2.png",
  client3: "935bc1_d7d1cf8368644d178acaf3c412c5bd2a~mv2.png",
  client4: "935bc1_f2711eb392e9445bae990507bdd7ae10~mv2.png",
  gallery: [
    "935bc1_1ac92a61e1dd4c2193c0202df361bb8e~mv2_d_2048_1365_s_2.jpg",
    "935bc1_de1cdc6602644b9b9a176a1185ceef3c~mv2_d_2048_1365_s_2.jpg",
    "935bc1_5b95bc7a40b146dbbc842d891784c882~mv2.jpg",
    "935bc1_c033e8d82b4340359999a98cbde98579~mv2_d_2048_1365_s_2.jpg",
    "935bc1_09fe2c17b73f40649d8708be89843845~mv2_d_1728_1296_s_2.jpg",
    "935bc1_b4e08442203e49bead5dffc05116de0f~mv2.jpg",
  ],
}

function decodeHtml(text) {
  return text
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&uacute;/g, "ú")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim()
}

function stripTags(html) {
  return decodeHtml(html.replace(/<[^>]+>/g, " "))
}

function mediaBaseUrl(part) {
  return `https://static.wixstatic.com/media/${part}`
}

function extractMediaIds(html) {
  const seen = new Set()
  const out = []
  const pattern =
    /(?:https:\/\/static\.wixstatic\.com\/media\/)?((?:935bc1|85c3e1)_[a-f0-9]+~mv2(?:_d_\d+_\d+_s_\d+)?\.(?:jpg|jpeg|png))/gi
  for (const m of html.matchAll(pattern)) {
    const part = m[1]
    if (part.includes(LOGO_ID)) continue
    if (seen.has(part)) continue
    seen.add(part)
    out.push(part)
  }
  return out
}

function extractPageContent(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
  const titleTag = html.match(/<title>([^<|]+)/i)?.[1]?.trim() ?? ""
  const h2Raw = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => stripTags(m[1]))
  const sectionHeadings = h2Raw.slice(1).filter((t) => t.length > 1 && !/^Megrendelés/i.test(t))

  const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => stripTags(m[1]))
    .filter(
      (t) =>
        t.length > 25 &&
        !t.includes("©") &&
        !t.includes("SAKKMED 2005") &&
        !/butor@|balazs\.|kovacs\.|marti\.|tomori\.|bencs\./i.test(t) &&
        !/^Megrendelés/i.test(t) &&
        !/Fesztivál VIP|SIGMA KONTÉNER|Ügyfeleink|Galéria|Kapcsolat|Szolgáltatásaink/i.test(t) &&
        !/Bútorainkinstallációktraverz/i.test(t)
    )

  const emailMatch = html.match(/([a-z0-9._+-]+@esemenyszervezes\.hu)/i)
  const contactEmail = emailMatch?.[1] ?? ""

  const title = titleTag || h2Raw[0] || "Oldal"

  /** @type {Array<{ heading: string, body: string, image: string }>} */
  const sections = []
  if (paras.length > 0) {
    sections.push({ heading: "", body: paras[0], image: "" })
  }

  let paraIdx = 1
  for (const heading of sectionHeadings) {
    const bodyText = paras[paraIdx] ?? ""
    paraIdx += 1
    sections.push({ heading, body: bodyText, image: "" })
  }

  while (paraIdx < paras.length) {
    const last = sections[sections.length - 1]
    if (last && !last.body.includes(paras[paraIdx])) {
      last.body = `${last.body}\n${paras[paraIdx]}`.trim()
    } else if (!last || last.body) {
      sections.push({ heading: "", body: paras[paraIdx], image: "" })
    }
    paraIdx += 1
  }

  return { title, sections, contactEmail }
}

function pickHeroMediaId(mediaIds) {
  if (mediaIds.length === 0) return ""
  const wideBanner = mediaIds.find((id) => /_d_2048_1365_s_2\.jpg/i.test(id))
  if (wideBanner) return wideBanner
  const wide = mediaIds.find((id) => /_d_\d+_\d+_s_\d+\.jpg/i.test(id))
  if (wide) return wide
  return mediaIds[0]
}

/** Shared Wix asset reused on many pages — quality certificate, not page content. */
const SKIP_GALLERY_IDS = new Set([
  "935bc1_5b95bc7a40b146dbbc842d891784c882~mv2.jpg",
])

function pickGalleryMediaIds(mediaIds, heroMediaId) {
  return mediaIds.filter((id) => id !== heroMediaId && !SKIP_GALLERY_IDS.has(id))
}

export async function crawlSakkmedWix() {
  const pages = {}

  for (const { slug, wixPath } of WIX_PAGES) {
    const url = `${BASE}${wixPath}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    const html = await res.text()
    const mediaIds = extractMediaIds(html)
    const content = extractPageContent(html)

    const heroMediaId = pickHeroMediaId(mediaIds)

    pages[slug] = {
      wixPath,
      title: content.title,
      contactEmail: content.contactEmail,
      sections: content.sections,
      mediaIds,
      heroMediaId,
      galleryMediaIds: pickGalleryMediaIds(mediaIds, heroMediaId),
    }
    console.log(`  crawl ${slug}: ${content.sections.length} sections, ${mediaIds.length} images`)
  }

  return { pages, home: HOME_IMAGES }
}

export function mediaIdToExt(mediaId) {
  if (mediaId.includes(".jpeg")) return ".jpeg"
  if (mediaId.includes(".jpg")) return ".jpg"
  if (mediaId.includes(".png")) return ".png"
  return ".jpg"
}

export function localPathForMedia(slug, mediaId, index = 0) {
  const ext = mediaIdToExt(mediaId)
  const short = mediaId.split("_")[1]?.slice(0, 8) ?? String(index).padStart(2, "0")
  if (slug === "home") {
    if (mediaId === HOME_IMAGES.logo) return `/sakkmed/logo.png`
    if (mediaId === HOME_IMAGES.hero1) return `/sakkmed/hero-1.png`
    if (mediaId === HOME_IMAGES.hero2) return `/sakkmed/hero-2.png`
    if (mediaId === HOME_IMAGES.projectFesztival) return `/sakkmed/fesztival-vip.jpg`
    if (mediaId === HOME_IMAGES.projectSigma) return `/sakkmed/project-sigma.jpg`
    const gi = HOME_IMAGES.gallery.indexOf(mediaId)
    if (gi >= 0) return `/sakkmed/gallery-${gi + 1}${ext}`
    const clients = [
      HOME_IMAGES.client1,
      HOME_IMAGES.client2,
      HOME_IMAGES.client3,
      HOME_IMAGES.client4,
    ]
    const ci = clients.indexOf(mediaId)
    if (ci >= 0) return `/sakkmed/client-${ci + 1}.png`
  }
  return `/sakkmed/pages/${slug}/${short}${ext}`
}

export { mediaBaseUrl }
