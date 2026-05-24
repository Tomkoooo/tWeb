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
import {
  cxParcelPickerTrigger,
  ParcelLockerMapDialog,
} from "@/components/checkout/ParcelLockerMapDialog"
import { type CheckoutStepAppearance } from "@/components/checkout/checkout-appearance"

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
    address: apt.address?.trim() || apt.street?.trim() || undefined,
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
  const [dialogOpen, setDialogOpen] = React.useState(!hasSelection)

  React.useEffect(() => {
    if (!hasSelection) setDialogOpen(true)
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
          setDialogOpen(false)
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
      <ParcelLockerMapDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Foxpost csomagautomata választása"
        description="Válaszd ki az automátát a térképen. A kiválasztás után a párbeszédablak bezárul."
        appearance={appearance}
      >
        {dialogOpen ? (
          <iframe
            title="Foxpost csomagautomata választó"
            src={FOXPOST_APT_FINDER_URL}
            className="h-full min-h-[50dvh] w-full border-0"
            loading="lazy"
          />
        ) : null}
      </ParcelLockerMapDialog>
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
      {!dialogOpen ? (
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className={cxParcelPickerTrigger(appearance)}
        >
          {hasSelection ? "Másik Foxpost automata választása" : "Foxpost automata kiválasztása a térképen"}
        </button>
      ) : null}
    </div>
  )
}
