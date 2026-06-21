## Mi ez a plugin?

A **Tábor foglalás** plugin turnusok (session) értékesítését és regisztrációját kezeli Stripe fizetéssel. A Minecraft tábor telepítés fő admin funkciója.

**Belépés:** [/admin/plugins/camp-booking](/admin/plugins/camp-booking)

> Előfeltétel: [/admin/info](/admin/info) → **pluginCampBooking** és **stripePayments** bekapcsolva.

## Admin menüpontok

| Menüpont | Link | Funkció |
| --- | --- | --- |
| Áttekintés | [/admin/plugins/camp-booking](/admin/plugins/camp-booking) | Összesítő: foglalások, bevétel, kapacitás |
| Statisztikák | [/admin/plugins/camp-booking/stats](/admin/plugins/camp-booking/stats) | Részletes KPI-k (shop-off módban ez az „Áttekintés”) |
| Táborok | [/admin/plugins/camp-booking/camps](/admin/plugins/camp-booking/camps) | Tábor létrehozás, szerkesztés |
| Turnusok | tábor → sessions | Dátumok, kapacitás, árak |
| Regisztrációk | turnus részletei | Jelentkezők listája, export |

## 1. lépés — Tábor létrehozása

1. [/admin/plugins/camp-booking/camps](/admin/plugins/camp-booking/camps)
2. **Új tábor** gomb
3. Töltsd ki:
   - **Cím** — megjelenő név (pl. „Minecraft Nyári Tábor 2026”)
   - **Slug** — URL-barát azonosító
   - **Publikált** — csak publikált tábor látszik a honlapon
   - **Kedvezmények** — testvér/korai jelentkezés (opcionális)
4. Mentsd el

## 2. lépés — Turnus (session) létrehozása

1. Nyisd meg a tábort → **Turnusok**
2. **Új turnus**
3. Állítsd be:
   - **Kezdés / vége dátum**
   - **Kapacitás** — max. létszám
   - **Árak** — alapár, jegytípusok, pót díjak
4. Mentsd és publikáld

## 3. lépés — CMS szövegek

A foglalási folyamat szövegeit a CMS-ben szerkeszted:

| Oldal | Link |
| --- | --- |
| Jegyvásárlás | [/admin/cms/jegyvasarlas](/admin/cms/jegyvasarlas) |
| Foglalás | [/admin/cms/foglalas](/admin/cms/foglalas) |
| Siker | [/admin/cms/foglalas-siker](/admin/cms/foglalas-siker) |

## 4. lépés — Regisztrációk kezelése

1. Turnus → **Regisztrációk** fül
2. Látod: név, e-mail, fizetés státusz, jegytípus
3. **Excel export** — letöltés a teljes listához

## E-mailek

[/admin/emails](/admin/emails) → **camp_registration_confirmation** sablon

Stripe sikeres fizetés után megy ki a szülőnek.

## Stripe

- Webhook beállítás szükséges (fejlesztői dokumentáció)
- Teszt kulcsokkal próbáld ki először a [/admin/payment](/admin/payment) oldalon

## Gyakori feladatok

| Feladat | Hol? |
| --- | --- |
| Turnus betelt | Turnus szerkesztés → kapacitás növelése vagy új turnus |
| Ár módosítás | Turnus → árazás |
| Honlap szöveg | CMS tábor oldalak |
| Kapcsolat üzenet | [/admin/contact](/admin/contact) |
