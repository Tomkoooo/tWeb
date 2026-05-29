"use client"
/* eslint-disable react-hooks/set-state-in-effect -- admin panels fetch lists on mount */

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

const API = "/api/plugins/camp-booking/admin"

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Hiba")
  return data as T
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

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase text-white">Tábor foglalás</h1>
      <p className="text-neutral-400 text-sm">
        Minecraft tábor turnusok, jegytípusok és regisztrációk kezelése.
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin/plugins/camp-booking/camps"
          className="px-4 py-2 bg-white/10 text-white text-sm font-bold uppercase"
        >
          Táborok kezelése
        </Link>
      </div>
    </div>
  )
}

function CampsAdmin({ path }: { path: string[] }) {
  const [camps, setCamps] = useState<
    Array<{ id: string; title: string; slug: string; isPublished: boolean }>
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
              </div>
              <Link
                href={`/admin/plugins/camp-booking/camps/${c.id}/sessions`}
                className="text-xs font-bold uppercase text-amber-400"
              >
                Turnusok →
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
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const load = useCallback(() => {
    api<{ sessions: typeof sessions }>(`camps/${campId}/sessions`).then((d) =>
      setSessions(d.sessions)
    )
  }, [campId])

  useEffect(() => {
    void load()
  }, [load])

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
    load()
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
  const [ticketTypes, setTicketTypes] = useState<
    Array<{ id: string; name: string; priceHuf: number; pricingMode: string }>
  >([])

  const load = useCallback(() => {
    api<{ ticketTypes: typeof ticketTypes }>(`sessions/${sessionId}/ticket-types`).then(
      (d) => setTicketTypes(d.ticketTypes)
    )
  }, [sessionId])

  useEffect(() => {
    void load()
  }, [load])

  const addType = async () => {
    const name = prompt("Jegytípus neve")
    const price = prompt("Ár (Ft)")
    const mode = prompt("Árazás: per_child vagy flat", "per_child")
    if (!name || !price) return
    await api(`sessions/${sessionId}/ticket-types`, {
      method: "POST",
      body: JSON.stringify({
        name,
        priceHuf: Number(price),
        pricingMode: mode === "flat" ? "flat" : "per_child",
        isActive: true,
      }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-xs text-neutral-400">
        ← Turnusok
      </button>
      <h2 className="text-lg font-black text-white uppercase">Jegytípusok</h2>
      <button
        type="button"
        onClick={() => void addType()}
        className="px-3 py-1 bg-white/10 text-xs font-bold text-white"
      >
        + Jegytípus
      </button>
      <ul className="space-y-2 text-sm text-neutral-300">
        {ticketTypes.map((t) => (
          <li key={t.id} className="border border-white/10 p-3">
            {t.name} — {t.priceHuf.toLocaleString("hu-HU")} Ft ({t.pricingMode})
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
