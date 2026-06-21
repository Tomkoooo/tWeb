"use client"

import { cn } from "@/lib/utils"
import "../cabinova.css"

export function CabinovaRoot({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("cabinova-root min-h-screen bg-background text-foreground", className)}>{children}</div>
}
