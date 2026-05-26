"use server"

import { revalidatePath } from "next/cache"
import { EmailTemplateService } from "@/services/email-template"
import { BrandingSettingsService } from "@/services/branding-settings"
import { ThemeService } from "@/services/theme"
import { getStorefrontSiteContact } from "@/lib/site-contact"
import { requireAdmin } from "@/lib/admin-auth"
import { getEmailFromAddress } from "@/lib/email-from"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getPublicBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/+$/, "")
}

export async function updateEmailTemplate(type: string, formData: FormData) {
  await requireAdmin()

  const subject = formData.get("subject") as string
  const body = formData.get("body") as string

  if (!subject || !body) {
    throw new Error("Tárgy és tartalom megadása kötelező")
  }

  await EmailTemplateService.update(type, { subject, body })
  
  revalidatePath("/admin/emails")
  revalidatePath(`/admin/emails/${type}`)
}

async function buildDefaultEmailTemplates() {
  const [branding, theme, siteContact] = await Promise.all([
    BrandingSettingsService.get(),
    ThemeService.get(),
    getStorefrontSiteContact(),
  ])

  const shopName = escapeHtml(branding.brandName)
  const primaryForeground = theme.primaryForeground
  const secondary = theme.secondary
  const secondaryForeground = theme.secondaryForeground
  const background = theme.background
  const foreground = theme.foreground
  const mutedForeground = theme.mutedForeground
  const border = theme.border
  const contactUrl = `${getPublicBaseUrl()}/#contact`
  const noReplyAddress = escapeHtml(getEmailFromAddress())
  const contactEmails = siteContact.emails.length
    ? siteContact.emails
        .map((entry) => `${escapeHtml(entry.label)}: ${escapeHtml(entry.email)}`)
        .join(" · ")
    : "a weboldalon található kapcsolatfelvételi űrlapon"
  const footer = `
          <hr style="border:0;border-top:1px solid ${border};margin:30px 0;" />
          <p style="font-size:12px;line-height:1.6;color:${mutedForeground};">
            Ez egy automatikus, no-reply üzenet a(z) ${noReplyAddress} címről. Kérjük, ne válaszolj erre az e-mailre.
            Kapcsolatfelvételhez írj a weboldalon keresztül: <a href="${contactUrl}" style="color:${primaryForeground};font-weight:bold;">Kapcsolat</a>,
            vagy használd az alábbi elérhetőségeket: ${contactEmails}.
          </p>
          <p style="font-size:12px;color:${mutedForeground};">${shopName}</p>
  `

  return [
    {
      type: "order_confirmation",
      subject: `${branding.brandName} rendelés visszaigazolása - #{{orderNumber}}`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <h1 style="color:${primaryForeground};text-transform:uppercase;">Köszönjük a rendelésed!</h1>
          <p>Kedves {{customerName}},</p>
          <p>A(z) ${shopName} örömmel értesít, hogy megkaptuk a rendelésed (#{{orderNumber}}).</p>
          
          <div style="background:${secondary};color:${secondaryForeground};padding:15px;margin:20px 0;border:1px solid ${border};">
            <h3 style="margin-top: 0;">Rendelés összefoglaló:</h3>
            <p>Végösszeg: <strong>{{totalAmount}} Ft</strong></p>
            <p>Szállítási cím: {{shippingAddress}}</p>
          </div>

          <p>Amint csomagja útra kel, újabb értesítést küldünk.</p>

          {{#if orderViewUrl}}
          <p style="margin: 28px 0 12px;">
            <a href="{{orderViewUrl}}" style="display:inline-block;background:${secondary};color:${secondaryForeground};padding:12px 18px;text-decoration:none;font-weight:bold;">Rendelés megtekintése</a>
          </p>
          <p style="font-size:13px;color:${mutedForeground};">Vendég vásárlás esetén a fenti linkkel bármikor megnyithatod a rendelésed. Ha később Google-fiókkal regisztrálsz ugyanazzal az e-mail címmel, a rendelés automatikusan megjelenik a profilodban.</p>
          {{#if linkToAccountUrl}}
          <p style="margin-top: 16px;">
            <a href="{{linkToAccountUrl}}" style="color:${primaryForeground};font-weight:bold;">Rendelés hozzárendelése fiókhoz</a>
          </p>
          {{/if}}
          {{/if}}
          
          ${footer}
        </div>
      `,
      description: "Vásárló kapja meg sikeres rendelés után.",
      variables: [
        "orderNumber",
        "customerName",
        "totalAmount",
        "items",
        "shippingAddress",
        "orderViewUrl",
        "linkToAccountUrl",
        "isGuestOrder",
      ]
    },
    {
      type: "order_status_change",
      subject: `${branding.brandName} rendelés állapotának változása - #{{orderNumber}}`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <h1 style="color:${primaryForeground};text-transform:uppercase;">Frissítés a rendelésedről</h1>
          <p>Kedves {{customerName}},</p>
          <p>A(z) ${shopName} értesít, hogy a #{{orderNumber}} számú rendelésed állapota megváltozott.</p>
          
          <div style="background:${secondary};color:${secondaryForeground};padding:15px;margin:20px 0;text-align:center;border:1px solid ${border};">
            <p style="margin:0;font-size:14px;text-transform:uppercase;color:${secondaryForeground};">Régi állapot: {{oldStatus}}</p>
            <p style="margin:10px 0;font-size:24px;font-weight:bold;color:${primaryForeground};">Új állapot: {{newStatus}}</p>
          </div>

          <p>További információkért látogasson el fiókjába.</p>
          
          ${footer}
        </div>
      `,
      description: "Vásárló kapja meg, ha a rendelés állapota változik (pl. csomagolva, kiszállítva).",
      variables: ["orderNumber", "customerName", "oldStatus", "newStatus"]
    },
    {
      type: "invoice_sent",
      subject: `${branding.brandName} számla elkészült - #{{orderNumber}} / {{invoiceId}}`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <h1 style="color:${primaryForeground};text-transform:uppercase;">Számla elkészült</h1>
          <p>Kedves {{customerName}},</p>
          <p>A(z) ${shopName} #{{orderNumber}} rendeléséhez tartozó számla elkészült.</p>
          <p>Számla azonosító: <strong>{{invoiceId}}</strong></p>
          <p>{{invoiceMessage}}</p>
          <p>A számlát csatolmányként küldjük, illetve fiókodban is bármikor letöltheted.</p>
          ${footer}
        </div>
      `,
      description: "Automatikus vagy manuális számla küldésekor.",
      variables: ["orderNumber", "customerName", "invoiceId", "invoiceMessage"]
    },
    {
      type: "invoice_issue",
      subject: `${branding.brandName} számlázási értesítés - #{{orderNumber}}`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <h1 style="color:${primaryForeground};text-transform:uppercase;">Számlázási értesítés</h1>
          <p>Kedves {{customerName}},</p>
          <p>A(z) ${shopName} #{{orderNumber}} rendelésének számlázása manuális ellenőrzést igényel.</p>
          <p>{{invoiceMessage}}</p>
          <p>Amint a számla elérhető, új értesítést küldünk.</p>
          ${footer}
        </div>
      `,
      description: "Számlázási hiba vagy manuális beavatkozás esetén.",
      variables: ["orderNumber", "customerName", "invoiceMessage"]
    },
    {
      type: "contact_form_notification",
      subject: `${branding.brandName} kapcsolatfelvétel - {{name}}`,
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <h1 style="color:${primaryForeground};text-transform:uppercase;">Új kapcsolatfelvételi üzenet</h1>
          <p>Új üzenet érkezett a weboldal kapcsolatfelvételi űrlapján.</p>
          <div style="background:${secondary};color:${secondaryForeground};padding:15px;margin:20px 0;border:1px solid ${border};">
            <p><strong>Név:</strong> {{name}}</p>
            <p><strong>Feladó e-mail:</strong> {{email}}</p>
            <p><strong>Címzett:</strong> {{recipientLabel}} &lt;{{recipientEmail}}&gt;</p>
            <p><strong>Üzenet azonosító:</strong> {{contactMessageId}}</p>
          </div>
          <div style="background:${secondary};color:${secondaryForeground};padding:15px;margin:20px 0;border:1px solid ${border};">
            <p style="margin-top:0;text-transform:uppercase;font-size:12px;color:${secondaryForeground};font-weight:bold;">Üzenet</p>
            <p style="white-space:normal;">{{{messageHtml}}}</p>
          </div>
          ${footer}
        </div>
      `,
      description: "Belső értesítés, amikor a weboldali kapcsolatfelvételi űrlapon új üzenet érkezik.",
      variables: [
        "name",
        "email",
        "message",
        "messageHtml",
        "recipientLabel",
        "recipientEmail",
        "contactMessageId",
      ]
    },
    {
      type: "contact_reply",
      subject: "{{subject}}",
      body: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:${background};color:${foreground};">
          <div style="line-height:1.6;">
            {{{bodyHtml}}}
          </div>
          <hr style="border:0;border-top:1px solid ${border};margin:28px 0;" />
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:${mutedForeground};font-weight:bold;">Eredeti üzenet</p>
          <p style="font-size:13px;color:${mutedForeground};"><strong>{{originalName}}</strong> &lt;{{originalEmail}}&gt;</p>
          <p style="font-size:13px;color:${mutedForeground};">{{{originalMessageHtml}}}</p>
          ${footer}
        </div>
      `,
      description: "Kapcsolatfelvételi üzenetre küldött admin válasz a látogatónak.",
      variables: [
        "subject",
        "bodyHtml",
        "bodyText",
        "originalName",
        "originalEmail",
        "originalMessage",
        "originalMessageHtml",
        "adminName",
        "adminEmail",
      ]
    }
  ]
}

export async function seedEmailTemplates() {
  await requireAdmin()

  const baseTemplates = await buildDefaultEmailTemplates()

  for (const template of baseTemplates) {
    await EmailTemplateService.update(template.type, template)
  }

  revalidatePath("/admin/emails")
}

export async function initializeMissingEmailTemplates() {
  await requireAdmin()

  const baseTemplates = await buildDefaultEmailTemplates()

  for (const template of baseTemplates) {
    await EmailTemplateService.createMissing(template.type, template)
  }

  revalidatePath("/admin/emails")
}
