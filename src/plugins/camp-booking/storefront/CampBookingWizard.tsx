"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type TicketType = {
  id: string
  name: string
  priceHuf: number
  pricingMode: "per_child" | "flat"
}

type SessionDetail = {
  camp: { id: string; title: string; slug: string }
  session: {
    id: string
    label: string
    sessionLabel: string
    spotsLeft: number
    capacity: number
  }
  ticketTypes: TicketType[]
}

type ChildForm = {
  name: string
  birthDate: string
  dietaryRequest: string
  allergies: string
}

function calcTotal(tt: TicketType | undefined, childCount: number) {
  if (!tt) return 0
  if (tt.pricingMode === "flat") return tt.priceHuf
  return tt.priceHuf * Math.max(1, childCount)
}

export function CampBookingWizard({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams()
  const cancelled = searchParams.get("cancelled")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [step, setStep] = useState(0)
  const [ticketTypeId, setTicketTypeId] = useState("")
  const [childCount, setChildCount] = useState(1)
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [children, setChildren] = useState<ChildForm[]>([
    { name: "", birthDate: "", dietaryRequest: "", allergies: "" },
  ])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/plugins/camp-booking/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Betöltési hiba")
        setDetail(data)
        if (data.ticketTypes?.[0]) setTicketTypeId(data.ticketTypes[0].id)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => {
    setChildren((prev) => {
      const next: ChildForm[] = []
      for (let i = 0; i < childCount; i++) {
        next.push(
          prev[i] ?? { name: "", birthDate: "", dietaryRequest: "", allergies: "" }
        )
      }
      return next
    })
  }, [childCount])

  const selectedTicket = detail?.ticketTypes.find((t) => t.id === ticketTypeId)
  const total = calcTotal(selectedTicket, childCount)

  const submit = useCallback(async () => {
    if (!detail || !selectedTicket) return
    setSubmitting(true)
    setError(null)
    try {
      const holdRes = await fetch("/api/plugins/camp-booking/checkout/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ticketTypeId,
          childCount,
          buyerName,
          buyerEmail,
          buyerPhone,
          children,
        }),
      })
      const holdData = await holdRes.json()
      if (!holdRes.ok || !holdData.ok) {
        throw new Error(holdData.error || "Foglalás sikertelen")
      }

      const stripeRes = await fetch("/api/plugins/camp-booking/checkout/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdId: holdData.holdId }),
      })
      const stripeData = await stripeRes.json()
      if (!stripeRes.ok || !stripeData.ok || !stripeData.url) {
        throw new Error(stripeData.error || "Stripe indítás sikertelen")
      }
      window.location.href = stripeData.url
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba")
      setSubmitting(false)
    }
  }, [
    detail,
    selectedTicket,
    sessionId,
    ticketTypeId,
    childCount,
    buyerName,
    buyerEmail,
    buyerPhone,
    children,
  ])

  if (loading) {
    return <p className="font-minecraft-body text-center py-12">Betöltés…</p>
  }
  if (error && !detail) {
    return (
      <div className="minecraft-panel p-8 text-center">
        <p className="text-red-700 font-minecraft-body">{error}</p>
        <Link href="/" className="minecraft-btn inline-block mt-6">
          Vissza
        </Link>
      </div>
    )
  }
  if (!detail) return null

  const maxKids = Math.min(20, Math.max(1, detail.session.spotsLeft))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="minecraft-panel p-6">
        <p className="font-minecraft text-xs text-[#1a3d5c]">{detail.camp.title}</p>
        <h1 className="font-minecraft text-lg text-[#2d5016] mt-1">{detail.session.sessionLabel}</h1>
        <p className="font-minecraft-body text-sm mt-2">
          Szabad hely: <strong>{detail.session.spotsLeft}</strong>
        </p>
        {cancelled ? (
          <p className="mt-4 text-amber-800 font-minecraft-body text-sm">
            A fizetés megszakadt. Adatait megőriztük — folytathatja lent.
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-red-700 font-minecraft-body text-sm bg-red-100 border-2 border-red-400 p-3">
          {error}
        </p>
      ) : null}

      {step === 0 && (
        <div className="minecraft-panel p-6 space-y-4">
          <h2 className="font-minecraft text-sm">1. Jegy és létszám</h2>
          <label className="block font-minecraft-body text-sm">
            Jegytípus
            <select
              className="minecraft-input w-full mt-1"
              value={ticketTypeId}
              onChange={(e) => setTicketTypeId(e.target.value)}
            >
              {detail.ticketTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.priceHuf.toLocaleString("hu-HU")} Ft
                  {t.pricingMode === "per_child" ? " / gyerek" : " / foglalás"}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-minecraft-body text-sm">
            Gyerekek száma
            <input
              type="number"
              min={1}
              max={maxKids}
              className="minecraft-input w-full mt-1"
              value={childCount}
              onChange={(e) => setChildCount(Number(e.target.value))}
            />
          </label>
          <p className="font-minecraft-body font-bold">
            Összesen: {total.toLocaleString("hu-HU")} Ft
          </p>
          <button type="button" className="minecraft-btn w-full" onClick={() => setStep(1)}>
            Tovább
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="minecraft-panel p-6 space-y-4">
          <h2 className="font-minecraft text-sm">2. Kapcsolattartó</h2>
          <input
            className="minecraft-input w-full"
            placeholder="Vásárló neve"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
          <input
            className="minecraft-input w-full"
            type="email"
            placeholder="Email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
          />
          <input
            className="minecraft-input w-full"
            placeholder="Telefon"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
          />
          <div className="flex gap-3">
            <button type="button" className="minecraft-btn flex-1" onClick={() => setStep(0)}>
              Vissza
            </button>
            <button type="button" className="minecraft-btn flex-1" onClick={() => setStep(2)}>
              Tovább
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="minecraft-panel p-6 space-y-4">
          <h2 className="font-minecraft text-sm">3. Gyerekek adatai</h2>
          {children.map((child, i) => (
            <div key={i} className="minecraft-panel-inner p-4 space-y-2">
              <p className="font-minecraft text-xs">Gyerek {i + 1}</p>
              <input
                className="minecraft-input w-full"
                placeholder="Gyerek neve"
                value={child.name}
                onChange={(e) => {
                  const next = [...children]
                  next[i] = { ...next[i], name: e.target.value }
                  setChildren(next)
                }}
              />
              <input
                className="minecraft-input w-full"
                type="date"
                value={child.birthDate}
                onChange={(e) => {
                  const next = [...children]
                  next[i] = { ...next[i], birthDate: e.target.value }
                  setChildren(next)
                }}
              />
              <textarea
                className="minecraft-input w-full min-h-[60px]"
                placeholder="Étkezéssel kapcsolatos kérés"
                value={child.dietaryRequest}
                onChange={(e) => {
                  const next = [...children]
                  next[i] = { ...next[i], dietaryRequest: e.target.value }
                  setChildren(next)
                }}
              />
              <textarea
                className="minecraft-input w-full min-h-[60px]"
                placeholder="Allergia"
                value={child.allergies}
                onChange={(e) => {
                  const next = [...children]
                  next[i] = { ...next[i], allergies: e.target.value }
                  setChildren(next)
                }}
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button type="button" className="minecraft-btn flex-1" onClick={() => setStep(1)}>
              Vissza
            </button>
            <button type="button" className="minecraft-btn flex-1" onClick={() => setStep(3)}>
              Tovább
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="minecraft-panel p-6 space-y-4">
          <h2 className="font-minecraft text-sm">4. Összegzés</h2>
          <ul className="font-minecraft-body text-sm space-y-1">
            <li>
              <strong>{selectedTicket?.name}</strong> × {childCount} gyerek
            </li>
            <li>{buyerName}</li>
            <li>{buyerEmail}</li>
            <li>{buyerPhone}</li>
          </ul>
          <p className="font-minecraft text-base">Fizetendő: {total.toLocaleString("hu-HU")} Ft</p>
          <div className="flex gap-3">
            <button type="button" className="minecraft-btn flex-1" onClick={() => setStep(2)}>
              Vissza
            </button>
            <button
              type="button"
              className="minecraft-btn flex-1 bg-[#5D9B38]"
              disabled={submitting || detail.session.spotsLeft < 1}
              onClick={() => void submit()}
            >
              {submitting ? "Átirányítás…" : "Fizetés Stripe-on"}
            </button>
          </div>
        </div>
      )}

      <Link href="/" className="block text-center font-minecraft-body text-sm text-[#1a3d5c] underline">
        ← Vissza a táborokhoz
      </Link>
    </div>
  )
}
