"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

type AdminOrdersExportLinkProps = {
  exportQuery: string
  labelsZipEnabled?: boolean
}

function parseFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null
  const match = contentDisposition.match(/filename="([^"]+)"/i)
  return match?.[1] ?? null
}

async function readExportError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error === "Unauthorized") {
        return "Nincs jogosultság az exporthoz. Jelentkezzen be újra admin felhasználóként."
      }
      if (body.error) return body.error
    } catch {
      // fall through
    }
  }
  const text = await response.text()
  if (text.trim()) return text.slice(0, 200)
  return `Az export sikertelen (HTTP ${response.status}).`
}

export function AdminOrdersExportLink({
  exportQuery,
  labelsZipEnabled = false,
}: AdminOrdersExportLinkProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingLabelsZip, setIsExportingLabelsZip] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const url = exportQuery
        ? `/api/admin/orders/export?${exportQuery}`
        : "/api/admin/orders/export"

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(await readExportError(response))
      }

      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("spreadsheetml") && !contentType.includes("octet-stream")) {
        throw new Error(
          "A szerver nem Excel fájlt adott vissza. Frissítse az oldalt, majd próbálja újra."
        )
      }

      const blob = await response.blob()
      if (blob.size < 4) {
        throw new Error("Az export üres fájlt adott vissza.")
      }

      const filename =
        parseFilename(response.headers.get("content-disposition")) ||
        `rendelesek-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`

      const objectUrl = URL.createObjectURL(
        new Blob([await blob.arrayBuffer()], { type: XLSX_MIME })
      )
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = filename
      anchor.rel = "noopener"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success("Excel export letöltve.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Az Excel export nem sikerült."
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleLabelsZipExport = async () => {
    setIsExportingLabelsZip(true)
    try {
      const url = exportQuery
        ? `/api/admin/orders/export-labels?${exportQuery}`
        : "/api/admin/orders/export-labels"

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(await readExportError(response))
      }

      const blob = await response.blob()
      if (blob.size < 4) {
        throw new Error("A címke ZIP üres.")
      }

      const filename =
        parseFilename(response.headers.get("content-disposition")) ||
        `cimkek-${format(new Date(), "yyyy-MM-dd-HHmm")}.zip`

      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = objectUrl
      anchor.download = filename
      anchor.rel = "noopener"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success("Címke ZIP letöltve.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "A címke ZIP export nem sikerült."
      toast.error(message)
    } finally {
      setIsExportingLabelsZip(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        disabled={isExporting || isExportingLabelsZip}
        onClick={handleExport}
        className="h-12 shrink-0 rounded-none border-white/10 bg-black font-black uppercase tracking-widest text-[10px] text-white hover:bg-white/10"
        title="Az aktuális szűrők alapján exportál (lista, mix, címke állapot, összeg, dátumok, stb.)."
      >
        {isExporting ? (
          <LoadingSpinner className="mr-2 h-4 w-4" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Excel export
      </Button>
      {labelsZipEnabled ? (
        <Button
          type="button"
          variant="outline"
          disabled={isExporting || isExportingLabelsZip}
          onClick={handleLabelsZipExport}
          className="h-12 shrink-0 rounded-none border-white/10 bg-black font-black uppercase tracking-widest text-[10px] text-white hover:bg-white/10"
        >
          {isExportingLabelsZip ? (
            <LoadingSpinner className="mr-2 h-4 w-4" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Címkék ZIP (szűrés)
        </Button>
      ) : null}
    </div>
  )
}
