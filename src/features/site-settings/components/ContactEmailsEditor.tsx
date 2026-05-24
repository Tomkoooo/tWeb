"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { ContactEmailEntry } from "@/lib/contact-emails"

function newEntry(): ContactEmailEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    email: "",
  }
}

export function ContactEmailsEditor({ initial }: { initial: ContactEmailEntry[] }) {
  const [entries, setEntries] = useState<ContactEmailEntry[]>(
    initial.length > 0 ? initial : [newEntry()]
  )
  const [saving, setSaving] = useState(false)

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400 max-w-2xl">
        Ez az egyetlen hely, ahonnan a weboldal e-mail címeit veszi (kapcsolat szekció, lábléc, űrlap). Több
        cím esetén a látogató kiválaszthatja a címzettet. Az első cím az üzleti értesítések alapértelmezettje.
      </p>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end bg-white/5 border border-white/10 p-4"
          >
            <label className="space-y-1 block">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">Megjelenő név</span>
              <input
                value={entry.label}
                onChange={(event) =>
                  setEntries((prev) =>
                    prev.map((row, idx) =>
                      idx === index ? { ...row, label: event.target.value } : row
                    )
                  )
                }
                placeholder="pl. Értékesítés"
                className="w-full h-10 px-3 bg-black border border-white/20 text-white text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">E-mail cím</span>
              <input
                type="email"
                value={entry.email}
                onChange={(event) =>
                  setEntries((prev) =>
                    prev.map((row, idx) =>
                      idx === index ? { ...row, email: event.target.value } : row
                    )
                  )
                }
                placeholder="ertekesites@example.com"
                className="w-full h-10 px-3 bg-black border border-white/20 text-white text-sm"
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              disabled={entries.length <= 1}
              onClick={() => setEntries((prev) => prev.filter((_, idx) => idx !== index))}
              className="h-10 rounded-none border border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200 disabled:opacity-30"
              aria-label="E-mail törlése"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEntries((prev) => [...prev, newEntry()])}
          className="rounded-none border-white/20 text-white hover:bg-white/10 h-11 font-black uppercase tracking-widest text-[10px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Új e-mail
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={async () => {
            const valid = entries.filter((row) => row.email.trim())
            if (valid.length === 0) {
              toast.error("Legalább egy érvényes e-mail cím szükséges.")
              return
            }
            setSaving(true)
            try {
              const response = await fetch("/api/admin/contact-emails", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ entries: valid }),
              })
              if (!response.ok) {
                toast.error("Mentés sikertelen.")
                return
              }
              const data = (await response.json()) as { entries: ContactEmailEntry[] }
              setEntries(data.entries.length > 0 ? data.entries : [newEntry()])
              toast.success("Kapcsolati e-mailek mentve.")
            } catch {
              toast.error("Mentés sikertelen.")
            } finally {
              setSaving(false)
            }
          }}
          className="rounded-none bg-primary hover:bg-primary/85 text-white h-11 font-black uppercase tracking-widest text-[10px] min-w-[160px]"
        >
          {saving ? "Mentés…" : "Mentés"}
        </Button>
      </div>
    </div>
  )
}
