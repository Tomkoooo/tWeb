import type { FoxpostParcelPoint } from "@/lib/foxpost"
import type { GlsParcelPoint } from "@/lib/gls"

export function formatGlsParcelPointLines(point: GlsParcelPoint): string[] {
  const lines: string[] = []
  if (point.name?.trim()) lines.push(point.name.trim())
  const addr = [
    point.contact?.postalCode,
    point.contact?.city,
    point.contact?.address,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
  if (addr) lines.push(addr)
  return lines
}

export function formatFoxpostParcelPointLines(point: FoxpostParcelPoint): string[] {
  const lines: string[] = []
  if (point.name?.trim()) lines.push(point.name.trim())
  const addr = [point.zip, point.city, point.address].filter(Boolean).join(" ").trim()
  if (addr) lines.push(addr)
  return lines
}

/** Foxpost APT finder returns HTML in `findme` (directions, payment options, etc.). */
export function foxpostParcelPointFindmeHtml(point: FoxpostParcelPoint): string | undefined {
  const html = point.findme?.trim()
  return html || undefined
}
