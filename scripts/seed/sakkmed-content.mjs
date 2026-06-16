import { PROJECT_LINKS, SERVICE_LINKS } from "./sakkmed-constants.mjs"

function page(title, sections, gallery = [], contactEmail = "") {
  return {
    hero: {
      title,
      subtitle: sections[0]?.body.slice(0, 220) ?? "",
      image: sections[0]?.image ?? gallery[0]?.image ?? "",
    },
    sections: sections.map((s) => ({
      heading: s.heading ?? "",
      body: s.body,
      image: s.image ?? "",
    })),
    gallery: gallery.map((g) => ({
      image: g.image ?? "",
      caption: g.caption ?? "",
    })),
    contactEmail,
    contactLabel: "Megrendelés és információ",
    meta: {
      seoTitle: `${title} | SAKKMED 2005 Kft.`,
      seoDescription: sections[0]?.body.slice(0, 160) ?? title,
    },
  }
}

/** Default copy scraped from https://balazsgabor3.wixsite.com/sakkmed2 — images filled by seed script. */
export const STATIC_DEFAULTS = {
  butoraink: page(
    "Bútoraink",
    [
      {
        body: "Kínálatunkat a felmerülő igényeknek megfelelően állítottuk össze. Bútorokon kívül portfóliónk fontos részét képezik a kiegészítők, textíliák, spandex huzatok.",
      },
      {
        body: "Bútort keres rendezvényére? Nálunk bátran válogathat, hiszen kínálatunkban megtalálhatóak beltéri és kültéri bútorok egyaránt.",
      },
      {
        heading: "Beltéri bútorok",
        body: "Beltérre ajánljuk alkalomtól függően lounge és alkalmi bútorainkat, amelyeket kültéren is lehet használni, megfelelő védelem mellett. Bútoraink mellé textiliák is a rendelkezésére állnak, amennyiben nem találja meg amit keresett, dekor és varróműhelyünk az Ön igénye szerint legyártja.",
      },
      {
        heading: "Kültéri bútorok",
        body: "Kültéri bútorainkat alapvetően szabadtéri rendezvényekre ajánljuk. Tökéletesek ültetett rendezvényekre, illetve piknik rendezvényekre is. Igény esetén asztalos műhelyünk minden kívánságát teljesíti.",
      },
      {
        body: "Bútoraink több féle színben elérhetőek, könnyen tisztíthatóak és tárolhatóak.",
      },
      {
        heading: "Asztalok",
        body: "Táblaasztal: fehér műanyag, vagy fa hatású asztallappal, behajtható lábakkal. Mérete 180x80 cm\nBankett asztal: 8-10 személyes, kerek bankett asztal, behajtható lábakkal. Mérete: 180 cm\nMagas asztal: fehér műanyag, vagy fa hatású asztallappal, behajtható lábakkal. Mérete 110x80 cm\nKönyöklő: fekete műanyag, Mérete 110x80 cm\nDohányzó asztal: Méret 90/50",
      },
    ],
    [],
    "butor@esemenyszervezes.hu"
  ),
  installaciok: page("Installációk", [
    {
      body: "Egyedi tervezésű standjainkkal garantáljuk, hogy cége kitűnik a versenytársak közül. A cég arculatához tervezzük az egyedi formát, modern bútorokkal és kiegészítőkkel tesszük teljessé a megjelenést. Az installációk által nagy reklámfelületet nyer, mellyel még vonzóbbá teheti a vásárlók, üzleti partnerek számára a standját. Kültéren és beltéren is építünk standokat.",
    },
    {
      heading: "Syma rendszerű installáció",
      body: "Alumínium oszlop és kötőelem, fehér vagy nyomtatott betételemekkel. Egyszerű és egyedi installáció megépítésére is alkalmas, számtalan kombinációs lehetőséget nyújt a Syma rendszer.",
    },
    {
      heading: "Alutruss installáció",
      body: "A rendezvényvilágból ismert Alutruss rendszer egyenes, sarok vagy íves elemeivel kreatív megoldásokat kínál installációk kivitelezéséhez.",
    },
    {
      heading: "Layher installáció",
      body: "Az építkezésekről már jól ismert Layher rendszer kiválóan alkalmas kültéri és beltéri rendezvények egyedi felépítmények, fedések, vagy akár színpadok kivitelezésére is.",
    },
    {
      heading: "Vásári installációk",
      body: "A vásárok egységes arculatára törekedve, kézművesek, kereskedők részére kecskelábú árusító asztalokat kínálunk. Az asztalok napfénytetővel felszereltek. Mérete: 200 x 80 cm.",
    },
  ]),
  traverz: page("Traverz rendszerek", [
    {
      body: "A rendezvényvilágból ismert Alutruss rendszer egyenes, sarok vagy íves elemeivel kreatív megoldásokat kínál installációk kivitelezéséhez. Egyszerűen építhető, önmagában hightech megjelenést nyújt, de dekorációval a legelegánsabb megjelenést is el tudjuk érni.",
    },
    {
      heading: '1 "utas" traverz',
      body: "35mm és 50mm csőrendszer 2mm falvastagság 0,01m - 2,5m univerzális kocka, 2-3-4-5 irányú elemek T megoldások, speciális alakok",
    },
    {
      heading: '3 "utas" traverz',
      body: "35mm és 50mm csőrendszer 2mm falvastagság 0,01m - 4,0m 2-3-4-5 irányú elemek T megoldások, speciális alakok",
    },
    {
      heading: "Fix lábas fedések, sátrak",
      body: "Különféle rendezvények és kiállítások legkedveltebb fedése. A fedést, sátrat az Ön igénye szerint megtervezzük és kivitelezzük. Oldalfal és sátortető opcionálisan rendelhető!",
    },
  ]),
  layher: page("Layher rendszerek", [
    {
      body: "Az építkezésekről már jól ismert Layher rendszer bebizonyította, hogy kiválóan alkalmas kültéri és beltéri rendezvények egyedi felépítmények, fedések, vagy akár színpadok kivitelezésére is.",
    },
  ]),
  emelestechnika: page("Emeléstechnika", [
    {
      heading: "1t emelőmotor",
      body: "Emelési magasság (lánchossz): 24m\nTeherbírás: 1000 kg\nElérhető mennyiség: 40+ db\n8 csatornás motorvezérlő, bemeneti csatlakozó: 3x32A",
    },
    {
      heading: "250kg emelőmotor",
      body: "Emelési magasság (lánchossz): 24m\nTeherbírás: 250 kg\nElérhető mennyiség: 60+ db\n2 csatornás motorvezérlő, bemeneti csatlakozó: 3x16A",
    },
    {
      heading: "Motorvezérlő",
      body: "Csatlakozó 3x16A (4P)\nMéretek: 5m | 10m | 20m\nElérhető mennyiség: méretenként 50-50 db",
    },
  ]),
  alutent: page("Alutent", [
    {
      body: "A szabadtéri rendezvények egyik legkedveltebb eszköze az alutent sátrak. Sátraink két méretben, 6x3 és 3x3 méretben érhetőek el, fekete és fehér színben. A sátrak padlóburkolását műanyagaljzattal, színpadelemmel, illetve állítható layher rendszerrel biztosítjuk.",
    },
    {
      body: "Sátrainkat az Ön igénye szerint kreatívan dekorálhatjuk, aminek köszönhetően még látványosabb lesz az eredmény.",
    },
    {
      heading: "Alutent 6x3 sátor",
      body: "Fehér és fekete színben, oldalfallal elérhető",
    },
    {
      heading: "Alutent 3x3 sátor",
      body: "Fehér és fekete színben, oldalfallal elérhető",
    },
  ], [], "butor@esemenyszervezes.hu"),
  aramhalozat: page("Áramhálózat", [
    {
      body: "A helyszín adottságait figyelembe véve teljes elektromos hálózat kiépítést vállalunk. Amennyiben nem áll rendelkezésre a megfelelő teljesítményű kiállás, úgy áramfejlesztők használatával vagy a területi illetékes áramszolgáltató bevonásával oldjuk meg az áramellátást.",
    },
    {
      body: "Az elektromos hálózat tervezéstől, az ügyintézésen át, a kivitelezésig teljes körű lebonyolítást végzünk regisztrált villanyszerelő szakemberek közreműködésével. Minden munkánk után az átadás-átvételi jegyzőkönyvvel egyidejűleg a hatályos jogszabályoknak megfelelő érintésvédelmi jegyzőkönyvet is készítünk.",
    },
    {
      body: "Elektromos berendezéseink évente bevizsgálásra kerülnek, érintésvédelmi relével ellátottak. Az érintésvédelmi szabályoknak megfelelő kábelekkel, elosztókkal, kapcsolószekrényekkel rendelkezünk.",
    },
  ]),
  vizmu: page("Közműhálózat", [
    {
      body: "A helyszín adottságainak megfelelően teljes közműhálózat (víz- és csatorna) kiépítését kivitelezzük. A vezetékek magas nyomású, műanyag csövek, melyek mind víz, mind szennyvíz szállítására alkalmasak.",
    },
    {
      body: "Szakembereink a közmű kiállások ismeretében, a vízvételi pontokon vízminta alapján beszerzik a szükséges hatósági engedélyeket, a rendezvény igényei alapján tervet készítenek, és a teljes üzemelést ellátják.",
    },
  ]),
  syma: page("Syma", [
    {
      body: "Alumínium oszlop és kötőelem, fehér vagy nyomtatott betételemekkel. Egyszerű és egyedi installáció megépítésére is alkalmas, számtalan kombinációs lehetőséget nyújt a Syma rendszer. Alkalmazkodik a helyi adottságokhoz, egyszerűen telepíthető vagy akár átépíthető.",
    },
    {
      body: "További információkért tekintse meg katalógusunkat!",
    },
  ]),
  "fesztival-vip": page("Fesztivál VIP", [
    {
      body: "A FESZTIVÁLVIP ötlete sokéves rendezvény és kommunikációs tapasztalataink alapján született. Minden fesztiválnak – lehet az szabadtéri, avagy beltéri, kulturális, szórakoztató, sport vagy gasztro tematikájú – kell, hogy legyen egy kisebb vagy nagyobb helye, ahol legfontosabb partnereivel nyugodt és elkülönített helyszínen találkozhat kiemelt vendégeivel.",
    },
    {
      body: "Így lehet bárhol, bármilyen időben fesztiválod exkluzív VIP helyszín holisztikus megtervezésére, felépítésére, nyomdai-, eszközgyártási, installációs- és dekorációs munkáira itt vagyunk mi a FESZTIVÁLVIP csapata. Legyen az 1000 vagy több 10 000 fős rendezvény, Magyarországon ezen a területen piacvezetőnek számítunk.",
    },
    {
      body: "A FESZTIVÁLVIP mögött olyan cégek és csapat van, akik saját tervezésű installációkat biztosítanak ügyfeleiknek széles skálájú saját eszközparkkal.",
    },
  ]),
  "sigma-kontener": page("Sigma konténer", [
    {
      body: "SIGMA összecsukható konténer — tökéletesen alkalmas bármilyen rendezvény, építkezés során felmerülő iroda, öltöző, raktár, jegy- és elárusítóhely szállásmegoldásra.",
    },
    {
      body: "A panelek tetszés szerint kiszedhetők, kombinálhatók és cserélhetők. A konténer 2,4m x 3,0m alapterületű és 2,5m magas, 670kg súlyú. Légkondicionálható, fűthető, dekorálható és igény szerint bármely irányba sorolható.",
    },
    {
      body: "Szállítása akár 3,5t kisteherautóval is megoldható. Cégünk nemcsak a konténer bérbeadásával, de áramellátás, klimatizálás, berendezés, dekorálás terén is teljeskörű szolgáltatást nyújt.",
    },
  ], [], "marti.gyorgy@bbimmo.hu"),
}



const ABOUT_WHO =
  "Szakemberek vagyunk | Megbízhatóak vagyunk | Innovatívak vagyunk | Operatívak vagyunk | Nyitottak vagyunk | Rugalmasak vagyunk | Precízek vagyunk | Tapasztaltak vagyunk | Dinamikusak vagyunk | Csapat vagyunk"

const ABOUT_WHAT =
  "Események komplett műszaki felügyelete, koordinálása | Rendezvénytechnika | Hang-, fény-, színpad- és látványtechnika | Kül- és beltéri rendezvény installációk | Műszaki kivitelezés | Áram- és vízhálózat | Biztonságtechnika | Egészségügyi szolgáltatás | Eszköz bérbeadás | Mobil WC | Kordon | Kerítés | Bútorzat | Játékok kicsiknek és nagyoknak | Fotózás | Catering | Booking | Fellépők"

const ABOUT_WHERE =
  "Konferencia | Workshop | Kiállítás | Családi nap | Fesztivál | Promóció | Céges party | Csapatépítés | Márka aktivitások | Sajtótájékoztató | Esküvő | Koncert | Sportesemények | Saját rendezvények"

const ABOUT_WHY =
  "Üzletpolitikánk ügyfélközpontú. Szakmai tapasztalatunk minőségi kivitelezéssel társul. Saját eszközparkkal rendelkezünk, melyet folyamatosan fejlesztünk. Komplett kivitelezést vállalunk, így áraink csomagonként, a piaci árakhoz képest kedvezőbbek. Partnereink mindig megelégedéssel zárják a rendezvényeiket, így szívesen ajánlanak minket másoknak is."

export function buildSakkmedHomeContent(img) {
  const content = {
  meta: {
    seoTitle: "SAKKMED 2005 Kft. | Rendezvénytechnika és kivitelezés",
    seoDescription:
      "A sikeres rendezvény kivitelezője — hang-, fény-, színpadtechnika, installációk, bútorok és teljes műszaki háttér.",
  },
  blocks: [
    {
      id: "hero-sakkmed",
      type: "hero",
      enabled: true,
      data: {
        title: "A SIKERES",
        description: "RENDEZVÉNY\nKIVITELEZŐJE",
        primaryCtaLabel: "Kapcsolat",
        primaryCtaHref: "#contact",
        secondaryCtaLabel: "Szolgáltatások",
        secondaryCtaHref: "#services",
        heroImage: "/generic-hero.svg",
        heroImages: ["/generic-hero.svg", "/generic-hero.svg"],
        imageDurationSeconds: 5,
        heroDurationSeconds: 6,
        heroSlides: [],
        badges: ["SAKKMED 2005 Kft."],
      },
    },
    {
      id: "services-sakkmed",
      type: "features",
      enabled: true,
      data: {
        title: "Szolgáltatásaink",
        subtitle: "Komplett rendezvénytechnika és műszaki háttér egy kézből",
        cards: [
          {
            title: "Rendezvény koordináció",
            description:
              "Események komplett műszaki felügyelete | Programszervezés, Booking | Party szervíz, Catering | Játékok | Fotózás, Videózás, drón",
            icon: "",
          },
          {
            title: "Rendezvénytechnika",
            description: "Hangtechnika | Fénytechnika | Látványtechnika | Színpadtechnika",
            icon: "",
          },
          {
            title: "Traverz és fedések",
            description:
              "Traverz rendszerek | Emeléstechnika | Layher rendszer | Fedések | Alutent sátrak",
            icon: "",
          },
          {
            title: "Installációk",
            description: "Kültéri installációk | Kiállítási kivitelezés",
            icon: "",
          },
          {
            title: "Bútorok és dekor",
            description: "Bútorok | Kapumegoldások | Textílek, dekorációk",
            icon: "",
          },
          {
            title: "Műszaki kivitelezés",
            description:
              "Egyedi installációk | Műszaki kivitelezés | Áramhálózat | Vízhálózat | Biztonságtechnika | Egészségügy | Mobil WC | Kordon, Kerítés",
            icon: "",
          },
        ],
      },
    },
    {
      id: "about-sakkmed",
      type: "about",
      enabled: true,
      data: {
        title: "Rólunk",
        paragraph: ABOUT_WHY,
        accordions: [
          { title: "Kik vagyunk?", content: ABOUT_WHO },
          { title: "Mit csinálunk?", content: ABOUT_WHAT },
          { title: "Hol vagyunk jelen?", content: ABOUT_WHERE },
          { title: "Miért érdemes minket választani?", content: ABOUT_WHY },
        ],
        cards: [
          { title: "15", description: "év tapasztalat" },
          { title: "5211", description: "rendezvény" },
          { title: "870", description: "ügyfél" },
          { title: "10M", description: "résztvevő" },
        ],
      },
    },
    {
      id: "projects-sakkmed",
      type: "gallery",
      enabled: true,
      data: {
        title: "Projektjeink",
        items: PROJECT_LINKS.map((p) => ({
          image: "/generic-hero.svg",
          caption: p.label,
        })),
      },
    },
    {
      id: "clients-sakkmed",
      type: "gallery",
      enabled: true,
      data: {
        title: "Ügyfeleink",
        items: [
          { image: "/generic-hero.svg", caption: "Partner" },
          { image: "/generic-hero.svg", caption: "Partner" },
          { image: "/generic-hero.svg", caption: "Partner" },
          { image: "/generic-hero.svg", caption: "Partner" },
        ],
      },
    },
    {
      id: "gallery-sakkmed",
      type: "gallery",
      enabled: true,
      data: {
        title: "Galéria",
        items: [
          { image: "/generic-hero.svg", caption: "Rendezvény" },
          { image: "/generic-hero.svg", caption: "Installáció" },
          { image: "/generic-hero.svg", caption: "Színpad" },
          { image: "/generic-hero.svg", caption: "VIP" },
          { image: "/generic-hero.svg", caption: "Fedés" },
          { image: "/generic-hero.svg", caption: "Technika" },
        ],
      },
    },
    {
      id: "contact-sakkmed",
      type: "contact",
      enabled: true,
      data: {
        title: "Kapcsolat",
        description:
          "Soroksári úti központi irodánkban ügyfélfogadás kizárólag előzetes időpontegyeztetés után lehetséges.",
        companyName: "SAKKMED 2005 Kft.",
        address: "1095 Budapest, Soroksári út 48.",
        phone: "",
        email: "balazs.gabor@esemenyszervezes.hu",
        sendButtonLabel: "Küldés",
        nameLabel: "Név",
        emailLabel: "E-mail",
        messageLabel: "Üzenet",
        venueShort: "Raktár: 1194 Budapest, Vásár tér 1.",
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2695.5!2d19.089!3d47.46!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTA5NSBCdWRhcGVzdCwgU29yb2tz4bFpcmkgFLrSASA0OC4!5e0!3m2!1shu!2shu!4v1!5m2!1shu!2shu",
      },
    },
    {
      id: "service-links-sakkmed",
      type: "richText",
      enabled: true,
      data: {
        title: "",
        html: SERVICE_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join(" · "),
      },
    },
  ],
  }
  return patchHomeImages(content, img)
}

export function buildSakkmedStaticPages(img, crawledPages = {}) {
  const pages = structuredClone(STATIC_DEFAULTS)

  for (const [slug, page] of Object.entries(crawledPages)) {
    if (!pages[slug]) continue
    const assets = img.pages?.[slug]
    if (page.contactEmail) pages[slug].contactEmail = page.contactEmail
    if (assets?.hero) pages[slug].hero.image = assets.hero
    if (assets?.gallery?.length) {
      pages[slug].gallery = assets.gallery.map((image) => ({
        image,
        caption: pages[slug].hero.title,
      }))
    }
  }

  if (pages["fesztival-vip"] && img.fesztivalVip) {
    pages["fesztival-vip"].hero.image = img.fesztivalVip
    const extra = img.pages?.["fesztival-vip"]?.gallery?.[0]
    pages["fesztival-vip"].gallery = [
      { image: img.fesztivalVip, caption: "Fesztivál VIP" },
      ...(extra && extra !== img.fesztivalVip ? [{ image: extra, caption: "Fesztivál VIP" }] : []),
    ]
  }

  if (img.sigmaPage && pages["sigma-kontener"]) {
    pages["sigma-kontener"].hero.image = img.sigmaPage
    pages["sigma-kontener"].gallery = (img.sigmaGallery ?? [img.sigmaPage]).map((image) => ({
      image,
      caption: "Sigma konténer",
    }))
  }

  return pages
}

function patchHomeImages(content, img) {
  const hero = content.blocks.find((b) => b.id === "hero-sakkmed")
  if (hero?.type === "hero") {
    hero.data.heroImage = img.hero1
    hero.data.heroImages = [img.hero1, img.hero2]
  }
  const projects = content.blocks.find((b) => b.id === "projects-sakkmed")
  if (projects?.type === "gallery") {
    projects.data.items = projects.data.items.map((item, idx) => ({
      ...item,
      image: idx === 0 ? img.fesztivalVip : img.sigma,
    }))
  }
  const clients = content.blocks.find((b) => b.id === "clients-sakkmed")
  if (clients?.type === "gallery") {
    const logos = [img.client1, img.client2, img.client3, img.client4]
    clients.data.items = clients.data.items.map((item, idx) => ({
      ...item,
      image: logos[idx] || img.logo,
    }))
  }
  const gallery = content.blocks.find((b) => b.id === "gallery-sakkmed")
  if (gallery?.type === "gallery" && img.gallery?.length) {
    const captions = ["Rendezvény", "Installáció", "Színpad", "VIP", "Fedés", "Technika"]
    gallery.data.items = img.gallery.slice(0, 6).map((image, idx) => ({
      image,
      caption: captions[idx] ?? "",
    }))
  }
  return content
}
