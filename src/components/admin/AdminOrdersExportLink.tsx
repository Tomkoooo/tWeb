"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminOrdersExportLinkProps = {
  href: string
}

export function AdminOrdersExportLink({ href }: AdminOrdersExportLinkProps) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-12 shrink-0 rounded-none border-white/10 bg-black font-black uppercase tracking-widest text-[10px] text-white hover:bg-white/10"
    >
      <a href={href} download>
        <Download className="mr-2 h-4 w-4" />
        Excel export
      </a>
    </Button>
  )
}
