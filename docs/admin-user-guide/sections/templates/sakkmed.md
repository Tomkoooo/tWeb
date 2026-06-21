## Mire való ez a sablon?

A **SAKKMED** sablon rendezvénytechnikai cég bemutató oldalához készült: főoldal szekciók + **10 külön szolgáltatás/projekt aloldal**.

**Telepítés:** `DEPLOYMENT_KEY=sakkmed` — nincs plugin, webshop opcionális.

## Főoldal blokkok

**Szerkesztés:** [/admin/cms/home](/admin/cms/home)

| Blokk | Funkció |
| --- | --- |
| Hero | Főcím, tagline, hero kép |
| About | Cég bemutatkozás |
| Features | Szolgáltatások kiemelése |
| Gallery | Referencia képek |
| Contact | Kapcsolat űrlap |
| Rich text | Szabad szöveges blokk |

## Szolgáltatás oldalak (9 db)

Mindegyik ugyanazzal a szerkesztővel működik — külön CMS bejegyzés oldalanként:

| Oldal neve | Admin CMS link | Nyilvános URL |
| --- | --- | --- |
| Bútoraink | [/admin/cms/butoraink](/admin/cms/butoraink) | `/butoraink` |
| Installációk | [/admin/cms/installaciok](/admin/cms/installaciok) | `/installaciok` |
| Traverz | [/admin/cms/traverz](/admin/cms/traverz) | `/traverz` |
| Layher | [/admin/cms/layher](/admin/cms/layher) | `/layher` |
| Emeléstechnika | [/admin/cms/emelestechnika](/admin/cms/emelestechnika) | `/emelestechnika` |
| Alutent | [/admin/cms/alutent](/admin/cms/alutent) | `/alutent` |
| Áramhálózat | [/admin/cms/aramhalozat](/admin/cms/aramhalozat) | `/aramhalozat` |
| Vízmű | [/admin/cms/vizmu](/admin/cms/vizmu) | `/vizmu` |
| Syma | [/admin/cms/syma](/admin/cms/syma) | `/syma` |

## Projekt oldalak (2 db)

| Oldal neve | Admin CMS link | Nyilvános URL |
| --- | --- | --- |
| Fesztivál VIP | [/admin/cms/fesztival-vip](/admin/cms/fesztival-vip) | `/fesztival-vip` |
| Sigma konténer | [/admin/cms/sigma-kontener](/admin/cms/sigma-kontener) | `/sigma-kontener` |

## Mit szerkeszthetsz egy statikus oldalon?

Minden fenti oldalon ugyanaz a mezőkészlet:

| Mező | Mit jelent? |
| --- | --- |
| **Hero** | Fejléc kép, cím, alcím |
| **Szekciók** | Kép + szöveg párok (több blokk) |
| **Galéria** | További referencia képek |
| **Kapcsolat e-mail / gomb felirat** | Oldal alján megjelenő elérhetőség |
| **SEO** | Meta cím és leírás |

## Tipikus munkafolyamat (új szolgáltatás oldal)

1. Nyisd meg a megfelelő CMS oldalt (pl. [/admin/cms/layher](/admin/cms/layher))
2. Töltsd ki a hero-t és a szekciókat
3. Adj hozzá galéria képeket
4. Állítsd be az SEO mezőket
5. **Mentés** → **Közzététel**
6. Ellenőrizd a nyilvános URL-en

## Webshop (ha be van kapcsolva)

Ha `ENABLE_SHOP=true`, a bolt és termék CMS oldalak is megjelennek — de a SAKKMED telepítés tipikusan **landing-only**, webshop nélkül.

## Kapcsolat

A **Contact** blokk és statikus oldalak kapcsolat mezői a [/admin/cms/settings?section=contact](/admin/cms/settings?section=contact) beállításokhoz kapcsolódnak; üzenetek: [/admin/contact](/admin/contact).
