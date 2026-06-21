## Mi ez a plugin?

A **Sajtóanyagok** plugin jelszóval védett sajtóportált biztosít: sajtós kontaktok, vizuális tartalomszerkesztő, PDF letöltés, megnyitás-statisztika.

**Belépés:** [/admin/plugins/press-kit](/admin/plugins/press-kit)

> Előfeltétel: webshop BE + [/admin/info](/admin/info) → **pluginPressKit** bekapcsolva.

## Nyilvános portál

A látogatók a telepítésben beállított URL-en érik el (pl. `/sajto`). A pontos előtag a **Beállítások → Plugin beállítások** alatt látható.

## Admin menüpontok

| Menüpont | Link | Funkció |
| --- | --- | --- |
| Áttekintés | [/admin/plugins/press-kit](/admin/plugins/press-kit) | Bevezető, gyors linkek |
| Kapcsolatok | [/admin/plugins/press-kit/contacts](/admin/plugins/press-kit/contacts) | Sajtós kontaktok, meghívók |
| Oldal szerkesztése | [/admin/plugins/press-kit/content](/admin/plugins/press-kit/content) | Portál vizuális szerkesztő |
| Megnyitások | [/admin/plugins/press-kit/stats](/admin/plugins/press-kit/stats) | Hozzáférési statisztika |

## 1. lépés — Sajtós kontaktok

1. [/admin/plugins/press-kit/contacts](/admin/plugins/press-kit/contacts)
2. **Új kontakt** — név, e-mail, szerkesztő/szerzői szerep
3. **Meghívó küldése** — a rendszer generál jelszót és e-mailt küld
4. A sajtós a portálon ezzel a fiókkal lép be

## 2. lépés — Portál tartalom

1. [/admin/plugins/press-kit/content](/admin/plugins/press-kit/content)
2. Blokk-alapú szerkesztő (hasonló a főoldal CMS-hez):
   - Szöveg, kép, gomb blokkok
   - Húzd át a blokkokat
3. **Mentés** → **Közzététel**

### PDF oldalsáv

A szerkesztő oldalsáván:

- PDF fájl feltöltése
- Vízjel beállítás
- Letöltési szabályok (ki töltheti le)

## 3. lépés — Hozzáférés beállítások

**Link:** [/admin/plugins/press-kit/content/settings](/admin/plugins/press-kit/content/settings)

| Beállítás | Mit jelent? |
| --- | --- |
| **Hozzáférés mód** | Meghívott kontaktok vagy megosztott jelszó |
| **Megosztott jelszó** | Egyszerű belépés sajtósoknak |
| **PDF megjelenítő** | Előnézet viselkedése |
| **Analitika** | Megnyitások követése (telepítésfüggő) |

## 4. lépés — Statisztikák

[/admin/plugins/press-kit/stats](/admin/plugins/press-kit/stats)

- Ki nyitotta meg a portált
- PDF letöltések
- Időszak szerinti bontás

## Tipikus munkafolyamat (új kampány)

1. Frissítsd a portál tartalmát: [/admin/plugins/press-kit/content](/admin/plugins/press-kit/content)
2. Tölts fel új PDF-eket
3. Hívd meg az új sajtós kontaktokat
4. **Közzététel**
5. Küldd el a portál linkjét és belépési adatokat

## Plugin beállítások (Beállítások oldal)

[/admin/info](/admin/info) → **Plugin beállítások** → Sajtóanyagok

| Mező | Mit jelent? |
| --- | --- |
| URL előtag | Pl. `sajto` → `/sajto` |
| Portál címe | Megjelenő oldalcím |
| Analitika | Megnyitás követés BE/KI |
