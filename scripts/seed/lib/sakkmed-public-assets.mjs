import {
  crawlSakkmedWix,
  HOME_IMAGES,
  mediaBaseUrl,
  mediaIdToExt,
} from "./crawl-sakkmed-wix.mjs"
import { uploadBufferToMedia } from "./seed-media.mjs"

const uploadedByMediaId = new Map()

function mimeFromMediaId(mediaId) {
  if (mediaId.includes(".png")) return "image/png"
  if (mediaId.includes(".jpeg")) return "image/jpeg"
  return "image/jpeg"
}

function originalNameFor(slug, mediaId, index = 0) {
  const ext = mediaIdToExt(mediaId)
  const short = mediaId.split("_")[1]?.slice(0, 8) ?? String(index).padStart(2, "0")
  if (slug === "home") {
    if (mediaId === HOME_IMAGES.logo) return `sakkmed-logo${ext}`
    if (mediaId === HOME_IMAGES.hero1) return `sakkmed-hero-1${ext}`
    if (mediaId === HOME_IMAGES.hero2) return `sakkmed-hero-2${ext}`
    if (mediaId === HOME_IMAGES.projectFesztival) return `sakkmed-fesztival-vip${ext}`
    if (mediaId === HOME_IMAGES.projectSigma) return `sakkmed-project-sigma${ext}`
    const clients = [
      HOME_IMAGES.client1,
      HOME_IMAGES.client2,
      HOME_IMAGES.client3,
      HOME_IMAGES.client4,
    ]
    const ci = clients.indexOf(mediaId)
    if (ci >= 0) return `sakkmed-client-${ci + 1}${ext}`
    const gi = HOME_IMAGES.gallery.indexOf(mediaId)
    if (gi >= 0) return `sakkmed-gallery-${gi + 1}${ext}`
  }
  return `sakkmed-${slug}-${short}${ext}`
}

async function uploadWixMedia(mediaId, originalName) {
  if (uploadedByMediaId.has(mediaId)) {
    return uploadedByMediaId.get(mediaId)
  }
  const url = mediaBaseUrl(mediaId)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download ${originalName} from ${url} (${res.status})`)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const mime = res.headers.get("content-type")?.split(";")[0] || mimeFromMediaId(mediaId)
  const publicUrl = await uploadBufferToMedia(buffer, originalName, mime)
  uploadedByMediaId.set(mediaId, publicUrl)
  console.log(`  media: ${originalName} → ${publicUrl} (${Math.round(buffer.length / 1024)} KB)`)
  return publicUrl
}

/** Crawl Wix, upload all images to MongoDB `media`, return `/api/media/...` URLs for CMS. */
export async function seedSakkmedMediaAssets() {
  console.log("Crawling Wix site for SAKKMED content …")
  const { pages, home } = await crawlSakkmedWix()

  const urls = {
    logo: "",
    hero1: "",
    hero2: "",
    heroBackground: "",
    fesztivalVip: "",
    sigma: "",
    client1: "",
    client2: "",
    client3: "",
    client4: "",
    gallery: [],
    pages: {},
  }

  console.log("Uploading homepage assets to database …")
  urls.logo = await uploadWixMedia(home.logo, originalNameFor("home", home.logo))
  urls.hero1 = await uploadWixMedia(home.hero1, originalNameFor("home", home.hero1))
  urls.hero2 = await uploadWixMedia(home.hero2, originalNameFor("home", home.hero2))
  urls.fesztivalVip = await uploadWixMedia(
    home.projectFesztival,
    originalNameFor("home", home.projectFesztival)
  )
  urls.sigma = await uploadWixMedia(home.projectSigma, originalNameFor("home", home.projectSigma))
  urls.client1 = await uploadWixMedia(home.client1, originalNameFor("home", home.client1))
  urls.client2 = await uploadWixMedia(home.client2, originalNameFor("home", home.client2))
  urls.client3 = await uploadWixMedia(home.client3, originalNameFor("home", home.client3))
  urls.client4 = await uploadWixMedia(home.client4, originalNameFor("home", home.client4))

  for (let i = 0; i < home.gallery.length; i++) {
    const mediaId = home.gallery[i]
    const saved = await uploadWixMedia(mediaId, originalNameFor("home", mediaId, i))
    urls.gallery.push(saved)
    if (i === 1) urls.heroBackground = saved
  }

  console.log("Uploading subpage assets to database …")
  for (const [slug, page] of Object.entries(pages)) {
    urls.pages[slug] = { hero: "", gallery: [] }
    if (page.heroMediaId) {
      urls.pages[slug].hero = await uploadWixMedia(
        page.heroMediaId,
        originalNameFor(slug, page.heroMediaId, 0)
      )
    }
    for (let i = 0; i < page.galleryMediaIds.length; i++) {
      const mediaId = page.galleryMediaIds[i]
      const saved = await uploadWixMedia(mediaId, originalNameFor(slug, mediaId, i + 1))
      urls.pages[slug].gallery.push(saved)
    }
    if (slug === "sigma-kontener") {
      urls.sigmaPage = urls.pages[slug].hero
      urls.sigmaGallery = urls.pages[slug].gallery
    }
  }

  console.log(`  (${uploadedByMediaId.size} unique files in media collection)`)
  return { urls, pages }
}

export { HOME_IMAGES, mediaIdToExt }
