## Mire való ez a sablon?

Az **Atelier Showcase** prémium bemutató webshop: gazdag főoldal blokkok, szerkeszthető **Editorial** és **Journal** oldalak, egyedi kosár/pénztár/fiók kinézet.

**Sablon aktiválás:** [/admin/templates](/admin/templates) → Atelier Showcase

## Főoldal blokkok

**Szerkesztés:** [/admin/cms/home](/admin/cms/home)

Elérhető blokk típusok (a Default Modernnél több):

| Blokk | Funkció |
| --- | --- |
| Hero, About, Gallery, Features, Contact | Ugyanaz, mint Default Modern |
| **Divider** | Vizuális elválasztó sáv |
| **Rich text** | Szabad formázású szövegblokk |
| **Product grid** | Termékrács |
| **Testimonials** | Vásárlói idézetek |
| **CTA** | Call-to-action sáv gombbal |

## Bolt és termékoldal

Ugyanazok a mezők, mint a Default Modern sablonnál:

- **Bolt:** [/admin/cms/shop](/admin/cms/shop)
- **Termékoldal keret:** [/admin/cms/pdp](/admin/cms/pdp)

## Statikus oldalak

### Editorial

**Szerkesztés:** [/admin/cms/editorial](/admin/cms/editorial)

| Mező | Mit jelent? |
| --- | --- |
| **Hero** | Fejléc kép, cím, alcím |
| **Szekciók** | Kép bal/jobb/teljes szélesség + szöveg párok |
| **SEO** | Meta cím és leírás |

A látogatók az `/editorial` útvonalon látják.

### Journal

**Szerkesztés:** [/admin/cms/journal](/admin/cms/journal)

| Mező | Mit jelent? |
| --- | --- |
| **Bevezető** | Az oldal tetején megjelenő intro szöveg |
| **Bejegyzések** (max 24) | Cím, témakör, kivonat, HTML törzs, borítókép |
| **SEO** | Meta adatok |

A látogatók a `/journal` útvonalon böngészik a bejegyzéseket.

## Kosár, pénztár, fiók — fontos!

Az Atelier Showcase-nél a **kosár, pénztár és fiók oldalak NEM szerkeszthetők a CMS-ben**. Ezek egyedi, teljes képernyős elrendezést használnak — a kinézet fix, csak a funkció működik.

Ha szöveget szeretnél módosítani ezeken az oldalakon, az fejlesztői beavatkozást igényel.

## Tipikus munkafolyamat

1. Főoldal blokkok + **Testimonials** + **CTA**
2. **Journal** bejegyzések feltöltése kampányokhoz
3. **Editorial** oldal a márka történetéhez
4. Termékek és kategóriák a boltban
5. Közzététel minden módosított CMS oldalon
