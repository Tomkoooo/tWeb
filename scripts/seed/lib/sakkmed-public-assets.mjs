import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  crawlSakkmedWix,
  HOME_IMAGES,
  localPathForMedia,
  mediaBaseUrl,
  mediaIdToExt,
} from "./crawl-sakkmed-wix.mjs"

const downloaded = new Map()

async function downloadMedia(root, localPath, mediaId) {
  if (downloaded.has(localPath)) return localPath
  const url = mediaBaseUrl(mediaId)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url} (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const dest = path.join(root, "public", localPath.replace(/^\//, ""))
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, buffer)
  downloaded.set(localPath, true)
  console.log(`  ${localPath} (${Math.round(buffer.length / 1024)} KB)`)
  return localPath
}

/** Crawl Wix, download all images to public/sakkmed/, return URL map for CMS. */
export async function seedSakkmedPublicAssets(root) {
  console.log("Crawling Wix site for SAKKMED content …")
  const { pages, home } = await crawlSakkmedWix()

  const urls = {
    logo: "/sakkmed/logo.png",
    hero1: "/sakkmed/hero-1.png",
    hero2: "/sakkmed/hero-2.png",
    fesztivalVip: "/sakkmed/fesztival-vip.jpg",
    sigma: "/sakkmed/project-sigma.jpg",
    client1: "/sakkmed/client-1.png",
    client2: "/sakkmed/client-2.png",
    client3: "/sakkmed/client-3.png",
    client4: "/sakkmed/client-4.png",
    gallery: [],
    pages: {},
  }

  console.log("Downloading homepage assets …")
  await downloadMedia(root, urls.logo, home.logo)
  await downloadMedia(root, urls.hero1, home.hero1)
  await downloadMedia(root, urls.hero2, home.hero2)
  await downloadMedia(root, urls.fesztivalVip, home.projectFesztival)
  await downloadMedia(root, urls.sigma, home.projectSigma)
  await downloadMedia(root, urls.client1, home.client1)
  await downloadMedia(root, urls.client2, home.client2)
  await downloadMedia(root, urls.client3, home.client3)
  await downloadMedia(root, urls.client4, home.client4)

  for (let i = 0; i < home.gallery.length; i++) {
    const mediaId = home.gallery[i]
    const local = localPathForMedia("home", mediaId, i)
    await downloadMedia(root, local, mediaId)
    urls.gallery.push(local)
  }

  console.log("Downloading subpage assets …")
  for (const [slug, page] of Object.entries(pages)) {
    urls.pages[slug] = { hero: "", gallery: [], sectionImages: [] }
    if (page.heroMediaId) {
      const heroPath = localPathForMedia(slug, page.heroMediaId, 0)
      urls.pages[slug].hero = await downloadMedia(root, heroPath, page.heroMediaId)
    }
    for (let i = 0; i < page.galleryMediaIds.length; i++) {
      const mediaId = page.galleryMediaIds[i]
      const local = localPathForMedia(slug, mediaId, i + 1)
      const saved = await downloadMedia(root, local, mediaId)
      urls.pages[slug].gallery.push(saved)
    }
    if (slug === "sigma-kontener") {
      urls.sigmaPage = urls.pages[slug].hero
      urls.sigmaGallery = urls.pages[slug].gallery
    }
  }

  return { urls, pages }
}

export { HOME_IMAGES, mediaIdToExt }
