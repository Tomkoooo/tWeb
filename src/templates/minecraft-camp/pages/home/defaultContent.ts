import type { HomeContent } from "./schema"

const DEFAULT_MAP_EMBED =
  "https://maps.google.com/maps?q=R%C3%A9csei%20Center,%20Budapest&t=&z=15&ie=UTF8&iwloc=&output=embed"

export const homeDefaultContent: HomeContent = {
  meta: {
    seoTitle: "Mineshow tábor — GeekSummer",
    seoDescription:
      "Minecraft nyári tábor zsDavval Budapesten. Programozás, játék, turnusok a Récsei Centerben.",
  },
  blocks: [
    {
      id: "hero-mineshow",
      type: "hero",
      enabled: true,
      data: {
        title: "",
        description: "",
        primaryCtaLabel: "Jelentkezés",
        primaryCtaHref: "/jegyvasarlas",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
        heroImage: "/generic-hero.svg",
        heroImages: ["/generic-hero.svg"],
        imageDurationSeconds: 4,
        heroDurationSeconds: 6,
        heroSlides: [],
        badges: ["Récsei Center, 2026 nyár"],
      },
    },
    {
      id: "story-zsdav",
      type: "about",
      enabled: true,
      data: {
        title: "Mineshow tábor zsDavval Budapesten",
        paragraph:
          "Alkoss, játssz, programozz! Reggelente programozás, délutánonként játék — 6–12 éveseknek, saját vagy bérelt laptopkal.",
        image: "/generic-hero.svg",
        boxHeading: "Alkoss, játssz, programozz!",
        ctaLabel: "Jelentkezés",
        ctaHref: "/jegyvasarlas",
        bannerText: "Jelezd, hogy ott leszel, értesülj a friss infókról",
        accordions: [],
        cards: [],
      },
    },
    {
      id: "programs-intro",
      type: "richText",
      enabled: true,
      data: {
        title: "",
        html: "Meet & Greet zsDavval, Build Battle, Speed builders, BlockBench, Bedwars, Death Run, World Painter, Splegg, Guess my drawing, Mine Imator, Murder Mystery, Impostor Builders, Kahoot, UHC, Bingo survival, MINIGAME Party!",
      },
    },
    {
      id: "programs-gallery",
      type: "gallery",
      enabled: true,
      data: {
        title: "Programok",
        items: [
          { image: "/generic-hero.svg", caption: "Bedwars" },
          { image: "/generic-hero.svg", caption: "Murder Mystery" },
          { image: "/generic-hero.svg", caption: "Mine-imator" },
          { image: "/generic-hero.svg", caption: "Build Battle" },
          { image: "/generic-hero.svg", caption: "UHC verseny" },
          { image: "/generic-hero.svg", caption: "Death Run" },
        ],
      },
    },
    {
      id: "pricing-info",
      type: "about",
      enabled: true,
      data: {
        title: "Árak és fizetés",
        paragraph: `A tábor heti díja gyerekenként 75 000 Ft. Testvérkedvezmény: 10%. Early bird (májusi jelentkezés): 67 500 Ft.

Fizetés: SZÉP-kártya (három típus), bankkártya, készpénz belvárosi irodában.

Laptop bérlés: 10 000 Ft / hét / gyerek.

Lemondás: a kezdés előtt 2 héttel 100%, a kezdésig 50%, indulás után a hátralévő napok arányában 30%.`,
        accordions: [],
        cards: [],
      },
    },
    {
      id: "faq-mineshow",
      type: "about",
      enabled: true,
      data: {
        title: "Gyakori Kérdések",
        paragraph: "",
        accordions: [
          {
            title: "Meddig tart egy turnus?",
            content: "Hétfőtől péntekig, reggel 9-től délután 16-ig.",
          },
          {
            title: "Van testvérkedvezmény?",
            content: "Igen, 10% kedvezmény a második (és további) gyerekre.",
          },
          {
            title: "Milyen étkezési lehetőségek vannak?",
            content:
              "Normál, vegetáriánus, gluténmentes és laktózmentes étkezés kérhető jelentkezéskor.",
          },
          {
            title: "Mit hozzak magammal?",
            content: "Kényelmes ruha, kulacs, és ha van, saját laptop (vagy bérelhetsz nálunk).",
          },
          {
            title: "Milyen gép kell a saját laptophoz?",
            content:
              "Windows 10+, legalább 8 GB RAM, stabil internet — Minecraft Java Edition.",
          },
          {
            title: "Hány fő lesz egy turnuson?",
            content: "Maximum 20 gyerek turnusonként, 2–3 felnőtt felügyelővel.",
          },
          {
            title: "Mi van, ha a gyerek beteg lesz?",
            content:
              "A kezdés előtti lemondási feltételek szerint térítünk, orvosi igazolással egyeztetünk.",
          },
          {
            title: "Hogy lehet eljutni tömegközlekedéssel?",
            content:
              "M2 metró Stadionok megálló, majd gyalog vagy busz az Istvánmezei út felé.",
          },
          {
            title: "Hol lehet parkolni?",
            content: "A Récsei Center környékén utcai parkolás és mélygarázs is elérhető.",
          },
        ],
        cards: [],
      },
    },
    {
      id: "contact-venue",
      type: "contact",
      enabled: true,
      data: {
        title: "Récsei Center, 1146 Budapest, Istvánmezei út 6.",
        description: "",
        companyName: "PlayIT Entertainment Kft.",
        address: "Récsei Center, 1146 Budapest, Istvánmezei út 6.",
        venueShort: "Récsei Center, 2026 nyár",
        mapEmbedUrl: DEFAULT_MAP_EMBED,
        phone: "",
        email: "event@playit.hu",
      },
    },
  ],
}
