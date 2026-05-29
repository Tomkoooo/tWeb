import type { SiteContact } from "@/lib/site-contact"
import { SiteContactEmailsList } from "@/components/site-contact/SiteContactEmailsList"
import { ContactInquiryForm } from "@/components/site-contact/ContactInquiryForm"
import { MineshowContactMap } from "./MineshowContactMap"

type ContactBlockData = {
  title?: string
  description?: string
  companyName?: string
  address?: string
  phone?: string
  email?: string
  mapEmbedUrl?: string
  sendButtonLabel?: string
  nameLabel?: string
  emailLabel?: string
  messageLabel?: string
}

type Props = {
  siteContact: SiteContact
  contactData?: ContactBlockData | null
  mapEmbedUrl: string
  venueAddress: string
}

export function MineshowContactSection({
  siteContact,
  contactData,
  mapEmbedUrl,
  venueAddress,
}: Props) {
  const emails = siteContact.emails
  const hasForm = emails.length > 0
  const addressTitle = contactData?.title || contactData?.address || venueAddress

  return (
    <section id="contact" className="bg-[#b8d88a] border-t-4 border-[#3d2817]/20">
      {mapEmbedUrl ? (
        <MineshowContactMap
          addressTitle={addressTitle}
          email={contactData?.email}
          companyName={contactData?.companyName}
          mapEmbedUrl={mapEmbedUrl}
        />
      ) : null}

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="minecraft-panel p-5 md:p-6 space-y-4 font-minecraft-body text-sm text-[#3d2817]">
            <h2 className="font-minecraft text-xs text-[#2d5016]">
              {contactData?.title || "Kapcsolat"}
            </h2>
            {contactData?.description ? <p>{contactData.description}</p> : null}
            {contactData?.companyName ? (
              <p className="font-semibold">{contactData.companyName}</p>
            ) : null}
            {contactData?.address || venueAddress ? (
              <p>{contactData?.address || venueAddress}</p>
            ) : null}
            {contactData?.phone ? <p>{contactData.phone}</p> : null}
            {emails.length > 0 ? (
              <div>
                <p className="font-minecraft text-[10px] text-[#2d5016] mb-2">E-mail</p>
                <SiteContactEmailsList
                  emails={emails}
                  className="text-[#1a3d5c]"
                  itemClassName="underline"
                />
              </div>
            ) : null}
            {!hasForm ? (
              <p className="text-xs text-[#5c4a32]">
                Kapcsolatfelvételi űrlaphoz adj meg címzett e-mailt a CMS → Weboldal beállítások →
                Kapcsolat e-mailek menüben.
              </p>
            ) : null}
          </div>

          {hasForm ? (
            <div className="minecraft-panel p-5 md:p-6 mineshow-contact-form">
              <h2 className="font-minecraft text-xs text-[#2d5016] mb-4">Írj nekünk</h2>
              <ContactInquiryForm
                contactEmails={emails}
                nameLabel={contactData?.nameLabel || "Név"}
                emailLabel={contactData?.emailLabel || "E-mail"}
                messageLabel={contactData?.messageLabel || "Üzenet"}
                sendButtonLabel={contactData?.sendButtonLabel || "Üzenet küldése"}
                recipientLabel="Címzett"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
