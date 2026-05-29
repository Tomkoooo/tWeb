"use client"
/* eslint-disable react-hooks/set-state-in-effect -- admin panels fetch lists on mount */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

const API = "/api/plugins/camp-booking/admin"

type CampPricingSettings = {
  multiChildDiscountPercent: number
  multiChildMinCount: number
  siblingDiscountPercent: number
  siblingMatchByLastName: boolean
}

type AdminTicketType = {
  id: string
  name: string
  description: string
  priceHuf: number
  pricingMode: "per_child" | "flat"
  kind: "base" | "addon"
  earlyBirdEndsAt: string | null
  earlyBirdPriceHuf: number | null
  earlyBirdDiscountPercent: number | null
  isActive: boolean
  sortOrder: number
}

const defaultPricing: CampPricingSettings = {
  multiChildDiscountPercent: 0,
  multiChildMinCount: 2,
  siblingDiscountPercent: 0,
  siblingMatchByLastName: true,
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Hiba")
  return data as T
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs text-neutral-400 mb-1">{children}</span>
}

function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-black/40 border border-white/15 px-3 py-2 text-sm text-white ${props.className ?? ""}`}
    />
  )
}

function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-black/40 border border-white/15 px-3 py-2 text-sm text-white ${props.className ?? ""}`}
    />
  )
}

function CampPricingForm({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: CampPricingSettings
  onChange: (s: CampPricingSettings) => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="border border-amber-500/30 bg-amber-950/20 p-4 space-y-4">
      <h3 className="text-sm font-black uppercase text-amber-300">Kedvezmények & szabályok</h3>
      <p className="text-xs text-neutral-400">
        Többgyermekes kedvezmény: minimum gyerekszám után. Testvérkedvezmény: azonos vezetéknév
        (külön mező vagy a név első szava, pl. Kovács Bence) legalább két gyereknél. Ha mindkettő
        érvényes, a magasabb százalék kerül alkalmazásra.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <FieldLabel>Többgyermekes kedvezmény (%)</FieldLabel>
          <AdminInput
            type="number"
            min={0}
            max={100}
            value={settings.multiChildDiscountPercent}
            onChange={(e) =>
              onChange({ ...settings, multiChildDiscountPercent: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <FieldLabel>Minimum gyerekszám (többgyermekes)</FieldLabel>
          <AdminInput
            type="number"
            min={2}
            value={settings.multiChildMinCount}
            onChange={(e) =>
              onChange({ ...settings, multiChildMinCount: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <FieldLabel>Testvérkedvezmény (%)</FieldLabel>
          <AdminInput
            type="number"
            min={0}
            max={100}
            value={settings.siblingDiscountPercent}
            onChange={(e) =>
              onChange({ ...settings, siblingDiscountPercent: Number(e.target.value) })
            }
          />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            checked={settings.siblingMatchByLastName}
            onChange={(e) =>
              onChange({ ...settings, siblingMatchByLastName: e.target.checked })
            }
            className="mt-1"
          />
          <span className="text-sm text-neutral-300">Testvér párosítás vezetéknév alapján</span>
        </label>
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase disabled:opacity-50"
      >
        {saving ? "Mentés…" : "Kedvezmények mentése"}
      </button>
    </div>
  )
}

function TicketTypeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<AdminTicketType>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [priceHuf, setPriceHuf] = useState(initial?.priceHuf ?? 0)
  const [pricingMode, setPricingMode] = useState<"per_child" | "flat">(
    initial?.pricingMode ?? "per_child"
  )
  const [kind, setKind] = useState<"base" | "addon">(initial?.kind ?? "base")
  const [earlyBirdEndsAt, setEarlyBirdEndsAt] = useState(
    initial?.earlyBirdEndsAt ? initial.earlyBirdEndsAt.slice(0, 16) : ""
  )
  const [earlyBirdPriceHuf, setEarlyBirdPriceHuf] = useState(
    initial?.earlyBirdPriceHuf != null ? String(initial.earlyBirdPriceHuf) : ""
  )
  const [earlyBirdDiscountPercent, setEarlyBirdDiscountPercent] = useState(
    initial?.earlyBirdDiscountPercent != null ? String(initial.earlyBirdDiscountPercent) : ""
  )
  const [isActive, setIsActive] = useState(initial?.isActive !== false)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await onSubmit({
        name,
        description,
        priceHuf: Number(priceHuf),
        pricingMode,
        kind,
        isActive,
        earlyBirdEndsAt: earlyBirdEndsAt ? new Date(earlyBirdEndsAt).toISOString() : null,
        earlyBirdPriceHuf: earlyBirdPriceHuf !== "" ? Number(earlyBirdPriceHuf) : null,
        earlyBirdDiscountPercent:
          earlyBirdDiscountPercent !== "" ? Number(earlyBirdDiscountPercent) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-white/20 bg-black/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <FieldLabel>Név</FieldLabel>
          <AdminInput value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          <FieldLabel>Leírás (vásárlói felületen)</FieldLabel>
          <AdminInput value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          <FieldLabel>Listaár (Ft)</FieldLabel>
          <AdminInput
            type="number"
            min={0}
            value={priceHuf}
            onChange={(e) => setPriceHuf(Number(e.target.value))}
          />
        </label>
        <label>
          <FieldLabel>Árazás</FieldLabel>
          <AdminSelect
            value={pricingMode}
            onChange={(e) => setPricingMode(e.target.value as "per_child" | "flat")}
          >
            <option value="per_child">Gyerekenként</option>
            <option value="flat">Egyszeri (flat)</option>
          </AdminSelect>
        </label>
        <label>
          <FieldLabel>Típus</FieldLabel>
          <AdminSelect value={kind} onChange={(e) => setKind(e.target.value as "base" | "addon")}>
            <option value="base">Táborjegy (alap)</option>
            <option value="addon">Kiegészítő (pl. laptop bérlés)</option>
          </AdminSelect>
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm text-neutral-300">Aktív</span>
        </label>
      </div>
      {kind === "base" ? (
        <div className="border-t border-white/10 pt-3 space-y-3">
          <p className="text-xs font-bold uppercase text-sky-300">Early bird</p>
          <label>
            <FieldLabel>Early bird vége (dátum + idő)</FieldLabel>
            <AdminInput
              type="datetime-local"
              value={earlyBirdEndsAt}
              onChange={(e) => setEarlyBirdEndsAt(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <FieldLabel>Early bird fix ár (Ft) — opcionális</FieldLabel>
              <AdminInput
                type="number"
                min={0}
                placeholder="Üres = százalék"
                value={earlyBirdPriceHuf}
                onChange={(e) => setEarlyBirdPriceHuf(e.target.value)}
              />
            </label>
            <label>
              <FieldLabel>Early bird kedvezmény (%)</FieldLabel>
              <AdminInput
                type="number"
                min={0}
                max={100}
                placeholder="Ha nincs fix ár"
                value={earlyBirdDiscountPercent}
                onChange={(e) => setEarlyBirdDiscountPercent(e.target.value)}
              />
            </label>
          </div>
        </div>
      ) : null}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          disabled={saving || !name}
          onClick={() => void submit()}
          className="px-4 py-2 bg-green-700 text-white text-xs font-bold uppercase disabled:opacity-50"
        >
          {saving ? "Mentés…" : "Mentés"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase"
        >
          Mégse
        </button>
      </div>
    </div>
  )
}

export function CampBookingAdminScreen({ path }: { path: string[]; config: Record<string, unknown> }) {
  const segment = path[0] ?? ""

  if (segment === "camps") {
    return <CampsAdmin path={path.slice(1)} />
  }
  if (segment === "registrations") {
    return <p className="text-neutral-400 text-sm">Válassz turnust a Táborok menüben az exporthoz.</p>
  }

  return <Dashboard />
}

type DashboardStats = {
  revenueHuf: number
  registrationCount: number
  childCount: number
  publishedCamps: number
  publishedSessions: number
  upcomingSessions: number
  spotsLeft: number
  activeHolds: number
  recentRegistrations: Array<{
    buyerName: string
    sessionLabel: string
    campTitle: string
    totalHuf: number
    childCount: number
    paidAt: string
  }>
}

function CampKpiCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <div className="border border-white/10 bg-white/5 p-5 space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {subtitle ? <p className="text-xs text-neutral-400">{subtitle}</p> : null}
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<{ stats: DashboardStats }>("dashboard")
      .then((d) => setStats(d.stats))
      .catch((e) => setError(e instanceof Error ? e.message : "Hiba"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase text-white">Tábor foglalás</h1>
        <p className="text-neutral-400 text-sm mt-2 max-w-2xl">
          Camp-specifikus mutatók itt jelennek meg. A globális{" "}
          <span className="text-neutral-300">Statisztikák</span> oldal a webshop rendeléseit mutatja
          — <code className="text-amber-400/90">ENABLE_SHOP=false</code> mellett az elérhetetlen.
        </p>
      </div>

      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      {loading ? (
        <p className="text-neutral-500 text-sm">KPI-k betöltése…</p>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CampKpiCard
              title="Bevétel (fizetett)"
              value={`${Math.round(stats.revenueHuf).toLocaleString("hu-HU")} Ft`}
              subtitle={`${stats.registrationCount} foglalás`}
            />
            <CampKpiCard
              title="Gyerekek"
              value={String(stats.childCount)}
              subtitle="Összes fizetett hely"
            />
            <CampKpiCard
              title="Szabad helyek"
              value={String(stats.spotsLeft)}
              subtitle={`${stats.upcomingSessions} közelgő turnus`}
            />
            <CampKpiCard
              title="Aktív foglalások"
              value={String(stats.activeHolds)}
              subtitle="Fizetésre váró holdok"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampKpiCard
              title="Közzétett táborok"
              value={String(stats.publishedCamps)}
            />
            <CampKpiCard
              title="Közzétett turnusok"
              value={String(stats.publishedSessions)}
            />
          </div>

          <section className="border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h2 className="text-sm font-black uppercase text-white">Legutóbbi regisztrációk</h2>
            {stats.recentRegistrations.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">Még nincs fizetett regisztráció.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.recentRegistrations.map((r, i) => (
                  <li
                    key={`${r.paidAt}-${i}`}
                    className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2"
                  >
                    <div>
                      <p className="font-bold text-white">{r.buyerName}</p>
                      <p className="text-xs text-neutral-500">
                        {r.campTitle} · {r.sessionLabel} · {r.childCount} gyerek
                      </p>
                    </div>
                    <p className="font-black text-amber-400">
                      {r.totalHuf.toLocaleString("hu-HU")} Ft
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <Link
        href="/admin/plugins/camp-booking/camps"
        className="inline-block px-4 py-2 bg-green-700 text-white text-sm font-bold uppercase"
      >
        Táborok kezelése →
      </Link>
    </div>
  )
}

function CampsAdmin({ path }: { path: string[] }) {
  const [camps, setCamps] = useState<
    Array<{
      id: string
      title: string
      slug: string
      isPublished: boolean
      pricingSettings?: CampPricingSettings
    }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api<{ camps: typeof camps }>("camps")
      .then((d) => setCamps(d.camps))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const campId = path[0]
  if (campId && path[1] === "sessions") {
    return <SessionsAdmin campId={campId} />
  }

  const createCamp = async () => {
    const title = prompt("Tábor címe")
    const slug = prompt("Slug (pl. minecraft-nyar)")
    if (!title || !slug) return
    await api("camps", {
      method: "POST",
      body: JSON.stringify({ title, slug, isPublished: false, sortOrder: 0 }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase text-white">Táborok</h1>
        <button
          type="button"
          onClick={() => void createCamp()}
          className="px-4 py-2 bg-green-700 text-white text-xs font-bold uppercase"
        >
          + Új tábor
        </button>
      </div>
      {error ? <p className="text-red-400">{error}</p> : null}
      {loading ? (
        <p className="text-neutral-500">Betöltés…</p>
      ) : (
        <ul className="space-y-2">
          {camps.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between border border-white/10 p-4 bg-white/5"
            >
              <div>
                <p className="font-bold text-white">{c.title}</p>
                <p className="text-xs text-neutral-500">{c.slug}</p>
                {(c.pricingSettings?.multiChildDiscountPercent ?? 0) > 0 ||
                (c.pricingSettings?.siblingDiscountPercent ?? 0) > 0 ? (
                  <p className="text-xs text-amber-400 mt-1">
                    Kedvezmények: többgyermekes {c.pricingSettings?.multiChildDiscountPercent ?? 0}%
                    · testvér {c.pricingSettings?.siblingDiscountPercent ?? 0}%
                  </p>
                ) : null}
              </div>
              <Link
                href={`/admin/plugins/camp-booking/camps/${c.id}/sessions`}
                className="text-xs font-bold uppercase text-amber-400"
              >
                Turnusok & árazás →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SessionsAdmin({ campId }: { campId: string }) {
  const [sessions, setSessions] = useState<
    Array<{
      id: string
      label: string
      capacity: number
      soldCount: number
      reservedCount: number
      isPublished: boolean
    }>
  >([])
  const [pricing, setPricing] = useState<CampPricingSettings>(defaultPricing)
  const [pricingSaving, setPricingSaving] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const loadSessions = useCallback(() => {
    api<{ sessions: typeof sessions }>(`camps/${campId}/sessions`).then((d) =>
      setSessions(d.sessions)
    )
  }, [campId])

  const loadCamp = useCallback(() => {
    api<{ camp: { pricingSettings?: CampPricingSettings } }>(`camps/${campId}`).then((d) => {
      setPricing({ ...defaultPricing, ...d.camp.pricingSettings })
    })
  }, [campId])

  useEffect(() => {
    void loadSessions()
    void loadCamp()
  }, [loadSessions, loadCamp])

  const savePricing = async () => {
    setPricingSaving(true)
    try {
      await api(`camps/${campId}`, {
        method: "PUT",
        body: JSON.stringify({ pricingSettings: pricing }),
      })
    } finally {
      setPricingSaving(false)
    }
  }

  const createSession = async () => {
    const label = prompt("Turnus neve")
    const start = prompt("Kezdés (YYYY-MM-DD)")
    const end = prompt("Vég (YYYY-MM-DD)")
    const cap = prompt("Kapacitás (fő)")
    if (!label || !start || !end || !cap) return
    await api(`camps/${campId}/sessions`, {
      method: "POST",
      body: JSON.stringify({
        label,
        startDate: start,
        endDate: end,
        capacity: Number(cap),
        isPublished: false,
      }),
    })
    loadSessions()
  }

  if (selectedSession) {
    return (
      <SessionDetailAdmin
        sessionId={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/plugins/camp-booking/camps" className="text-xs text-neutral-400">
        ← Táborok
      </Link>
      <CampPricingForm
        settings={pricing}
        onChange={setPricing}
        onSave={() => void savePricing()}
        saving={pricingSaving}
      />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black uppercase text-white">Turnusok</h1>
        <button
          type="button"
          onClick={() => void createSession()}
          className="px-3 py-1 bg-green-700 text-white text-xs font-bold"
        >
          + Turnus
        </button>
      </div>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="border border-white/10 p-4 bg-white/5 flex justify-between items-center"
          >
            <div>
              <p className="text-white font-bold">{s.label}</p>
              <p className="text-xs text-neutral-500">
                {s.soldCount + s.reservedCount}/{s.capacity} foglalt
              </p>
            </div>
            <button
              type="button"
              className="text-xs text-amber-400 font-bold uppercase"
              onClick={() => setSelectedSession(s.id)}
            >
              Jegyek & export →
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SessionDetailAdmin({
  sessionId,
  onBack,
}: {
  sessionId: string
  onBack: () => void
}) {
  const [ticketTypes, setTicketTypes] = useState<AdminTicketType[]>([])
  const [editing, setEditing] = useState<AdminTicketType | "new" | null>(null)

  const load = useCallback(() => {
    api<{ ticketTypes: AdminTicketType[] }>(`sessions/${sessionId}/ticket-types`).then((d) =>
      setTicketTypes(d.ticketTypes)
    )
  }, [sessionId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-xs text-neutral-400">
        ← Turnusok
      </button>
      <h2 className="text-lg font-black text-white uppercase">Jegytípusok & kiegészítők</h2>
      <p className="text-xs text-neutral-400">
        Alap jegy: tábor részvétel (early bird itt állítható). Kiegészítő: pl. laptop bérlés —
        gyerekenként választható a foglalásnál.
      </p>
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="px-3 py-1 bg-green-700 text-white text-xs font-bold"
        >
          + Új jegytípus
        </button>
      ) : null}
      {editing === "new" ? (
        <TicketTypeForm
          onCancel={() => setEditing(null)}
          onSubmit={async (data) => {
            await api(`sessions/${sessionId}/ticket-types`, {
              method: "POST",
              body: JSON.stringify(data),
            })
            setEditing(null)
            load()
          }}
        />
      ) : editing ? (
        <TicketTypeForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={async (data) => {
            await api(`ticket-types/${editing.id}`, {
              method: "PUT",
              body: JSON.stringify(data),
            })
            setEditing(null)
            load()
          }}
        />
      ) : null}
      <ul className="space-y-2 text-sm">
        {ticketTypes.map((t) => (
          <li
            key={t.id}
            className="border border-white/10 p-3 bg-white/5 flex flex-wrap justify-between gap-2"
          >
            <div>
              <p className="text-white font-bold">
                {t.name}{" "}
                <span className="text-neutral-500 font-normal">
                  ({t.kind === "addon" ? "kiegészítő" : "alap"})
                </span>
              </p>
              <p className="text-neutral-400">
                {t.priceHuf.toLocaleString("hu-HU")} Ft · {t.pricingMode}
                {!t.isActive ? " · inaktív" : ""}
              </p>
              {t.kind === "base" && t.earlyBirdEndsAt ? (
                <p className="text-sky-400 text-xs mt-1">
                  Early bird: {new Date(t.earlyBirdEndsAt).toLocaleString("hu-HU")}
                  {t.earlyBirdPriceHuf != null
                    ? ` → ${t.earlyBirdPriceHuf.toLocaleString("hu-HU")} Ft`
                    : t.earlyBirdDiscountPercent != null
                      ? ` → −${t.earlyBirdDiscountPercent}%`
                      : ""}
                </p>
              ) : null}
              {t.description ? (
                <p className="text-xs text-neutral-500 mt-1">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-amber-400 font-bold uppercase self-start"
              onClick={() => setEditing(t)}
            >
              Szerkesztés
            </button>
          </li>
        ))}
      </ul>
      <a
        href={`/api/plugins/camp-booking/admin/sessions/${sessionId}/export`}
        className="inline-block px-4 py-2 bg-amber-600 text-white text-xs font-black uppercase"
      >
        Excel export (turnus)
      </a>
    </div>
  )
}
