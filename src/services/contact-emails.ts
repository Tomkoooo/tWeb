import dbConnect from "@/lib/db"
import {
  parseContactEmailsFromShopContent,
  serializeContactEmails,
  type ContactEmailEntry,
} from "@/lib/contact-emails"
import {
  parseInvoiceErrorAlertEmailsFromShopContent,
  serializeInvoiceErrorAlertEmails,
} from "@/lib/invoice-error-alert-emails"
import { ShopContentService } from "@/services/shop-content"

export class ContactEmailsService {
  static async list(): Promise<ContactEmailEntry[]> {
    const content = await ShopContentService.getAll()
    return parseContactEmailsFromShopContent(content)
  }

  static async listInvoiceErrorAlertEmails(): Promise<string[]> {
    const content = await ShopContentService.getAll()
    return parseInvoiceErrorAlertEmailsFromShopContent(content)
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

  static async saveInvoiceErrorAlertEmails(emails: string[]): Promise<string[]> {
    const normalized = emails
      .map((email) => email.trim())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))

    await dbConnect()
    await ShopContentService.update(
      "invoice_error_alert_emails",
      serializeInvoiceErrorAlertEmails(normalized),
      "contact"
    )
    return [...new Set(normalized)]
  }
}
