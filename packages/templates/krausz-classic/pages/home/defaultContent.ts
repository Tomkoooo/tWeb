import type { HomeContent } from "./schema"

/**
 * Ported from the original Krausz Barkácsmester storefront (main@1fae4a56:
 * src/components/sections/{Hero,Story,Features,Contact}.tsx).
 *
 * Contact block uses the real values from the production `krausz_webshop`
 * DB's `shopcontents` collection (contact_email/phone/address). Hero/story
 * copy was never actually filled in on production (empty strings there) —
 * those fields here fall back to scripts/seed.ts's placeholder text and the
 * component's hardcoded defaults, so operators should review/replace them
 * from /admin/cms/home rather than treat them as real marketing copy.
 */
export const homeDefaultContent: HomeContent = {
  meta: {
    seoTitle: "Webshop | Krausz Barkácsmester",
    seoDescription: "Válogasson prémium szerszámaink és ipari gépeink közül. Krausz - A minőség garanciája.",
  },
  blocks: [
    {
      id: "hero-krausz",
      type: "hero",
      enabled: true,
      data: {
        title: "Mestermunka a kezedben",
        description:
          "Kiváló minőségű kalapácsok, csavarkulcsok és elektromos szerszámok a modern mesterembernek. Fedezd fel a Krausz minőséget!",
        primaryCtaLabel: "Irány a bolt",
        primaryCtaHref: "/shop",
        secondaryCtaLabel: "Rólunk",
        secondaryCtaHref: "#about",
        heroImage: "/generic-hero.svg",
        heroImages: ["/generic-hero.svg"],
        imageDurationSeconds: 4,
        heroDurationSeconds: 6,
        heroSlides: [],
        badges: ["Prémium minőség", "Garanciavállalás", "Gyors szállítás"],
      },
    },
    {
      id: "about-krausz",
      type: "about",
      enabled: true,
      data: {
        title: "A Krausz Örökség",
        paragraph:
          "Családi vállalkozásunk több mint 50 éve elkötelezett a minőségi szerszámok gyártása mellett. Minden darab, ami kikerül a kezünk közül, a precizitás és a tartósság jegyében készül. Hiszünk abban, hogy a jó munka alapja a kiváló szerszám.",
        accordions: [
          {
            title: "Küldetésünk: erő és precizitás",
            content:
              "Nem csak szerszámokat adunk el; eszközöket biztosítunk az építéshez és az alkotáshoz. Minden darabot úgy tesztelünk, hogy kibírja a legextrémebb ipari igénybevételt is.",
          },
          {
            title: "Krausz minőségi ígéret",
            content:
              "Szerszámaink magas széntartalmú acélból készülnek, ergonomikus markolattal. Ha Krausz szerszámot fogsz a kezedben, azonnal érzed a különbséget a tömegtermék és a mestermunka között.",
          },
          {
            title: "Innovatív fejlesztések",
            content:
              "Folyamatosan keressük az új technológiákat, legyen szó rezgéscsillapításról vagy intelligens akkumulátor kezelésről, hogy munkád hatékonyabb legyen.",
          },
        ],
        cards: [
          { title: "Biztonság", description: "Maximális védelem a legveszélyesebb munkák során is.", icon: "Shield" },
          { title: "Mesterség", description: "Minden kalapácsütésnél érezhető szakértelem.", icon: "Hammer" },
          { title: "Közösség", description: "Több ezer elégedett magyar mesterember bizalma.", icon: "Users" },
          { title: "Okos tervezés", description: "Ergonómia, ami kíméli az ízületeket hosszú távon.", icon: "Lightbulb" },
        ],
      },
    },
    {
      id: "features-krausz",
      type: "features",
      enabled: true,
      data: {
        title: "A Krausz előny",
        subtitle: "Amiért mesteremberek ezrei választják a Krausz szerszámokat.",
        cards: [
          {
            title: "Maximális teljesítmény",
            description: "Nagy teljesítményű és nehéz feladatokra tervezett ipari eszközök.",
            icon: "Zap",
          },
          {
            title: "Vaskezű garancia",
            description: "Élettartam garanciát vállalunk minden mester-szériás szerszámunkra.",
            icon: "ShieldCheck",
          },
          {
            title: "Villámgyors szállítás",
            description: "Szerszámaid 24 órán belül útnak indulnak a budapesti központunkból.",
            icon: "Truck",
          },
          {
            title: "Mester szaktanács",
            description: "Beszélj profi szakembereinkkel, ha nem tudod melyik szerszám a legjobb neked.",
            icon: "Headphones",
          },
          {
            title: "Mérnöki precizitás",
            description: "Minden darab tizedmilliméter pontosan illeszkedik a feladathoz.",
            icon: "Wrench",
          },
          {
            title: "Ipari minősítés",
            description: "Szigorú teszteknek vetjük alá minden termékünket, hogy bírhassák a gyűrődést.",
            icon: "Award",
          },
        ],
      },
    },
    {
      id: "products-krausz",
      type: "productGrid",
      enabled: true,
      data: {
        title: "Válogass szerszámaink közül",
        description: "Prémium szerszámok és ipari gépek — a minőség garanciája.",
        viewAllLabel: "Az összes termék",
        viewAllHref: "/shop",
        categoriesTitle: "Kiemelt kategóriák",
        categoriesDescription: "A legnépszerűbb kategóriáink, amelyekkel mestereink dolgoznak.",
        layout: "grid",
        maxItems: 8,
        selectedProductIds: [],
      },
    },
    {
      id: "testimonials-krausz",
      type: "testimonials",
      enabled: true,
      data: {
        title: "Amit a mestereink mondanak",
        subtitle: "Valódi vásárlói vélemények jelennek meg itt, amint beérkeznek.",
        items: [],
      },
    },
    {
      id: "contact-krausz",
      type: "contact",
      enabled: true,
      data: {
        title: "Lépj velünk kapcsolatba",
        description:
          "Kérdésed van a szerszámokkal kapcsolatban? Egyedi projekthez keresel megoldást? Szakértő csapatunk készen áll a segítségre.",
        companyName: "Krausz Barkácsmester",
        address: "8000 Székesfehérvár szárcsa utca 31.",
        phone: "+36307890399",
        email: "krauszbarkacs@gmail.com",
        sendButtonLabel: "Üzenet küldése",
        nameLabel: "Teljes név",
        emailLabel: "E-mail cím",
        messageLabel: "Üzenet",
      },
    },
  ],
}
