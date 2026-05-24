import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-auth"
import { ContactEmailsService } from "@/services/contact-emails"
import { revalidatePath } from "next/cache"

const entrySchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  email: z.string().email(),
})

const schema = z.object({
  entries: z.array(entrySchema),
  invoiceErrorAlertEmails: z.array(z.string().email()).optional(),
})

export async function GET() {
  await requireAdmin()
  const [entries, invoiceErrorAlertEmails] = await Promise.all([
    ContactEmailsService.list(),
    ContactEmailsService.listInvoiceErrorAlertEmails(),
  ])
  return NextResponse.json({ entries, invoiceErrorAlertEmails })
}

export async function PUT(request: Request) {
  await requireAdmin()
  const { entries, invoiceErrorAlertEmails } = schema.parse(await request.json())
  const saved = await ContactEmailsService.save(entries)
  const savedInvoiceAlerts =
    invoiceErrorAlertEmails !== undefined ?
      await ContactEmailsService.saveInvoiceErrorAlertEmails(invoiceErrorAlertEmails)
    : await ContactEmailsService.listInvoiceErrorAlertEmails()
  revalidatePath("/", "layout")
  return NextResponse.json({ entries: saved, invoiceErrorAlertEmails: savedInvoiceAlerts })
}
