import type { CampaignPageContent } from "../schema"
import {
  KERAMIA_ADDRESS,
  KERAMIA_PHONE,
  KERAMIA_PROMO_PERIOD_HU,
} from "../../../lib/constants"

export const fogfeheritesDefault: CampaignPageContent = {
  locale: "hu",
  hero: {
    badge: KERAMIA_PROMO_PERIOD_HU,
    title: "Ragyogó, fehér mosoly egyetlen óra alatt",
    subtitle:
      "Fogfehérítés + fogkőleszedés most 10% + 10% kedvezménnyel.\n\nEgy alapos ultrahangos fogkőleszedés, majd hidegfényű klinikai fogfehérítés — egyetlen kényelmes ülésben. Az eredmény akár 5–8 árnyalattal fehérebb, egészséges mosoly.",
    promoHighlight: "10% + 10%",
    promoSubtext: "kedvezmény a két kezelésre",
    ctaLabel: "Kérek időpontot",
    phone: KERAMIA_PHONE,
    location: KERAMIA_ADDRESS,
    image: "",
  },
  benefits: [
    {
      title: "Akár 5–8 árnyalat",
      description: "Látványosan világosabb mosoly már egyetlen rendelői kezelés alatt.",
    },
    {
      title: "Kb. 1 óra alatt",
      description: "A fogkőleszedés és a fehérítés egyetlen kényelmes ülésben.",
    },
    {
      title: "Kíméletes, fájdalommentes",
      description: "Érzéstelenítés nélkül, a fogíny egészségét is helyreállítva.",
    },
    {
      title: "Biztonságos eljárás",
      description: "Nem károsítja a zománcot, a töméseket és a koronákat.",
    },
  ],
  offer: {
    eyebrow: "AZ AKCIÓRÓL",
    title: "Két kezelés, egy ragyogó eredmény",
    body: "A professzionális fogfehérítés alapfeltétele a tiszta, fogkőmentes fogazat — ezért kezeljük a kettőt együtt. A kezelés egy alapos ultrahangos fogkőleszedéssel és sópolírozással indul.\n\nEzt követi a klinikai fogfehérítés Opalescence géllel és hidegfényű LED-lámpával. Mindössze egy óra alatt több árnyalattal fehérebb mosoly.",
    bullets: [
      "Ultrahangos fogkőleszedés és sópolírozás a tiszta alapért",
      "Hidegfényű LED-lámpás Opalescence fogfehérítés",
      "Akár 5–8 árnyalatnyi világosodás egyetlen ülésben",
      "A fogíny egészségét is helyreállítjuk",
      "Mindkét kezelés árából 10–10% kedvezmény",
    ],
    discounts: [
      { value: "−10%", label: "Fogkőleszedés" },
      { value: "−10%", label: "Fogfehérítés" },
    ],
    footnotes: [
      "Az akció 2026. június 1. – augusztus 31. között érvényes.",
      "A kedvezmény kizárólag online jelentkezés esetén érvényes.",
    ],
  },
  process: {
    eyebrow: "A KEZELÉS MENETE",
    title: "Így zajlik a kezelés",
    subtitle: "Három egyszerű lépés — egyetlen, kényelmes ülésben.",
    steps: [
      {
        number: "01",
        title: "Fogkőleszedés & polírozás",
        description:
          "Ultrahangos depurátorral eltávolítjuk a fogkövet és a lepedéket, majd sópolírozással a legmakacsabb elszíneződéseket is.",
        duration: "~20–50 perc",
      },
      {
        number: "02",
        title: "Hidegfényű LED fehérítés",
        description:
          "A fogínyt gondosan izoláljuk, felvisszük a professzionális Opalescence fehérítő gélt, majd hidegfényű LED-lámpával világosítjuk a zománcot.",
        duration: "~45–60 perc",
      },
      {
        number: "03",
        title: "Ragyogó, fehér mosoly",
        description: "Az ülés végén akár 5–8 árnyalattal fehérebb, egészséges és fogkőmentes mosoly vár.",
        duration: "azonnali eredmény",
      },
    ],
  },
  services: {
    eyebrow: "KEZELÉSEINK",
    title: "Fehérítés és fogtisztítás a Kerámia Dentalnál",
    items: [
      {
        badge: "AKCIÓS −10%",
        title: "Ultrahangos fogkőleszedés",
        description: "Az akció első lépése: ultrahangos depurátorral távolítjuk el a fogkövet és a lepedéket.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "AKCIÓS −10%",
        title: "Rendelői LED fogfehérítés",
        description: "Opalescence Boost peroxidos gél és hidegfényű LED-lámpa: akár 5–8 árnyalatnyi világosodás.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "ALTERNATÍVA",
        title: "Otthoni fogfehérítés",
        description: "Egyedi fehérítő sín és Opalescence gél: a legkíméletesebb módszer otthoni használatra.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "KIEGÉSZÍTŐ",
        title: "Homokfúvásos fogtisztítás",
        description: "Ízesített tisztítóporral és nagynyomású vízsugárral távolítjuk el az elszíneződéseket.",
        ctaLabel: "Időpontot kérek →",
      },
    ],
  },
  beforeAfter: {
    eyebrow: "AZ EREDMÉNY",
    title: "Akár 5–8 árnyalattal fehérebb",
    beforeLabel: "Előtte",
    afterLabel: "Utána",
    caption: "Húzza a csúszkát az összehasonlításhoz · illusztráció",
  },
  results: {
    eyebrow: "AZ EREDMÉNY",
    title: "Mit nyer a kezeléssel?",
    stats: [],
    items: [
      {
        category: "FEHÉRÍTÉS",
        title: "Ragyogóan fehér mosoly",
        description: "Akár 5–8 árnyalattal világosabb fogak, azonnal látható eredménnyel.",
      },
      {
        category: "EGÉSZSÉG",
        title: "Fogkőmentes, egészséges íny",
        description: "Eltávolítjuk a fogkövet és a lepedéket, helyreállítva a fogíny egészségét.",
      },
      {
        category: "TISZTASÁG",
        title: "Tükörsima fogfelszín",
        description: "A polírozott zománcon lassabban tapad meg az új lepedék és fogkő.",
      },
      {
        category: "ÖNBIZALOM",
        title: "Magabiztosság, friss lehelet",
        description: "Egy ragyogó mosoly, amely önbizalmat ad — és tartósan friss érzést.",
      },
    ],
  },
  why: {
    eyebrow: "MIÉRT EZ A SORREND?",
    title: "Miért előzi meg a fogkőleszedés a fehérítést?",
    tip: "TIPP: A professzionális fogtisztítást érdemes évente kétszer elvégeztetni.",
    body: "A fogkő és a lepedék nemcsak esztétikai gond: fogínygyulladást, ínyvérzést okozhat. A tiszta felületen a fehérítő gél egyenletesen hat.",
    bullets: [
      "A fogfehérítés alapfeltétele a tiszta, fogkőmentes fogazat.",
      "A fogkő fogínygyulladást és ínyvérzést okozhat.",
      "A lepedék elszíneződést és kellemetlen leheletet okoz.",
      "A tisztítás után a zománc valódi színe látszik — a fehérítés látványosabb.",
      "A polírozott felületen lassabban tapad meg az új lepedék.",
      "Egymásra épülő kezelésként, egyetlen ülésben a leghatékonyabb.",
    ],
  },
  faq: {
    eyebrow: "GYAKORI KÉRDÉSEK",
    title: "Amit a kezelésről tudni érdemes",
    items: [
      {
        question: "Miért kell a fehérítés előtt fogkőleszedés?",
        answer:
          "A fehérítő gél csak tiszta, fogkőmentes felületen tud egyenletesen hatni. A fogkőleszedés és a polírozás eltávolítja a lepedéket és a makacs elszíneződéseket.",
      },
      {
        question: "Fájdalmas a kezelés?",
        answer:
          "Nem. A kezelés érzéstelenítés nélkül, kíméletesen zajlik. Enyhe érzékenység előfordulhat, de általában rövid ideig tart.",
      },
      {
        question: "Mennyi ideig tart a teljes kezelés?",
        answer: "A fogkőleszedés és a fehérítés együtt nagyjából 1–1,5 órát vesz igénybe.",
      },
      {
        question: "Mennyivel lesznek fehérebbek a fogaim?",
        answer: "Egy rendelői kezeléssel akár 5–8 árnyalattal világosabb eredmény érhető el.",
      },
      {
        question: "Meddig tart az eredmény, és ismételhető?",
        answer:
          "Az eredmény hónapokig tarthat; az életmód befolyásolja. Szakszerűen ismételhető, a fogorvos tanácsadása alapján.",
      },
      {
        question: "Kinek nem ajánlott a fogfehérítés?",
        answer:
          "Terhesség, szoptatás, súlyos fogínygyulladás vagy nem kezelt fogszuvasodás esetén nem javasolt. Konzultáción egyeztetjük.",
      },
    ],
  },
  ctaBand: {
    title: "Kezdje a nyarat ragyogó mosollyal!",
    subtitle: "Foglaljon időpontot a fogfehérítés + fogkőleszedés akcióra.",
    bullets: [
      "Az akció 2026. június 1. – augusztus 31. között érvényes",
      "Kizárólag online jelentkezés esetén",
    ],
    ctaLabel: "Kérek időpontot",
  },
  contact: {
    eyebrow: "KAPCSOLAT",
    title: "Foglaljon időpontot az akcióra",
    subtitle: "Hagyja meg elérhetőségét, és munkatársunk hamarosan visszahívja.",
    nameLabel: "Teljes név",
    phoneLabel: "Telefonszám",
    emailLabel: "E-mail cím",
    interestLabel: "Mire szeretne időpontot?",
    messageLabel: "Telefon és megjegyzés (opcionális)",
    privacyText:
      "Az adatkezelési tájékoztatót elolvastam és elfogadom, hozzájárulok adataim kezeléséhez a kapcsolatfelvétel céljából.",
    submitLabel: "Jelentkezés elküldése",
    interestOptions: [],
  },
  meta: {
    seoTitle: "Fogfehérítés + fogkőleszedés akció | Kerámia Dental Székesfehérvár",
    seoDescription:
      "Fogfehérítés és fogkőleszedés akció a Kerámia Dentalnál — 10% + 10% kedvezmény. Akár 5–8 árnyalattal fehérebb mosoly egyetlen óra alatt.",
  },
}
