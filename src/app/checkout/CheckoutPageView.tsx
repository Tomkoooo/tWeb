"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FallbackImage } from "@/components/common/FallbackImage"
import { useCheckoutWizardModel } from "@/components/checkout/use-checkout-wizard-model"
import { ReservationCountdown } from "@/components/checkout/ReservationCountdown"
import type { CartItem } from "@/store/useCartStore"
import { clampVatPercent, DEFAULT_VAT_PERCENT } from "@/lib/pricing"

export function CheckoutPageView({ variant = "page" }: { variant?: "page" | "embedded" }) {
  const embedded = variant === "embedded"
  const wizard = useCheckoutWizardModel({ variant })
  const {
    currentStep,
    steps,
    shopEnabled,
    items,
    nextStep,
    prevStep,
    totals,
    totalBreakdown,
    selectedShipping,
    selectedPayment,
    priceBreakdownFromGross,
    formatHuf,
    renderStep,
    handleSubmitOrder,
    isSubmitting,
    stripeRedirectHold,
    goToStripeNow,
  } = wizard

  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (searchParams.get("stripeCancelled") !== "1") return
    const id = typeof window !== "undefined" ? sessionStorage.getItem("stripeTempOrderId") : null
    if (!id) return
    void fetch("/api/checkout/stripe/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tempOrderId: id }),
    }).finally(() => {
      try {
        sessionStorage.removeItem("stripeTempOrderId")
      } catch {
        /* ignore */
      }
    })
  }, [searchParams])

  const mainShell = embedded
    ? "min-h-0 bg-transparent py-2 pb-8 px-2 sm:px-3"
    : "min-h-screen bg-background pt-48 pb-20 px-6"

  return (
    <main className={cn(mainShell, "relative")}>
      {stripeRedirectHold ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 px-6 py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stripe-redirect-title"
        >
          <div className="max-w-md w-full space-y-8 border border-border bg-card p-8 shadow-lg">
            <h2 id="stripe-redirect-title" className="text-xl font-heading font-black uppercase tracking-tight">
              Stripe fizetés
            </h2>
            <ReservationCountdown
              reservationExpiresAtIso={stripeRedirectHold.reservationExpiresAt}
              serverTimeIso={stripeRedirectHold.serverTime}
              appearance="light"
            />
            <p className="text-sm text-muted-foreground">
              Néhány másodperc múlva automatikusan átirányítunk a biztonságos fizetőoldalra. A készlet addig marad
              lefoglalva, amíg a visszaszámláló le nem jár.
            </p>
            <Button
              type="button"
              className="w-full h-12 rounded-none font-black uppercase tracking-widest text-xs"
              onClick={goToStripeNow}
            >
              Tovább a Stripe-hoz most
            </Button>
          </div>
        </div>
      ) : null}
      {searchParams.get("stripeCancelled") === "1" && (
        <div className="container mx-auto max-w-4xl mb-10">
          <div className="border border-amber-500/35 bg-amber-500/10 px-6 py-5 space-y-4">
            <p className="text-foreground font-black uppercase tracking-widest text-xs">
              A Stripe fizetés megszakadt — a rendelés nem jött létre.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Ha technikai hibát tapasztaltál, írj nekünk üzenetben; segítünk egyeztetni a helyzetet (például
              dupla terhelés vagy sikertelen fizetés után is).
            </p>
            <Link href="/#contact">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-12 px-8 font-black uppercase tracking-widest text-[10px]">
                Kapcsolatfelvételi űrlap megnyitása →
              </Button>
            </Link>
          </div>
        </div>
      )}
      {shopEnabled === false ? (
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-16 border-border text-center space-y-6">
            <p className="text-3xl font-heading font-black uppercase tracking-tighter text-foreground">
              Jelenleg a rendelés leadás szünetel
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/80 text-primary-foreground h-14 px-10 font-black uppercase tracking-widest text-xs"
            >
              Vissza a főoldalra
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-6xl">
          <div
            className={`sticky z-40 mb-10 flex items-center justify-between border-b border-border bg-background pb-6 pt-6 ${
              embedded ? "top-0" : "top-[80px] lg:top-[90px]"
            }`}
          >
            <div className="absolute top-1/2 left-0 w-full h-px bg-muted/50 -translate-y-1/2 z-0" />
            {steps.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-none flex items-center justify-center border-2 transition-all duration-500 font-black",
                      isActive
                        ? "bg-primary border-primary-foreground/35 text-primary-foreground scale-110 shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                        : isCompleted
                          ? "bg-muted text-foreground border-border"
                          : "bg-background border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                      isActive
                        ? "text-foreground"
                        : isCompleted
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-10 border-border"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-8 bg-primary" />
                    <h2 className="text-3xl font-heading font-black text-foreground uppercase italic">
                      {steps[currentStep]?.title}
                    </h2>
                  </div>

                  <div className="min-h-[400px]">{renderStep()}</div>

                  <div className="flex justify-between mt-12 pt-8 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="text-foreground hover:bg-muted/50 rounded-none font-black uppercase tracking-widest text-xs"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Vissza
                    </Button>

                    {currentStep === steps.length - 1 ? (
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-none h-16 px-12 font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
                      >
                        {isSubmitting ? "FELDOLGOZÁS..." : "MEGRENDELÉS LEADÁSA"}{" "}
                        <Check className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        className="bg-muted text-foreground hover:bg-muted/80 rounded-none border border-border h-14 px-10 font-black uppercase tracking-widest text-xs flex items-center"
                      >
                        Folytatás <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4">
              <div className="glass-card p-8 border-border sticky top-40">
                <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                  <Package className="w-5 h-5 text-primary-foreground" />
                  <h3 className="font-heading font-black text-foreground uppercase tracking-tighter">
                    MEGRENDELÉS
                  </h3>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {items.map((item: CartItem) => {
                    const breakdown = priceBreakdownFromGross(
                      item.price,
                      item.quantity,
                      clampVatPercent(item.vatPercent ?? DEFAULT_VAT_PERCENT)
                    )
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 bg-muted border border-border flex-none overflow-hidden">
                          <FallbackImage
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="grow min-w-0">
                          <p className="text-[10px] font-black text-foreground uppercase truncate">{item.name}</p>
                          {item.variantLabel ? (
                            <p className="text-[10px] text-primary-foreground font-black uppercase tracking-widest mt-1">
                              {item.variantLabel}
                            </p>
                          ) : null}
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            {item.quantity} x {formatHuf(breakdown.unitGross)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            Nettó {formatHuf(breakdown.lineNet)} · ÁFA {formatHuf(breakdown.lineVat)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Részösszeg</span>
                    <span>{formatHuf(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Szállítás</span>
                    <span className={cn(selectedShipping ? "text-foreground" : "text-primary-foreground")}>
                      {selectedShipping ? formatHuf(totals.shippingFee) : "VÁLASZTÁS ALATT"}
                    </span>
                  </div>
                  {selectedPayment && totals.paymentFee > 0 && (
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <span>Fizetési kezelési díj</span>
                      <span>{formatHuf(totals.paymentFee)}</span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-[10px] font-black text-primary-foreground uppercase tracking-widest">
                      <span>Kedvezmény</span>
                      <span>-{formatHuf(totals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Nettó összesen</span>
                    <span>{formatHuf(totalBreakdown.net)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>ÁFA összesen</span>
                    <span>{formatHuf(totalBreakdown.vat)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-1">
                        Összesen
                      </p>
                      <p className="text-3xl font-black text-foreground tracking-tighter leading-none">
                        {formatHuf(totalBreakdown.gross)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
