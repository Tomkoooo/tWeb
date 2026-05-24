import dbConnect from "@/lib/db"
import {
  parseContactEmailsFromShopContent,
  serializeContactEmails,
  type ContactEmailEntry,
} from "@/lib/contact-emails"
import { ShopContentService } from "@/services/shop-content"

export class ContactEmailsService {
  static async list(): Promise<ContactEmailEntry[]> {
    const content = await ShopContentService.getAll()
    return parseContactEmailsFromShopContent(content)
  }

  static async save(entries: ContactEmailEntry[]): Promise<ContactEmailEntry[]> {
    const normalized = entries
      .map((entry) => ({
        id: entry.id.trim() || crypto.randomUUID(),
        label: entry.label.trim(),
        email: entry.email.trim(),
      }))
      .filter((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email))

    await dbConnect()
    await ShopContentService.update(
      "contact_emails",
      serializeContactEmails(normalized),
      "contact"
    )
    await ShopContentService.update(
      "contact_email",
      normalized[0]?.email ?? "",
      "contact"
    )
    return normalized
  }
}
