/**
 * Template integration for admin-managed contact e-mails.
 *
 * @example Homepage render
 * ```tsx
 * import type { HomePageDeps } from "@/templates/types"
 * import { SiteContactEmailsList, ContactInquiryForm } from "@/templates/site-contact"
 *
 * export function HomeRender({ deps }: { deps: HomePageDeps }) {
 *   const { emails, phone, address } = deps.siteContact
 *   return (
 *     <section>
 *       <SiteContactEmailsList emails={emails} />
 *       <ContactInquiryForm contactEmails={emails} />
 *     </section>
 *   )
 * }
 * ```
 *
 * Footer chrome receives `contactEmails` from the engine (see `template.chrome.Footer` props).
 */
export type { SiteContact, SiteContactEntry } from "@/lib/site-contact"
export { SiteContactEmailsList, siteContactEmailsPlainText } from "@/components/site-contact/SiteContactEmailsList"
export { ContactInquiryForm } from "@/components/site-contact/ContactInquiryForm"
export type { ContactInquiryFormLabels } from "@/components/site-contact/ContactInquiryForm"
