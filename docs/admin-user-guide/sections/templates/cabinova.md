## Mire való ez a sablon?

A **Cabinova** csendes, modern ház/katalógus sablon. A látogatók **modelleket** böngésznek és **érdeklődést** küldenek — nincs kosár és pénztár a felületen (inquiry-only).

**Telepítés:** `DEPLOYMENT_KEY=cabinova`, webshop bekapcsolva a termék adminhoz.

## Főoldal blokkok

**Szerkesztés:** [/admin/cms/home](/admin/cms/home)

| Blokk | Mit jelenít meg? |
| --- | --- |
| **Hero** | Erdei/borítókép, főcím, manifestó |
| **About** | Stúdió bemutatkozás |
| **Product grid** | Kiemelt modellek (házak) |
| **Features** | Eljárás / értékek |
| **Contact** | Kapcsolatfelvétel |

## Bolt (katalógus)

**Szerkesztés:** [/admin/cms/shop](/admin/cms/shop)

| Mező | Mit jelent? |
| --- | --- |
| **Eyebrow / főcím / alcím** | A katalógus fejléc szövegei |
| **Szűrők, oszlopok, oldalméret** | Rács elrendezés |
| **Üres állapot üzenet** | Ha nincs találat |
| **SEO** | Meta cím és leírás |

Nyilvános URL: `/shop`

## Termékoldal — két szinten szerkeszthető

### 1. Globális keret (minden modellre)

**Szerkesztés:** [/admin/cms/pdp](/admin/cms/pdp)

Alapértelmezések: galéria stílus, CTA szöveg, specifikáció sablon, FAQ blokk, „következő modell” kapcsoló.

### 2. Termék-specifikus vizuális oldal

**Szerkesztés:** [/admin/products](/admin/products) → termék → **Vizuális oldal**

Vagy: `/admin/products/[id]/visual-page`

| Mező csoport | Mit állíthatsz modellenként? |
| --- | --- |
| **Hero** | Eyebrow, tagline, áttekintő szöveg |
| **Specifikációk** | Terület, hálószobák, átfutási idő, ár |
| **Anyagok** | Anyaglista |
| **Részletkép** | Nagyító kép + felirat |
| **CTA sáv** | Cím, szöveg, link (alapértelmezett: `/contact`) |
| **Szerkesztői / FAQ** | Kiemelések, gyakori kérdések |

> A termék-specifikus mező **felülírja** a globális keretet. Ha üresen hagyod, a globális alapértelmezés érvényesül.

## Statikus oldalak

### Stúdió (About)

**Szerkesztés:** [/admin/cms/about](/admin/cms/about)

- Hero szekció
- Legfeljebb **12** kép+szöveg szekció (különböző elrendezési variánsokkal)

Nyilvános URL: `/about`

### Kapcsolat

**Szerkesztés:** [/admin/cms/contact](/admin/cms/contact)

- Hero, stúdió címsorok
- Űrlap címkék (név, e-mail, üzenet gomb)
- Nyitvatartás / elérhetőség szövegek
- SEO

Nyilvános URL: `/contact` — a kapcsolat űrlap üzenetei a [/admin/contact](/admin/contact) oldalra érkeznek.

## Tipikus munkafolyamat (új modell)

1. **Új termék:** [/admin/products/new](/admin/products/new)  
   - Név, slug (pl. `noir-01`), képek, alapár
2. **Vizuális oldal:** termék szerkesztő → **Vizuális oldal**  
   - Specifikációk, anyagok, FAQ kitöltése
3. **Globális keret** ellenőrzése: [/admin/cms/pdp](/admin/cms/pdp)
4. **Főoldal** product grid frissítése, ha kiemelni szeretnéd
5. **Közzététel** minden módosított oldalon
6. Ellenőrzés: `/products/[slug]`

## Demo modellek

Angol demo slugok: `noir-01`, `littoral`, `alba`, `prairie` — képek: `/template-assets/cabinova/`.
