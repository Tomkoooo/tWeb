## Tábor mód — mi ez?

A **Minecraft tábor** telepítésnél a webshop gyakran **ki van kapcsolva** (`ENABLE_SHOP=false`). Ilyenkor nincs termék- és rendelés admin — helyette a **Tábor foglalás** plugin adja a fő admin élményt.

## Hogyan változik az admin?

| Webshop módban | Tábor módban |
| --- | --- |
| **Áttekintés** → dashboard | **Áttekintés** → átirányít a tábor statisztikákra |
| **Statisztikák** → eladások | **Statisztikák** → tábor KPI-k |
| Termék kezelés menü | **Nincs** |
| Plugin: Tábor foglalás | **Fő menüpontok** |

## Első lépések tábor módban

1. **Beállítások** → [/admin/info](/admin/info)  
   - Kapcsold be: **pluginCampBooking** (Tábor foglalás)  
   - Kapcsold be: **stripePayments** (Stripe fizetés)

2. **Tábor plugin** → [/admin/plugins/camp-booking](/admin/plugins/camp-booking)  
   - Hozd létre a tábort és turnusokat (részletek a plugin fejezetben)

3. **CMS** → [/admin/cms](/admin/cms)  
   - Főoldal tartalom  
   - Jegyvásárlás, foglalás, siker oldal szövegei

4. **Kapcsolat** → [/admin/contact](/admin/contact)  
   - A főoldal kapcsolat űrlap üzenetei

## Mit NEM találsz tábor módban?

- `/admin/products`, `/admin/orders`, `/admin/categories` — ezek **nem érhetők el**
- Bolt útvonalak (`/shop`, `/cart`) — **404** a látogatóknak (camp-only mód)

## Nyilvános oldalak (látogatóknak)

| URL | Funkció |
| --- | --- |
| `/` | Tábor főoldal |
| `/jegyvasarlas` | Jegyvásárlás / táborlista |
| `/foglalas/[sessionId]` | Foglalási varázsló |
| `/foglalas-siker` | Sikeres fizetés után |

## E-mailek

[/admin/emails](/admin/emails) → inicializáld a **camp_registration_confirmation** sablont a tábor visszaigazoló e-mailekhez.

## További olvasnivaló

A **Minecraft Camp sablon** és **Tábor foglalás plugin** fejezetekben lépésről lépésre leírjuk a tartalom- és foglaláskezelést.
