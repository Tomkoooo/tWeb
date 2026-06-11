"use client"

import { useState } from "react"
import { pressPortalApi } from "./press-api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { trackPressEvent } from "@/lib/analytics/track"

type Props = {
  accessMode: string
  tokenFromUrl?: string
  portalTitle: string
  onSuccess: () => void
}

export function PressGate({ accessMode, tokenFromUrl, portalTitle, onSuccess }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, string> = {}
      if (accessMode === "unique_link" && tokenFromUrl) {
        body.token = tokenFromUrl
        if (password.trim()) body.password = password
      } else {
        body.email = email.trim()
        body.password = password
      }
      const res = await pressPortalApi.auth(body)
      trackPressEvent("press_portal_login", {
        press_contact_id: res.contact.id,
        press_outlet: res.contact.outlet,
        press_name: res.contact.name,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Belépés sikertelen")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-lg">
      <h1 className="text-2xl font-bold tracking-tight mb-2">{portalTitle}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ez az oldal sajtóknak szóló anyagokat tartalmaz. Kérjük, add meg a belépési adataidat.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {accessMode !== "unique_link" ? (
          <Input
            type="email"
            placeholder="E-mail cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        ) : null}
        {(accessMode === "shared_password" ||
          accessMode === "password_per_contact" ||
          accessMode === "unique_link") && (
          <Input
            type="password"
            placeholder={accessMode === "unique_link" ? "Jelszó (ha kaptál)" : "Jelszó"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={accessMode !== "unique_link"}
            autoComplete="current-password"
          />
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Belépés…" : "Belépés"}
        </Button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        A portál használatát mérjük a sajtószolgálat javítása érdekében.
      </p>
    </div>
  )
}
