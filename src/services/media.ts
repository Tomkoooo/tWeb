import fs from "fs";
import path from "path";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Media, { IMedia } from "@/models/Media";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export class MediaService {
  private static ensureDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  static async processUpload(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    await dbConnect();
    this.ensureDir();

    // Calculate hash
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Check if hash exists
    const existing = await Media.findOne({ hash });
    if (existing) {
      // Check if physical file still exists (optional but safer)
      if (fs.existsSync(path.join(UPLOAD_DIR, existing.filename))) {
        return existing.filename;
      } else {
        // Record exists but file is gone, cleanup record and continue to save new
        await Media.deleteOne({ _id: existing._id });
      }
    }

    // Generate unique name
    const ext = path.extname(originalName);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file
    fs.writeFileSync(filePath, buffer);

    // Create DB record with useCount 0 (to be incremented by entity service)
    await Media.create({
      filename,
      originalName,
      hash,
      mimeType,
      size: buffer.length,
      useCount: 0
    });

    return filename;
  }

  static async incrementUsage(filenames: string | string[]) {
    if (!filenames) return;
    await dbConnect();
    const names = Array.isArray(filenames) ? filenames : [filenames];
    if (names.length === 0) return;

    await Media.updateMany(
      { filename: { $in: names } },
      { $inc: { useCount: 1 } }
    );
  }

  static async decrementUsage(filenames: string | string[]) {
    if (!filenames) return;
    await dbConnect();
    const names = Array.isArray(filenames) ? filenames : [filenames];
    if (names.length === 0) return;

    // Decrement count
    await Media.updateMany(
      { filename: { $in: names } },
      { $inc: { useCount: -1 } }
    );

    // Find orphans (count <= 0)
    const orphans = await Media.find({ 
      filename: { $in: names },
      useCount: { $lte: 0 }
    });

    for (const orphan of orphans) {
      const filePath = path.join(UPLOAD_DIR, orphan.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await Media.deleteOne({ _id: orphan._id });
    }
  }

  /**
   * Syncs usage when an entity's images change
   */
  static async syncUsage(oldImages: string[], newImages: string[]) {
    const added = newImages.filter(img => !oldImages.includes(img));
    const removed = oldImages.filter(img => !newImages.includes(img));

    if (added.length > 0) await this.incrementUsage(added);
    if (removed.length > 0) await this.decrementUsage(removed);
  }
}
