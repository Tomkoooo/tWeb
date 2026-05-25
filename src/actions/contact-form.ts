"use server"

import { z } from "zod"
import { findContactEmailById } from "@/lib/contact-emails"
import { serializeMailerError } from "@/lib/mailer-log"
import { MailerService } from "@/services/mailer"
import { ContactEmailsService } from "@/services/contact-emails"
import { ContactMessageService } from "@/services/contact-messages"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  recipientId: z.string().optional(),
})

export type ContactFormState = {
  ok: boolean
  message: string
}

export async function submitContactForm(
  _prev: ContactFormState | undefined,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    recipientId: formData.get("recipientId") || undefined,
  })

  if (!parsed.success) {
    return { ok: false, message: "Kérjük ellenőrizze a megadott adatokat." }
  }

  const entries = await ContactEmailsService.list()
  if (entries.length === 0) {
    return { ok: false, message: "A kapcsolatfelvétel jelenleg nem elérhető." }
  }

  const recipient = findContactEmailById(entries, parsed.data.recipientId)
  if (!recipient) {
    return { ok: false, message: "Érvénytelen címzett." }
  }

  const { name, email, message } = parsed.data
  let savedMessage: { _id: string }

  try {
    savedMessage = await ContactMessageService.create({
      name,
      email,
      message,
      recipientId: recipient.id,
      recipientLabel: recipient.label,
      recipientEmail: recipient.email,
    })
  } catch (error) {
    console.error("Failed to persist contact form message:", error)
    return {
      ok: false,
      message: "Az üzenet mentése sikertelen. Kérjük próbálja újra később.",
    }
  }

  const subject = `Kapcsolatfelvétel: ${name}`
  const html = `
    <p><strong>Név:</strong> ${escapeHtml(name)}</p>
    <p><strong>Feladó e-mail:</strong> ${escapeHtml(email)}</p>
    <p><strong>Címzett:</strong> ${escapeHtml(recipient.label)} (${escapeHtml(recipient.email)})</p>
    <hr />
    <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
  `
  const text = `Név: ${name}\nFeladó: ${email}\nCímzett: ${recipient.label} <${recipient.email}>\n\n${message}`

  try {
    await MailerService.sendSystemHtmlEmail({
      to: recipient.email,
      subject,
      html,
      text,
      logContext: { flow: "contact_form", recipientId: recipient.id, contactMessageId: savedMessage._id },
    })
    await safelyUpdateNotificationStatus(savedMessage._id, "sent")
    return { ok: true, message: "Üzenet elküldve. Hamarosan válaszolunk." }
  } catch (error) {
    await safelyUpdateNotificationStatus(savedMessage._id, "failed", formatStoredMailerError(error))
    return { ok: true, message: "Üzenetét rögzítettük. Hamarosan válaszolunk." }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function formatStoredMailerError(error: unknown): string {
  return JSON.stringify(serializeMailerError(error)).slice(0, 2000)
}

async function safelyUpdateNotificationStatus(
  contactMessageId: string,
  status: "sent" | "failed",
  error?: string
) {
  try {
    await ContactMessageService.updateNotificationStatus(contactMessageId, status, error)
  } catch (updateError) {
    console.error("Failed to update contact message notification status:", updateError)
  }
}
