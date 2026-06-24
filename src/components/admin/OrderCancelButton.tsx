"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import { cancelOrder } from "@/actions/admin-orders"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { cn } from "@/lib/utils"

type OrderCancelButtonProps = {
  orderId: string
  disabled?: boolean
  onCancelled?: () => void
  className?: string
}

export function OrderCancelButton({
  orderId,
  disabled = false,
  onCancelled,
  className,
}: OrderCancelButtonProps) {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    if (isCancelling || disabled) return

    const confirmed = window.confirm(
      [
        "Biztosan törölni szeretnéd ezt a rendelést?",
        "",
        "A művelet:",
        "• visszatéríti a Stripe fizetést (ha kártyás volt),",
        "• sztornózza a kiállított számlát (ha van),",
        "• visszaállítja a készletet,",
        "• és a rendelés állapotát „Törölve”-re állítja.",
        "",
        "Ez a művelet nem vonható vissza.",
      ].join("\n")
    )
    if (!confirmed) return

    setIsCancelling(true)
    try {
      const result = await cancelOrder(orderId)
      router.refresh()
      onCancelled?.()

      const details: string[] = []
      if (result.refunded) details.push("Stripe visszatérítés kész")
      if (result.invoiceReversed) {
        details.push(
          result.reversalInvoiceId
            ? `Számla sztornózva (${result.reversalInvoiceId})`
            : "Számla sztornózva"
        )
      }
      if (result.stockRestored) details.push("Készlet visszaállítva")

      toast.success(
        details.length > 0
          ? `Rendelés törölve. ${details.join(" · ")}`
          : "Rendelés törölve."
      )
    } catch (error) {
      console.error("Order cancellation failed:", error)
      toast.error(error instanceof Error ? error.message : "A rendelés törlése sikertelen.")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled || isCancelling}
      onClick={() => void handleCancel()}
      className={cn(
        "h-12 w-full rounded-none border border-rose-500/40 bg-rose-500/10 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 hover:text-rose-300",
        className
      )}
    >
      {isCancelling ? (
        <LoadingSpinner size="xs" className="mr-2 shrink-0" />
      ) : (
        <Ban className="mr-2 h-3.5 w-3.5 shrink-0" />
      )}
      Rendelés törlése
    </Button>
  )
}
