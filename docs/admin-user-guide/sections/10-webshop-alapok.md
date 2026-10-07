## Webshop alapok

Ez a fejezet akkor releváns, ha a telepítésedben a **webshop be van kapcsolva** (`ENABLE_SHOP=true`). Ilyenkor a bal oldalsávban megjelennek a termék- és rendelés menüpontok.

## Termékek

**Belépés:** [/admin/products](/admin/products)

| Mit csinálsz itt? | Rövid leírás |
| --- | --- |
| Új termék | Név, ár, képek, leírás, kategória hozzárendelés |
| Szerkesztés | Meglévő termék módosítása |
| Törlés | Termék eltávolítása a boltból |
| Kiemelés | Termék megjelenése a főoldali rácsban (CMS blokktól is függ) |

**Első lépések új termékhez:**

1. [/admin/products](/admin/products) → **Új termék**
2. Add meg a nevet, árat és legalább egy képet
3. Válassz kategóriát
4. Mentsd el
5. Ha a sablon támogatja, szerkeszd a **vizuális termékoldalt** is (lásd: Termék szerkesztése fejezet)

## Kategóriák

**Belépés:** [/admin/categories](/admin/categories)

- Kategóriák létrehozása (pl. „Ruházat”, „Kiegészítők”)
- Termékek csoportosítása a bolt szűrőihez
- Kategória leírás és kép (sablonfüggő megjelenés)

## Rendelések

**Belépés:** [/admin/orders](/admin/orders)

| Mit látsz? | Mit tehetsz? |
| --- | --- |
| Rendeléslista | Státusz, összeg, vásárló |
| Rendelés részletei | Tételek, szállítási cím, fizetés |
| Státusz módosítás | Feldolgozás, szállítás, lezárás |

## Statisztikák

**Belépés:** [/admin/stats](/admin/stats)

- Bevétel, rendelésszám időszakonként
- Népszerű termékek
- Export lehetőségek (telepítésfüggő)

## Vélemények

**Belépés:** [/admin/reviews](/admin/reviews)

- Vásárlói értékelések jóváhagyása vagy elrejtése
- Csillag értékelés és szöveges vélemény moderálása

## Fizetés

**Belépés:** [/admin/payment](/admin/payment)

- **Stripe** kapcsolat beállítása
- Fizetési módok engedélyezése
- Teszt / éles mód (Stripe kulcsok alapján)

> A **stripePayments** funkciókapcsolót a [/admin/info](/admin/info) oldalon kell bekapcsolni.

## Szállítás

**Belépés:** [/admin/shipping](/admin/shipping)

- Szállítási módok (házhozszállítás, csomagpont)
- GLS / Foxpost csomagpont választó (ha engedélyezve)
- Szállítási díjak beállítása

## Kuponok

**Belépés:** [/admin/coupons](/admin/coupons)

- Kedvezménykód létrehozása (százalék, fix összeg, ingyenes szállítás vagy termékár)
- Érvényességi idő, felhasználási limit
- Aktiválás / deaktiválás

### Termékáras kupon (kombinált akciók)

A **Termékár** típusnál szabályonként adod meg, mennyibe kerüljön egy termék a kupon
mellett: `%` kedvezmény, fix nettó vagy fix bruttó ár (a `0` bruttó ár = ingyenes termék).

Minden szabályhoz **feltétel termékeket** is megadhatsz: a szabály csak akkor él, ha a
megadott termék(ek) is ugyanabban a kosárban vannak (megadható minimum darabszám is).

Példa – „A termék 20 000 Ft, és akkor a B termék ingyenes":

| Szabály | Termék | Mód | Érték | Feltétel |
| --- | --- | --- | --- | --- |
| 1 | A termék | Fix bruttó | 20000 | – |
| 2 | B termék | Fix bruttó | 0 | A termék (min. 1 db) |

Ha a kosárban csak a B termék van, a 2. szabály nem él, és a kupon elutasításra kerül
(„A kupon feltételei nem teljesülnek…"). Ugyanez használható „vedd meg 3 db-ot, 50%
kedvezmény" akcióra is: a szabály feltétele saját maga, min. 3 db darabszámmal.

## Emailek

**Belépés:** [/admin/emails](/admin/emails)

Automatikus e-mailek sablonjai:

| Sablon | Mikor megy ki? |
| --- | --- |
| Rendelés visszaigazolás | Sikeres webshop fizetés után |
| Kapcsolat értesítés | Kapcsolat űrlap kitöltésekor |
| Tábor visszaigazolás | Tábor plugin fizetés után (ha van) |

**Első telepítés után:** [/admin/emails](/admin/emails) → inicializáld a hiányzó sablonokat.

## Webshop finombeállítások

| Oldal | Link | Cél |
| --- | --- | --- |
| Termék javaslatok | [/admin/shop/product-suggestions](/admin/shop/product-suggestions) | Kosárban ajánlott termékek |
| Ország / kereskedés | [/admin/shop/trading](/admin/shop/trading) | Országok, adó, pénznem |
| Kiemelt termékek | [/admin/shop/featured](/admin/shop/featured) | Manuális kiemelés a boltban |

## Hírlevelek

**Belépés:** [/admin/newsletters](/admin/newsletters) — csak ha a **newsletter** funkció be van kapcsolva a [/admin/info](/admin/info) oldalon.

- Feliratkozók listája
- Kampány küldése (telepítésfüggő)
