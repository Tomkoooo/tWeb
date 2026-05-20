import path from "path"
import crypto from "crypto"
import dbConnect from "@/lib/db"
import Media from "@/models/Media"
import { hasMediaBuffer, mediaBufferFromDoc } from "@/lib/media-buffer"

export type MediaFilePayload = {
  buffer: Buffer
  mimeType: string
  size: number
}

export class MediaService {
  static async processUpload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    if (!buffer?.length) {
      throw new Error("Üres fájl — a feltöltés nem sikerült.")
    }

    await dbConnect()

    const hash = crypto.createHash("sha256").update(buffer).digest("hex")
    const safeMime = mimeType?.trim() || "application/octet-stream"

    const existing = await Media.findOne({ hash })
    if (existing) {
      if (!hasMediaBuffer(existing.data)) {
        existing.data = buffer
        existing.size = buffer.length
        existing.mimeType = safeMime
        await existing.save()
      }
      return existing.filename
    }

    const ext = path.extname(originalName || "") || ".bin"
    const filename = `${crypto.randomUUID()}${ext}`

    await Media.create({
      filename,
      originalName: originalName || filename,
      hash,
      mimeType: safeMime,
      size: buffer.length,
      data: buffer,
      useCount: 0,
    })

    return filename
  }

  /** Resolve file bytes for `/api/media/[filename]` — database only (no disk). */
  static async getFilePayload(filename: string): Promise<MediaFilePayload | null> {
    await dbConnect()
    const safe = path.basename(filename)
    if (!safe || safe !== filename) return null

    const doc = await Media.findOne({ filename: safe }).lean()
    if (!doc) return null

    const buffer = mediaBufferFromDoc(doc.data)
    if (!buffer) return null

    return {
      buffer,
      mimeType: doc.mimeType || guessMimeFromExt(path.extname(safe)),
      size: buffer.length,
    }
  }

  static async incrementUsage(filenames: string | string[]) {
    if (!filenames) return
    await dbConnect()
    const names = Array.isArray(filenames) ? filenames : [filenames]
    if (names.length === 0) return

    await Media.updateMany({ filename: { $in: names } }, { $inc: { useCount: 1 } })
  }

  static async decrementUsage(filenames: string | string[]) {
    if (!filenames) return
    await dbConnect()
    const names = Array.isArray(filenames) ? filenames : [filenames]
    if (names.length === 0) return

    await Media.updateMany({ filename: { $in: names } }, { $inc: { useCount: -1 } })

    await Media.deleteMany({
      filename: { $in: names },
      useCount: { $lte: 0 },
    })
  }

  static async syncUsage(oldImages: string[], newImages: string[]) {
    const added = newImages.filter((img) => !oldImages.includes(img))
    const removed = oldImages.filter((img) => !newImages.includes(img))

    if (added.length > 0) await this.incrementUsage(added)
    if (removed.length > 0) await this.decrementUsage(removed)
  }
}

function guessMimeFromExt(ext: string): string {
  const e = ext.toLowerCase()
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg"
  if (e === ".png") return "image/png"
  if (e === ".webp") return "image/webp"
  if (e === ".gif") return "image/gif"
  if (e === ".svg") return "image/svg+xml"
  if (e === ".pdf") return "application/pdf"
  if (e === ".txt") return "text/plain; charset=utf-8"
  if (e === ".doc") return "application/msword"
  if (e === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  return "application/octet-stream"
}
