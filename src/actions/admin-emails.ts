"use server"

import { revalidatePath } from "next/cache"
import { EmailTemplateService } from "@/services/email-template"
import { auth } from "@/auth"

export async function updateEmailTemplate(type: string, formData: FormData) {
  const session = await auth()
  
  // @ts-ignore
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const subject = formData.get("subject") as string
  const body = formData.get("body") as string

  if (!subject || !body) {
    throw new Error("Tárgy és tartalom megadása kötelező")
  }

  await EmailTemplateService.update(type, { subject, body })
  
  revalidatePath("/admin/emails")
  revalidatePath(`/admin/emails/${type}`)
}

export async function seedEmailTemplates() {
  const session = await auth()
  
  // @ts-ignore
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const baseTemplates = [
    {
      type: "order_confirmation",
      subject: "Rendelés visszaigazolása - #{{orderNumber}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #FF5500; text-transform: uppercase;">Köszönjük a rendelését!</h1>
          <p>Kedves {{customerName}},</p>
          <p>Örömmel értesítjük, hogy megkaptuk a rendelését (#{{orderNumber}}).</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Rendelés összefoglaló:</h3>
            <p>Végösszeg: <strong>{{totalAmount}} Ft</strong></p>
            <p>Szállítási cím: {{shippingAddress}}</p>
          </div>

          <p>Amint csomagja útra kel, újabb értesítést küldünk.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Krausz Barkács Mester - Minőség a mestereknek.</p>
        </div>
      `,
      description: "Vásárló kapja meg sikeres rendelés után.",
      variables: ["orderNumber", "customerName", "totalAmount", "items", "shippingAddress"]
    },
    {
      type: "order_status_change",
      subject: "Rendelés állapotának változása - #{{orderNumber}}",
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #FF5500; text-transform: uppercase;">Frissítés a rendelésedről</h1>
          <p>Kedves {{customerName}},</p>
          <p>Értesítjük, hogy a(z) #{{orderNumber}} számú rendelésének állapota megváltozott.</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #999;">Régi állapot: {{oldStatus}}</p>
            <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: #FF5500;">Új állapot: {{newStatus}}</p>
          </div>

          <p>További információkért látogasson el fiókjába.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Krausz Barkács Mester - Minőség a mestereknek.</p>
        </div>
      `,
      description: "Vásárló kapja meg, ha a rendelés állapota változik (pl. csomagolva, kiszállítva).",
      variables: ["orderNumber", "customerName", "oldStatus", "newStatus"]
    }
  ]

  for (const template of baseTemplates) {
    await EmailTemplateService.update(template.type, template)
  }

  revalidatePath("/admin/emails")
}
