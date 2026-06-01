/** Shared KockaKemp footer document for seed scripts. */

export const FACEBOOK_EVENT_URL =
  "https://www.facebook.com/events/2275291626335927/?acontext=%7B%22event_action_history%22%3A[%7B%22surface%22%3A%22search%22%7D%2C%7B%22mechanism%22%3A%22attachment%22%2C%22surface%22%3A%22newsfeed%22%7D]%2C%22ref_notif_type%22%3Anull%7D"

export const ORGANIZER_TITLE =
  "A KockaKemp tábor szervezője az Eseményszervezés.hu BTL ügynökség Kft."

export function buildMinecraftCampFooterDoc() {
  return {
    key: "footer",
    tagline: "",
    quickLinksTitle: "Hasznos linkek",
    quickLinks: [
      { label: "Főoldal", href: "https://kockakemp.hu" },
      { label: "Rólunk", href: "#rolunk" },
      { label: "Termékek", href: "/jegyvasarlas" },
    ],
    categoriesTitle: "Kategóriák",
    browseProductsLabel: "Termékek böngészése",
    contactTitle: "Kapcsolat",
    newsletterLabel: "Hírlevél",
    newsletterPlaceholder: "E-mail cím",
    copyrightText: "© {year} {brand}. Minden jog fenntartva.",
    socialLinks: [
      { platform: "facebook", enabled: true, url: FACEBOOK_EVENT_URL },
      { platform: "instagram", enabled: false, url: "" },
      { platform: "twitter", enabled: false, url: "" },
      { platform: "youtube", enabled: false, url: "" },
    ],
    organizerSection: {
      title: ORGANIZER_TITLE,
      companyName: "",
      registeredAddress: "",
      mailingAddress: "",
      openingHours: "",
    },
    paymentMethodsNote: "Fizetés: bankkártya (Stripe)",
  }
}
