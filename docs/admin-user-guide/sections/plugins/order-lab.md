## Mi ez a plugin?

Az **Order Lab** fejlesztői / teszt eszköz **Foxpost** sandbox rendelésekhez. Éles rendeléseket **nem** kezel — külön gyűjteményben tárolja a próba rendeléseket.

**Belépés:** [/admin/plugins/order-lab](/admin/plugins/order-lab)

> Előfeltétel: webshop BE + [/admin/info](/admin/info) → **pluginOrderLab** bekapcsolva.

## Admin menüpontok

| Menüpont | Link | Funkció |
| --- | --- | --- |
| Áttekintés | [/admin/plugins/order-lab](/admin/plugins/order-lab) | Kapcsolat státusz, sandbox összesítő |
| Rendelések | [/admin/plugins/order-lab/orders](/admin/plugins/order-lab/orders) | Sandbox rendeléslista |
| Beállítások | [/admin/plugins/order-lab/settings](/admin/plugins/order-lab/settings) | Foxpost API, teszt paraméterek |

## Áttekintés oldal

[/admin/plugins/order-lab](/admin/plugins/order-lab)

- Foxpost sandbox **kapcsolat státusz** (működik-e az API)
- Sandbox rendelések száma
- Gyors teszt gomb

## Rendelések kezelése

[/admin/plugins/order-lab/orders](/admin/plugins/order-lab/orders)

| Művelet | Mit csinál? |
| --- | --- |
| **Lista** | Összes sandbox rendelés |
| **Részletek** | Egy rendelés tételei, cím, csomagpont |
| **Teszt rendelések generálása** | Automatikus minta rendelések (beállításokban megadott szám) |
| **Összes törlése** | Sandbox gyűjtemény ürítése |
| **Excel export** | Rendelések letöltése táblázatként |
| **Címke ZIP** | Foxpost címkék tömeges letöltése |

### Egy rendelés megnyitása

[/admin/plugins/order-lab/orders/[orderId]](/admin/plugins/order-lab/orders)

- Rendelés azonosító, státusz
- Szállítási adatok, csomagpont
- Tételek listája

## Beállítások

[/admin/plugins/order-lab/settings](/admin/plugins/order-lab/settings)

| Mező | Mit jelent? |
| --- | --- |
| **Foxpost sandbox API kulcs** | Teszt környezet hitelesítés |
| **Csomag méret** | Alapértelmezett méret címke generáláshoz |
| **Címke formátum** | PDF / ZPL stb. |
| **Alapértelmezett APM** | Automata csomagpont azonosító |
| **Generálandó teszt rendelések száma** | Seed gomb hány rendelést hozzon létre |

## Tipikus munkafolyamat (Foxpost teszt)

1. Állítsd be az API kulcsot: [/admin/plugins/order-lab/settings](/admin/plugins/order-lab/settings)
2. Generálj teszt rendeléseket
3. Exportáld a címkéket ZIP-ként
4. Ellenőrizd a Foxpost sandbox felületén
5. Teszt után töröld a sandbox rendeléseket

## Fontos

- Az Order Lab **nem** helyettesíti a valódi [/admin/orders](/admin/orders) rendeléskezelést
- Csak fejlesztés és integráció tesztelésre szolgál
- Éles Foxpost kulcsokat ne használj sandbox teszthez
