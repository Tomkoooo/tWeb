"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin-auth"
import { contactReplyHtmlToText } from "@/lib/contact-replies"
import { serializeMailerError } from "@/lib/mailer-log"
import { MailerService } from "@/services/mailer"
import {
  ContactMessageService,
  type ContactMessageListFilters,
} from "@/services/contact-messages"
import type { ContactMessageStatus } from "@/models/ContactMessage"

export type ContactReplyFormState = {
  ok: boolean
  message: string
}

const CONTACT_STATUSES: ContactMessageStatus[] = ["unread", "read", "replied", "archived"]

export async function getContactMessages(filters: ContactMessageListFilters = {}) {
  await requireAdmin()
  return ContactMessageService.list(filters)
}

export async function getContactMessage(id: string) {
  await requireAdmin()
  const message = await ContactMessageService.getById(id)
  if (message?.status === "unread") {
    const updated = await ContactMessageService.updateStatus(id, "read")
    return updated || message
  }
  return message
}

export async function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  await requireAdmin()
  if (!CONTACT_STATUSES.includes(status)) {
    throw new Error("Érvénytelen státusz.")
  }

  await ContactMessageService.updateStatus(id, status)
  revalidateContactMessagePaths(id)
}

export async function sendContactReply(
  messageId: string,
  _prevState: ContactReplyFormState | undefined,
  formData: FormData
): Promise<ContactReplyFormState> {
  const session = await requireAdmin()
  const message = await ContactMessageService.getById(messageId)

  if (!message) {
    return { ok: false, message: "Az üzenet nem található." }
  }

  const subject = String(formData.get("subject") || "").trim()
  const bodyHtml = String(formData.get("bodyHtml") || "").trim()
  const bodyText = contactReplyHtmlToText(bodyHtml)

  if (!subject || !bodyText) {
    return { ok: false, message: "Tárgy és üzenet megadása kötelező." }
  }

  const adminUser = session.user as {
    id?: string
    name?: string | null
    email?: string | null
  }

  const attempt = await ContactMessageService.createReplyAttempt(messageId, {
    subject,
    bodyHtml,
    bodyText,
    adminUserId: adminUser.id,
    adminName: adminUser.name || undefined,
    adminEmail: adminUser.email || undefined,
  })

  if (!attempt) {
    return { ok: false, message: "A válasz mentése sikertelen." }
  }

  try {
    await MailerService.sendSystemHtmlEmail({
      to: message.email,
      subject,
      html: buildReplyEmailHtml(bodyHtml, message),
      text: buildReplyEmailText(bodyText, message),
      logContext: {
        flow: "contact_reply",
        contactMessageId: messageId,
        contactReplyId: attempt.replyId,
      },
    })
    await ContactMessageService.updateReplyStatus(messageId, attempt.replyId, "sent")
    revalidateContactMessagePaths(messageId)
    return { ok: true, message: "Válasz elküldve." }
  } catch (error) {
    await ContactMessageService.updateReplyStatus(
      messageId,
      attempt.replyId,
      "failed",
      formatStoredMailerError(error)
    )
    revalidateContactMessagePaths(messageId)
    return {
      ok: false,
      message: "A válasz mentve lett, de az email küldése sikertelen.",
    }
  }
}

function buildReplyEmailHtml(
  bodyHtml: string,
  message: { name: string; email: string; message: string; createdAt: string }
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #222; line-height: 1.6;">
      <div>${bodyHtml}</div>
      <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 28px 0;" />
      <p style="font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: .08em;">Eredeti üzenet</p>
      <p style="font-size: 13px; color: #555;"><strong>${escapeHtml(message.name)}</strong> &lt;${escapeHtml(message.email)}&gt;</p>
      <p style="font-size: 13px; color: #555;">${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>
    </div>
  `
}

function buildReplyEmailText(
  bodyText: string,
  message: { name: string; email: string; message: string }
) {
  return [
    bodyText,
    "",
    "----- Eredeti üzenet -----",
    `${message.name} <${message.email}>`,
    message.message,
  ].join("\n")
}

function revalidateContactMessagePaths(id: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/contact")
  revalidatePath(`/admin/contact/${id}`)
}

function formatStoredMailerError(error: unknown): string {
  return JSON.stringify(serializeMailerError(error)).slice(0, 2000)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
