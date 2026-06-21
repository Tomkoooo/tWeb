## Mire való ez a sablon?

A **Minecraft Camp** landing sablon tábor foglaláshoz. A főoldal blokkok a tábor programját, árait és FAQ-ját mutatják; a foglalás a **Tábor foglalás** pluginon keresztül történik.

**Telepítés:** `DEPLOYMENT_KEY=minecraft-camp` — webshop általában **ki van kapcsolva**.

## Főoldal blokkok

**Szerkesztés:** [/admin/cms/home](/admin/cms/home)

Elérhető blokk típusok: **Hero**, **About**, **Gallery**, **Contact**, **Rich text**

A sablon ezeket **egyedi szekciókká** mapeli a látogatói oldalon:

| Blokk típus | Tipikus tartalom a honlapon |
| --- | --- |
| Hero | Tábor főcím, dátum, CTA |
| About | Történet / bemutatkozás |
| Gallery | Képek a táborról |
| Rich text | Programok, szabályok, szabad szöveg |
| Contact | Kapcsolat űrlap (#contact szekció) |

> A blokkok **sorrendje** a főoldalon a blokk-szerkesztő sorrendjét követi.

## Tábor CMS oldalak (plugin szükséges)

Ha a **Tábor foglalás** plugin be van kapcsolva, ezek az oldalak is szerkeszthetők:

### Jegyvásárlás

**Szerkesztés:** [/admin/cms/jegyvasarlas](/admin/cms/jegyvasarlas)

| Mező | Mit jelent? |
| --- | --- |
| **Oldalcím** | A jegyvásárlás oldal főcíme |
| **Bevezető** | Rövid magyarázó szöveg a táborlistá felett |
| **SEO** | Meta adatok |

Nyilvános URL: `/jegyvasarlas`

### Foglalás / regisztráció

**Szerkesztés:** [/admin/cms/foglalas](/admin/cms/foglalas)

| Mező | Mit jelent? |
| --- | --- |
| **Lépés címkék** | Varázsló lépéseinek feliratai |
| **Fejléc szövegek** | Címek a foglalási folyamatban |
| **Helyszín cím** | Megjelenő cím a turnusnál |
| **Stripe CTA szöveg** | Fizetés gomb felirata |
| **SEO** | Meta adatok |

### Foglalás siker

**Szerkesztés:** [/admin/cms/foglalas-siker](/admin/cms/foglalas-siker)

| Mező | Mit jelent? |
| --- | --- |
| **Siker üzenet** | Mit lát a szülő fizetés után |
| **Hiba / betöltés szövegek** | Hibaállapotok üzenetei |
| **SEO** | Meta adatok |

## Beállítások indulás előtt

1. [/admin/info](/admin/info) → **pluginCampBooking** + **stripePayments** BE
2. [/admin/plugins/camp-booking](/admin/plugins/camp-booking) → tábor és turnus létrehozás
3. [/admin/emails](/admin/emails) → tábor visszaigazoló sablon
4. [/admin/cms/settings?section=contact](/admin/cms/settings?section=contact) → kapcsolat címzettek

## Kapcsolat űrlap

A főoldal **Contact** blokkjának üzenetei a [/admin/contact](/admin/contact) adminba érkeznek — ugyanúgy, mint más sablonoknál.

## További olvasnivaló

- **Tábor mód — admin navigáció** fejezet (shop-off viselkedés)
- **Tábor foglalás plugin** fejezet (turnusok, regisztrációk, export)
