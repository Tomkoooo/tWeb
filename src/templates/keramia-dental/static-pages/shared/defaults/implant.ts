import type { CampaignPageContent } from "../schema"
import {
  KERAMIA_ADDRESS,
  KERAMIA_PHONE,
  KERAMIA_PROMO_PERIOD_HU,
} from "../../../lib/constants"

export const implantDefault: CampaignPageContent = {
  locale: "hu",
  hero: {
    badge: KERAMIA_PROMO_PERIOD_HU,
    title: "Pótolja a hiányzó fogait — magabiztos mosollyal",
    subtitle:
      "Fogpótlás és implantáció most 10% kedvezménnyel.\n\nPrémium implantátumok, élethű koronák és hidak — alapos 3D CT-diagnosztikával, fájdalommentesen, helyi érzéstelenítésben.",
    promoHighlight: "10%",
    promoSubtext: "kedvezmény a teljes fogpótlásra",
    ctaLabel: "Kérek időpontot",
    phone: KERAMIA_PHONE,
    location: KERAMIA_ADDRESS,
    image: "",
  },
  benefits: [
    {
      title: "3D CT-diagnosztika",
      description: "Pontos állapotfelmérés és csontvizsgálat 3D CBCT-felvétellel.",
    },
    {
      title: "Fájdalommentes",
      description: "Minden beavatkozás helyi érzéstelenítésben, kíméletesen.",
    },
    {
      title: "Saját fogtechnikai labor",
      description: "Élethű, precíz fogpótlás modern CAD/CAM technológiával.",
    },
    {
      title: "Hosszú távú garancia",
      description: "Bevált implantátumrendszerek és minőségi alapanyagok.",
    },
  ],
  offer: {
    eyebrow: "AZ AKCIÓRÓL",
    title: "10% a teljes fogpótlásra és implantációra",
    body: "Az akció a teljes fogpótlási palettát lefedi — prémium implantátumoktól a koronákig és fogsorokig. A folyamat mindig alapos konzultációval és 3D CT-diagnosztikával kezdődik.",
    bullets: [
      "Alapos szakorvosi konzultáció és 3D CT-diagnosztika",
      "A teljes fogpótlási paletta: koronák, hidak, fogsorok és implantátumok",
      "Prémium implantátumok és többtagú hidak is az akcióban",
      "Fájdalommentes kezelés helyi érzéstelenítésben",
      "Élethű, végleges fogpótlás saját fogtechnikai laborunkból",
      "10% kedvezmény a teljes beavatkozásra",
    ],
    discounts: [{ value: "−10%", label: "Minden megoldásra érvényes" }],
    footnotes: [
      "Az akció 2026. június 1. – augusztus 31. között érvényes.",
      "A kedvezmény kizárólag online jelentkezés esetén érvényes.",
    ],
  },
  process: {
    eyebrow: "A KEZELÉS MENETE",
    title: "Így zajlik a kezelés",
    subtitle: "A konzultációtól a végleges fogpótlásig — kiszámítható lépésekben.",
    steps: [
      {
        number: "01",
        title: "Konzultáció & 3D CT",
        description: "Alapos vizsgálat, digitális panorámaröntgen és 3D CBCT-felvétel.",
        duration: "1. találkozás",
      },
      {
        number: "02",
        title: "Személyre szabott terv",
        description: "Közösen meghatározzuk a pótlás típusát, árat, időtartamot és garanciát.",
        duration: "ingyenes kezelési terv",
      },
      {
        number: "03",
        title: "Fájdalommentes beavatkozás",
        description: "Helyi érzéstelenítésben, navigációs technikával is. Ideiglenes pótlást azonnal kap.",
        duration: "helyi érzéstelenítés",
      },
      {
        number: "04",
        title: "Végleges, élethű pótlás",
        description: "A gyógyulás után felkerül a végleges korona vagy híd.",
        duration: "tartós eredmény",
      },
    ],
  },
  services: {
    eyebrow: "MEGOLDÁSAINK",
    title: "Fogpótlás és implantáció a Kerámia Dentalnál",
    items: [
      {
        badge: "IMPLANTÁCIÓ",
        title: "Fogászati implantáció",
        description: "Titán implantátum élethű koronával — a legtartósabb megoldás.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "DIGITÁLIS 3D",
        title: "Navigációs implantálás",
        description: "3D-ben tervezett sebészi sablonnal — vágás és varrat nélkül.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "IMPLANTÁTUMRA",
        title: "Fixen rögzülő fogsor",
        description: "Stabilan rögzül, nem mozog, nem kell ragasztó.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "FÉMMENTES",
        title: "Cirkon korona",
        description: "Fémmentes korona tökéletes esztétikával.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "ESZTÉTIKA",
        title: "Préskerámia korona",
        description: "A legélethűbb megoldás frontfogakra.",
        ctaLabel: "Időpontot kérek →",
      },
      {
        badge: "KLASSZIKUS",
        title: "Fémkerámia korona",
        description: "Tartós, esztétikus és kedvező árú megoldás.",
        ctaLabel: "Időpontot kérek →",
      },
    ],
  },
  beforeAfter: {
    eyebrow: "AZ EREDMÉNY",
    title: "Új fogak, visszanyert életminőség",
    beforeLabel: "Foghiánnyal",
    afterLabel: "Pótlás után",
    caption: "Húzza a csúszkát az összehasonlításhoz · illusztráció",
  },
  results: {
    eyebrow: "AZ EREDMÉNY",
    title: "Új fogak, visszanyert életminőség",
    stats: [
      { value: "Akár 3–5 nap", label: "korona elkészítés" },
      { value: "Fájdalommentes", label: "helyi érzéstelenítés" },
      { value: "Garancia", label: "hosszú távra" },
    ],
    items: [
      {
        category: "FUNKCIÓ",
        title: "Visszanyert rágóképesség",
        description: "Újra bármit elfogyaszthat — stabilan rögzített fogakkal.",
      },
      {
        category: "ESZTÉTIKA",
        title: "Élethű esztétika",
        description: "Az eredeti fogtól megkülönböztethetetlen koronák és hidak.",
      },
      {
        category: "TARTÓSSÁG",
        title: "Tartós megoldás",
        description: "Bevált implantátumrendszerek, hosszú távú garanciával.",
      },
      {
        category: "ÖNBIZALOM",
        title: "Magabiztos mosoly",
        description: "Visszaadja az önbizalmát és az életkedvét.",
      },
    ],
  },
  why: {
    eyebrow: "MIÉRT NE HALOGASSA?",
    title: "Miért érdemes pótolni a hiányzó fogakat?",
    tip: "TIPP: Minél tovább marad pótolatlanul egy fog, annál nagyobb a csontvesztés.",
    body: "A foghiány nem csak esztétikai kérdés. Az időben elkezdett fogpótlás megelőzi a komolyabb problémákat.",
    bullets: [
      "A hiányzó fog miatt romlik a rágófunkció és az emésztés.",
      "A foghiány helyén az állcsont fokozatosan sorvad.",
      "Az implantátum megőrzi az állcsont állományát.",
      "Stabil pótlással visszatér a magabiztos rágás és mosoly.",
      "A 3D CT-diagnosztikának köszönhetően a kezelés kiszámítható.",
      "A foghiány hosszú távon pszichés terhet is jelenthet.",
    ],
  },
  faq: {
    eyebrow: "GYAKORI KÉRDÉSEK",
    title: "Amit a kezelésről tudni érdemes",
    items: [
      {
        question: "Mire vonatkozik a 10%-os kedvezmény?",
        answer:
          "Az akció a teljes fogpótlási palettára érvényes: implantátumokra, koronákra, hidakra és fogsorokra egyaránt.",
      },
      {
        question: "Fájdalmas az implantátum beültetése?",
        answer: "Nem. A beavatkozás helyi érzéstelenítésben, fájdalommentesen zajlik.",
      },
      {
        question: "Mennyi ideig tart a teljes folyamat?",
        answer: "Implantátumnál a gyógyulás után kerül fel a végleges korona; hidaknál rövidebb az idő.",
      },
      {
        question: "Mi van, ha kevés a csontom az implantátumhoz?",
        answer: "3D CT-vel felmérjük a csontállományt; csontpótlás vagy alternatív megoldás is lehetséges.",
      },
      {
        question: "Meddig tartanak ki az implantátumok?",
        answer: "Megfelelő szájhigiénia és kontroll mellett évtizedekig — hosszú távú garanciával dolgozunk.",
      },
      {
        question: "Implantátum, híd vagy fogsor — melyik a jó megoldás?",
        answer: "A konzultáción és CT-n együtt határozzuk meg a személyre szabott megoldást.",
      },
    ],
  },
  ctaBand: {
    title: "Kezdje el az új mosolyát még a nyáron!",
    subtitle: "Foglaljon időpontot a fogpótlás és implantáció akcióra.",
    bullets: [
      "Az akció 2026. június 1. – augusztus 31. között",
      "Csak online jelentkezéssel",
    ],
    ctaLabel: "Kérek időpontot",
  },
  contact: {
    eyebrow: "KAPCSOLAT",
    title: "Foglaljon időpontot az akcióra",
    subtitle: "Hagyja meg elérhetőségét — díjmentes konzultáció egyeztetéséhez visszahívjuk.",
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
    seoTitle: "Fogpótlás + implantáció akció | Kerámia Dental Székesfehérvár",
    seoDescription:
      "Fogpótlás és implantáció 10% kedvezménnyel a Kerámia Dentalnál. 3D CT-diagnosztika, prémium implantátumok, saját labor.",
  },
}
