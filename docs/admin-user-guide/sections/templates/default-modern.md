## Mire való ez a sablon?

A **Default Modern** a webshop motor alapértelmezett, sötét témájú bolt kinézete. Ideális általános e-kereskedelemhez: főoldal blokkok, terméklista, termékoldal, kosár/pénztár/fiók szövegek.

**Sablon aktiválás:** [/admin/templates](/admin/templates) → Default Modern

## Főoldal blokkok

**Szerkesztés:** [/admin/cms/home](/admin/cms/home)

Elérhető blokk típusok:

| Blokk | Mit jelenít meg a látogatónak? |
| --- | --- |
| **Hero** | Nagy fejléc kép + főcím + gomb |
| **About** | Bemutatkozó szöveg és kép |
| **Gallery** | Képgaléria |
| **Features** | Előnyök / jellemzők ikonokkal |
| **Product grid** | Kiemelt termékek rácsa a boltból |
| **Contact** | Kapcsolatfelvételi űrlap |

**Lépések:** blokk hozzáadása → tartalom szerkesztése → mentés → közzététel.

## Bolt oldal

**Szerkesztés:** [/admin/cms/shop](/admin/cms/shop)

| Mező | Mit jelent? |
| --- | --- |
| **Főcím / alcím** | A bolt tetején megjelenő szövegek |
| **Szűrők pozíciója** | Oldalsáv vagy felső sáv |
| **Oszlopok száma** | 2, 3 vagy 4 termék oszlop |
| **Oldalankénti termékszám** | Hány termék egy oldalon |
| **Üres lista üzenet** | Ha nincs találat a szűrésre |
| **SEO cím / leírás** | Keresőoptimalizálás |

## Termékoldal keret (PDP)

**Szerkesztés:** [/admin/cms/pdp](/admin/cms/pdp)

Ez a **minden termékre közös** keret — nem a termék egyedi adatai (azok a [/admin/products](/admin/products) oldalon vannak).

| Mező | Mit jelent? |
| --- | --- |
| **Kapcsolódó termékek** | Ajánlott termékek megjelenítése |
| **Nemrég megtekintett** | Előzmény sáv |
| **Kosárba gomb szövege** | CTA felirat |
| **Elfogyott szöveg** | Ha nincs készlet |
| **Galéria stílus** | Bélyegképek vagy carousel |
| **Szerkesztői szekció** | FAQ, kiemelések, támogató szöveg a termék alatt |

## Vásárlási folyamat szövegei

Ha a webshop be van kapcsolva, ezek is szerkeszthetők:

| Oldal | Admin link | Mit szerkesztesz? |
| --- | --- | --- |
| Kosár | [/admin/cms/cart](/admin/cms/cart) | Felső sáv cím és alcím |
| Pénztár | [/admin/cms/checkout](/admin/cms/checkout) | Felső sáv cím és alcím |
| Fiókom | [/admin/cms/profile](/admin/cms/profile) | Felső sáv cím és alcím |

> Csak a **fejléc sáv szövegei** szerkeszthetők — a kosár/pénztár funkció fix elrendezésű.

## Tipikus munkafolyamat

1. **Termékek** feltöltése: [/admin/products](/admin/products)
2. **Főoldal** összeállítása blokkokkal: [/admin/cms/home](/admin/cms/home)
3. **Bolt** szövegek finomhangolása: [/admin/cms/shop](/admin/cms/shop)
4. **Téma / márka**: [/admin/cms/settings?section=theme](/admin/cms/settings?section=theme)
5. Minden oldalon **közzététel**
