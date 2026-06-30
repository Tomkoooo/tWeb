import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { uploadBufferToMedia } from "./seed-media.mjs"

const FOGFEHERITES_BASE =
  "https://raw.githubusercontent.com/davids-src/keramiadental_fogfeherites/main/site/src/assets/images"
const IMPLANT_BASE =
  "https://raw.githubusercontent.com/davids-src/keramiadental_fogpotlas_es_implant/main/site/src/assets/images"

const FOGFEHERITES_FILES = [
  { key: "hero", file: "hero_smile.png", mime: "image/png" },
  { key: "before", file: "before_smile.png", mime: "image/png" },
  { key: "after", file: "result_smile.png", mime: "image/png" },
  { key: "whitening", file: "whitening_led.png", mime: "image/png" },
  { key: "tartar", file: "tartar_removal.png", mime: "image/png" },
]

const IMPLANT_FILES = [
  { key: "hero", file: "hero_implant.jpg", mime: "image/jpeg" },
  { key: "before", file: "before_smile.jpg", mime: "image/jpeg" },
  { key: "after", file: "after_smile.jpg", mime: "image/jpeg" },
  { key: "consultation", file: "consultation_ct.jpg", mime: "image/jpeg" },
  { key: "implant", file: "implant_render.jpg", mime: "image/jpeg" },
]

async function loadImageBuffer(root, baseUrl, file, mime) {
  const localCandidates = [
    path.join(root, "public/templates/keramia-shared", file),
    path.join(root, "scripts/seed/assets/keramia", file),
  ]
  for (const candidate of localCandidates) {
    if (existsSync(candidate)) {
      return { buffer: readFileSync(candidate), originalName: file, mime }
    }
  }
  const res = await fetch(`${baseUrl}/${file}`)
  if (!res.ok) {
    throw new Error(`Failed to download ${file} from ${baseUrl} (${res.status})`)
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    originalName: file,
    mime,
  }
}

async function uploadSet(root, baseUrl, files) {
  const urls = {}
  for (const asset of files) {
    const { buffer, originalName, mime } = await loadImageBuffer(root, baseUrl, asset.file, asset.mime)
    urls[asset.key] = await uploadBufferToMedia(buffer, originalName, mime)
    console.log(`  Media: ${asset.file} → ${urls[asset.key]}`)
  }
  return urls
}

/**
 * Upload Kerámia campaign images from GitHub reference repos into MongoDB `media`.
 */
export async function seedKeramiaDentalMedia(root) {
  console.log("Uploading Kerámia fogfehérítés images …")
  const fogfeherites = await uploadSet(root, FOGFEHERITES_BASE, FOGFEHERITES_FILES)

  console.log("Uploading Kerámia implant images …")
  const implant = await uploadSet(root, IMPLANT_BASE, IMPLANT_FILES)

  const logoPath = path.join(root, "public/templates/keramia-shared/logo.png")
  let logo = fogfeherites.hero
  if (existsSync(logoPath)) {
    logo = await uploadBufferToMedia(readFileSync(logoPath), "logo.png", "image/png")
    console.log(`  Media: logo.png → ${logo}`)
  } else {
    console.warn("  Media: logo.png missing locally — using fogfehérítés hero for branding")
  }

  return { fogfeherites, implant, logo }
}
