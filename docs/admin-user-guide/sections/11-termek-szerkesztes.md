## Termék szerkesztő űrlap

**Belépés:** [/admin/products](/admin/products) → válassz terméket, vagy **Új termék**

### Alapadatok

| Mező | Mit jelent? | Tipp |
| --- | --- | --- |
| **Név** | A termék neve a boltban | Rövid, egyértelmű |
| **Slug (URL)** | Az URL része: `/products/[slug]` | Automatikus, de módosítható; ne változtasd gyakran |
| **Leírás** | Részletes szöveg (formázott) | Használj alcímeket, felsorolásokat |
| **Rövid leírás** | Kártyán megjelenő összefoglaló | 1–2 mondat |
| **Kategória** | Mely csoportba tartozik | Előbb hozd létre a [/admin/categories](/admin/categories) oldalon |

### Árazás

| Mező | Mit jelent? |
| --- | --- |
| **Ár** | Bruttó eladási ár |
| **Akciós ár** | Kedvezményes ár (opcionális) |
| **Korlátozott ár** | Időszakos akció (ha be van kapcsolva) |
| **Készlet** | Darabszám; 0 = elfogyott (sablonfüggő megjelenés) |

### Képek

1. Kattints a **Kép feltöltése** gombra
2. Válaszd ki a fájlt (JPG, PNG, WebP)
3. Az **első kép** a fő termékkép
4. További képek: húzd át a sorrendet, ha szükséges

### Variánsok (méret, szín stb.)

Ha a terméknek több változata van (pl. M/L/XL):

1. Kapcsold be a **Variánsok** opciót
2. Add meg a variáns típusokat (pl. „Méret”)
3. Minden variánshoz: ár, készlet, SKU (opcionális)

### SEO

| Mező | Mit jelent? |
| --- | --- |
| **Meta cím** | Google keresés címe ehhez a termékhez |
| **Meta leírás** | Rövid összefoglaló a keresőben |

Ha üresen hagyod, a rendszer a termék nevéből és leírásából generál alapértelmezett értékeket.

### Kiemelt termék

- **Kiemelt index** — alacsonyabb szám = előrébb a kiemelt listában
- A [/admin/shop/featured](/admin/shop/featured) oldalon is kezelhető

---

## Vizuális termékoldal (Cabinova sablon)

Ha a **Cabinova** sablon aktív, minden termékhez külön **vizuális termékoldal** szerkeszthető.

**Belépés:**

1. [/admin/products](/admin/products) → válaszd a terméket
2. Kattints a **Vizuális oldal** / **Visual page** linkre  
   — vagy közvetlenül: `/admin/products/[id]/visual-page`

**Mit szerkesztesz itt?**

- A termék egyedi PDP tartalma (galéria stílus, specifikációk, anyagok, FAQ)
- A [/admin/cms/pdp](/admin/cms/pdp) **globális keret** beállításai **összeolvadnak** a termék-specifikus tartalommal
- Termék-specifikus mező felülírja a globális alapértelmezést

**Munkafolyamat Cabinova-nál:**

1. Hozd létre a terméket alapadatokkal és képekkel
2. Nyisd meg a **Vizuális oldalt**
3. Szerkeszd a modell-specifikus szövegeket és specifikációkat
4. **Mentés** → **Közzététel**
5. Ellenőrizd: `/products/[slug]` a nyilvános oldalon

---

## Tipikus hibák

| Probléma | Megoldás |
| --- | --- |
| Termék nem jelenik meg a boltban | Ellenőrizd: van-e kategória, készlet > 0, publikált-e |
| Kép nem töltődik be | Túl nagy fájl? Próbálj kisebb JPG/PNG-t |
| Ár rossz a pénztárban | Variáns árak külön állíthatók — ellenőrizd mindet |
| Vizuális oldal nem látszik | Cabinova sablon + közzététel szükséges |
