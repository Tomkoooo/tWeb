"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function SuccessInner() {
  const searchParams = useSearchParams()
  const holdId = searchParams.get("holdId")
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  useEffect(() => {
    if (!holdId) {
      setStatus("error")
      return
    }
    const poll = async () => {
      const q = new URLSearchParams({ holdId })
      if (sessionId) q.set("session_id", sessionId)
      const res = await fetch(`/api/plugins/camp-booking/checkout/status?${q}`)
      const data = await res.json()
      if (data.status === "finalized" && data.registrationId) {
        setRegistrationId(data.registrationId)
        setStatus("ok")
        return true
      }
      if (data.lastError) {
        setStatus("error")
        return true
      }
      return false
    }
    let attempts = 0
    const id = setInterval(async () => {
      attempts++
      const done = await poll()
      if (done || attempts > 30) {
        clearInterval(id)
        if (!done && attempts > 30) setStatus("error")
      }
    }, 1500)
    void poll()
    return () => clearInterval(id)
  }, [holdId, sessionId])

  return (
    <div className="minecraft-panel max-w-lg mx-auto p-8 text-center">
      {status === "loading" && (
        <p className="font-minecraft-body">Fizetés ellenőrzése…</p>
      )}
      {status === "ok" && (
        <>
          <h1 className="font-minecraft text-lg text-[#2d5016] mb-4">Sikeres foglalás!</h1>
          <p className="font-minecraft-body text-sm mb-6">
            Köszönjük! Visszaigazolást küldünk emailben. Azonosító: {registrationId}
          </p>
          <Link href="/" className="minecraft-btn inline-block">
            Vissza a főoldalra
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="font-minecraft-body text-red-800 mb-4">
            Nem sikerült megerősíteni a fizetést. Ha levonták az összeget, írjon nekünk.
          </p>
          <Link href="/" className="minecraft-btn inline-block">
            Főoldal
          </Link>
        </>
      )}
    </div>
  )
}

export default function FoglalasSikerPage() {
  return (
    <main className="minecraft-page min-h-screen flex items-center justify-center px-4 py-16">
      <Suspense fallback={<p>Betöltés…</p>}>
        <SuccessInner />
      </Suspense>
    </main>
  )
}
