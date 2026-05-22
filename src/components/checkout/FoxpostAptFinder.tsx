"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  FOXPOST_APT_FINDER_ORIGIN,
  FOXPOST_APT_FINDER_URL,
  type FoxpostApmSelection,
  type FoxpostParcelPoint,
} from "@/lib/foxpost"
import { resolveApmDestinationId } from "@/lib/parcel-locker"
import { CheckoutRichHtml } from "@/components/checkout/CheckoutRichHtml"
import { cxGlsBox, type CheckoutStepAppearance } from "@/components/checkout/checkout-appearance"

type FoxpostAptFinderProps = {
  selected?: FoxpostParcelPoint | null
  onSelect: (point: FoxpostParcelPoint) => void
  appearance?: CheckoutStepAppearance
}

function mapSelectionToParcelPoint(apt: FoxpostApmSelection): FoxpostParcelPoint | null {
  const id = resolveApmDestinationId({
    operator_id: apt.operator_id,
    place_id: apt.place_id,
  })
  const name = apt.name?.trim()
  if (!id || !name) return null

  const countryRaw = apt.country?.trim()
  const countryCode = countryRaw
    ? countryRaw.length === 2
      ? countryRaw.toUpperCase()
      : countryRaw.toLowerCase() === "hu"
        ? "HU"
        : undefined
    : "HU"

  return {
    id,
    name,
    address: apt.address?.trim() || undefined,
    zip: apt.zip?.trim() || undefined,
    city: apt.city?.trim() || undefined,
    findme: apt.findme?.trim() || undefined,
    load: apt.load?.trim() || undefined,
    countryCode,
  }
}

export function FoxpostAptFinder({
  selected,
  onSelect,
  appearance = "dark",
}: FoxpostAptFinderProps) {
  const onSelectRef = React.useRef(onSelect)
  onSelectRef.current = onSelect
  const hasSelection = Boolean(selected?.id)
  const [mapOpen, setMapOpen] = React.useState(!hasSelection)

  React.useEffect(() => {
    if (!hasSelection) setMapOpen(true)
  }, [hasSelection])

  React.useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (!event.origin?.startsWith(FOXPOST_APT_FINDER_ORIGIN)) return
      if (typeof event.data !== "string") return

      try {
        const apt = JSON.parse(event.data) as FoxpostApmSelection
        const point = mapSelectionToParcelPoint(apt)
        if (point) {
          onSelectRef.current(point)
          setMapOpen(false)
        }
      } catch {
        // ignore non-JSON messages from the iframe
      }
    }

    window.addEventListener("message", receiveMessage, false)
    return () => window.removeEventListener("message", receiveMessage, false)
  }, [])

  return (
    <div className="space-y-4">
      {mapOpen ? (
        <div className={cn(cxGlsBox(appearance), "overflow-hidden")}>
          <iframe
            title="Foxpost csomagautomata választó"
            src={FOXPOST_APT_FINDER_URL}
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      ) : null}
      {hasSelection && selected ? (
        <div
          className={cn(
            "border p-3",
            appearance === "light"
              ? "rounded-lg border-primary-foreground/40 bg-primary/5"
              : "border border-primary-foreground/40 bg-white/5"
          )}
        >
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              appearance === "light" ? "text-foreground" : "text-white"
            )}
          >
            Kiválasztott automata: {selected.name}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {selected.zip || ""} {selected.city || ""} {selected.address || ""}
          </p>
          <CheckoutRichHtml
            html={selected.findme}
            appearance={appearance}
            className="mt-2 text-xs"
          />
        </div>
      ) : (
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
          Még nem választottál Foxpost csomagautomatát.
        </p>
      )}
      {hasSelection && !mapOpen ? (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground underline-offset-2 hover:underline"
        >
          Másik Foxpost automata választása
        </button>
      ) : null}
    </div>
  )
}
