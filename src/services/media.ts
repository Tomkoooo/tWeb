import fs from "fs";
import path from "path";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Media from "@/models/Media";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export type MediaFilePayload = {
  buffer: Buffer;
  mimeType: string;
  size: number;
};

export class MediaService {
  static async processUpload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    await dbConnect();

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const existing = await Media.findOne({ hash }).lean();
    if (existing?.filename) {
      if (!existing.data?.length) {
        await Media.updateOne(
          { _id: existing._id },
          { $set: { data: buffer, size: buffer.length, mimeType: mimeType || existing.mimeType } }
        );
      }
      return existing.filename;
    }

    const ext = path.extname(originalName);
    const filename = `${crypto.randomUUID()}${ext}`;

    await Media.create({
      filename,
      originalName,
      hash,
      mimeType: mimeType || "application/octet-stream",
      size: buffer.length,
      data: buffer,
      useCount: 0,
    });

    return filename;
  }

  /** Resolve file bytes for `/api/media/[filename]` (DB first, optional legacy disk). */
  static async getFilePayload(filename: string): Promise<MediaFilePayload | null> {
    await dbConnect();
    const safe = path.basename(filename);
    if (!safe || safe !== filename) return null;

    const doc = await Media.findOne({ filename: safe }).lean();
    if (doc?.data && doc.data.length > 0) {
      return {
        buffer: Buffer.from(doc.data),
        mimeType: doc.mimeType,
        size: doc.size,
      };
    }

    const legacyPath = path.join(UPLOAD_DIR, safe);
    if (fs.existsSync(legacyPath)) {
      const buffer = fs.readFileSync(legacyPath);
      return {
        buffer,
        mimeType: doc?.mimeType || guessMimeFromExt(path.extname(safe)),
        size: buffer.length,
      };
    }

    return null;
  }

  static async incrementUsage(filenames: string | string[]) {
    if (!filenames) return;
    await dbConnect();
    const names = Array.isArray(filenames) ? filenames : [filenames];
    if (names.length === 0) return;

    await Media.updateMany({ filename: { $in: names } }, { $inc: { useCount: 1 } });
  }

  static async decrementUsage(filenames: string | string[]) {
    if (!filenames) return;
    await dbConnect();
    const names = Array.isArray(filenames) ? filenames : [filenames];
    if (names.length === 0) return;

    await Media.updateMany({ filename: { $in: names } }, { $inc: { useCount: -1 } });

    const orphans = await Media.find({
      filename: { $in: names },
      useCount: { $lte: 0 },
    });

    for (const orphan of orphans) {
      const legacyPath = path.join(UPLOAD_DIR, orphan.filename);
      if (fs.existsSync(legacyPath)) {
        try {
          fs.unlinkSync(legacyPath);
        } catch {
          /* ignore on read-only hosts */
        }
      }
      await Media.deleteOne({ _id: orphan._id });
    }
  }

  static async syncUsage(oldImages: string[], newImages: string[]) {
    const added = newImages.filter((img) => !oldImages.includes(img));
    const removed = oldImages.filter((img) => !newImages.includes(img));

    if (added.length > 0) await this.incrementUsage(added);
    if (removed.length > 0) await this.decrementUsage(removed);
  }
}

function guessMimeFromExt(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  if (e === ".gif") return "image/gif";
  if (e === ".pdf") return "application/pdf";
  if (e === ".txt") return "text/plain; charset=utf-8";
  if (e === ".doc") return "application/msword";
  if (e === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}
