import crypto from "node:crypto"
import path from "node:path"
import { readFileSync, existsSync } from "node:fs"
import mongoose from "mongoose"

const MediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    originalName: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    useCount: { type: Number, default: 0 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
)

/** @returns {import("mongoose").Model} */
function getMediaModel() {
  return mongoose.models.Media || mongoose.model("Media", MediaSchema)
}

export function mediaPublicUrl(filename) {
  return `/api/media/${filename}`
}

/**
 * Store bytes in MongoDB `media` collection (same as admin uploads).
 * Deduplicates by SHA-256 hash.
 */
export async function uploadBufferToMedia(buffer, originalName, mimeType) {
  if (!buffer?.length) {
    throw new Error(`Empty file: ${originalName}`)
  }
  const Media = getMediaModel()
  const hash = crypto.createHash("sha256").update(buffer).digest("hex")
  const existing = await Media.findOne({ hash }).lean()
  if (existing) {
    return mediaPublicUrl(existing.filename)
  }
  const ext = path.extname(originalName || "") || ".bin"
  const filename = `${crypto.randomUUID()}${ext}`
  await Media.create({
    filename,
    originalName: originalName || filename,
    hash,
    mimeType: mimeType || "application/octet-stream",
    size: buffer.length,
    data: buffer,
    useCount: 1,
  })
  return mediaPublicUrl(filename)
}

const REMOTE_ASSETS = [
  {
    key: "heroMain",
    file: "hero-1in1.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/mineshowcamp-1in1-borito_6a0c36c1ca442.jpg",
    mime: "image/jpeg",
  },
  {
    key: "heroBanner",
    file: "hero-borito.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/mineshowcamp-borito_6a0c36c1b19ed.jpg",
    mime: "image/jpeg",
  },
  {
    key: "story",
    file: "story-zsdav.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/zsdav_6a0c36c1e1138.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programBedwars",
    file: "program-bedwars.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/bedwars_6a0c36c229704.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programMurder",
    file: "program-murder.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/murder_6a0c36c27fc3a.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programMineimator",
    file: "program-mineimator.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/mineimator_6a0c36c2ccd27.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programBuildBattle",
    file: "program-buildbattle.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/buildbattle_6a0e1df913af1.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programUhc",
    file: "program-uhc.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/uhc_6a0c36c323773.jpg",
    mime: "image/jpeg",
  },
  {
    key: "programDeathRun",
    file: "program-deathrun.jpg",
    url: "https://ik.imagekit.io/kenlas/ft/images/cms/14/3199/deathrun_6a0c36c375b17.jpg",
    mime: "image/jpeg",
  },
]

async function loadAssetBuffer(root, { file, url }) {
  const localCandidates = [
    path.join(root, "public/minecraft-camp", file),
    path.join(root, "scripts/seed/assets/minecraft-camp", file),
  ]
  for (const candidate of localCandidates) {
    if (existsSync(candidate)) {
      return { buffer: readFileSync(candidate), originalName: file }
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download ${file} from ${url} (${res.status})`)
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    originalName: file,
  }
}

/**
 * Upload minecraft-camp marketing images into MongoDB; returns `/api/media/...` URLs for CMS/branding.
 */
export async function seedMinecraftCampMedia(root) {
  const urls = {}

  for (const asset of REMOTE_ASSETS) {
    const { buffer, originalName } = await loadAssetBuffer(root, asset)
    urls[asset.key] = await uploadBufferToMedia(buffer, originalName, asset.mime)
    console.log(`  Media: ${asset.file} → ${urls[asset.key]}`)
  }

  const logoCandidates = [
    path.join(root, "public/minecraft-camp/kockakemp-logo.png"),
    path.join(root, "scripts/seed/assets/minecraft-camp/kockakemp-logo.png"),
  ]
  let logoBuffer = null
  for (const candidate of logoCandidates) {
    if (existsSync(candidate)) {
      logoBuffer = readFileSync(candidate)
      break
    }
  }
  if (logoBuffer) {
    urls.logo = await uploadBufferToMedia(logoBuffer, "kockakemp-logo.png", "image/png")
    console.log(`  Media: kockakemp-logo.png → ${urls.logo}`)
  } else {
    urls.logo = urls.heroMain
    console.warn("  Media: kockakemp-logo.png not found locally — using hero image for logo/SEO")
  }

  return urls
}
