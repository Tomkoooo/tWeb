"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const tempOrderId = searchParams.get("tempOrderId")
  const sessionId = searchParams.get("session_id")
  const clearCart = useCartStore((state: any) => state.clearCart)
  const [status, setStatus] = React.useState<"processing" | "success" | "error">(
    tempOrderId ? "processing" : "success"
  )
  const [message, setMessage] = React.useState(
    tempOrderId
      ? "A fizetés feldolgozása folyamatban van. Kérjük, maradj az oldalon."
      : "Rendelésedet rögzítettük és hamarosan feldolgozzuk. A visszaigazolást elküldtük az e-mail címedre."
  )

  React.useEffect(() => {
    if (!tempOrderId) return;

    let stopped = false;
    let attempts = 0;

    const checkStatus = async () => {
      attempts += 1;
      try {
        const params = new URLSearchParams({ tempOrderId });
        if (sessionId) params.set("session_id", sessionId);
        const res = await fetch(`/api/checkout/stripe/status?${params.toString()}`);
        if (!res.ok) throw new Error("Status fetch failed");
        const data = await res.json();

        if (stopped) return;

        if (data?.finalized) {
          clearCart();
          setStatus("success");
          setMessage("A fizetés sikeres volt, rendelésedet rögzítettük. A visszaigazolást elküldtük az e-mail címedre.");
          return;
        }

        if (data?.status === "failed" || data?.status === "expired") {
          setStatus("error");
          setMessage(data?.lastError || "A fizetés nem sikerült vagy megszakadt. A rendelés nem került létrehozásra.");
          return;
        }

        if (attempts > 30) {
          setStatus("error");
          setMessage("A fizetés visszaigazolása túl sokáig tart. Frissítsd az oldalt vagy próbáld meg később.");
          return;
        }

        setTimeout(checkStatus, 2000);
      } catch {
        if (stopped) return;
        if (attempts > 30) {
          setStatus("error");
          setMessage("Nem sikerült ellenőrizni a fizetés állapotát. Frissítsd az oldalt.");
          return;
        }
        setTimeout(checkStatus, 2000);
      }
    };

    checkStatus();
    return () => {
      stopped = true;
    };
  }, [tempOrderId, sessionId, clearCart]);

  return (
    <main className="min-h-screen bg-black pt-40 pb-20 px-6">
      <div className="container mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 border-white/5"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-10">
            {status === "processing" ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : status === "error" ? (
              <AlertTriangle className="w-12 h-12 text-primary" />
            ) : (
              <CheckCircle className="w-12 h-12 text-primary" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 uppercase tracking-tighter italic">
            {status === "error"
              ? "FIZETÉSI "
              : "KÖSZÖNJÜK A "}
            <span className="text-primary">
              {status === "error" ? "HIBA" : "RENDELÉST!"}
            </span>
          </h1>
          <p className="text-neutral-400 text-lg mb-12 max-w-md mx-auto font-medium">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="flex-grow sm:flex-grow-0">
              <Button className="w-full bg-white text-black hover:bg-neutral-200 h-16 px-10 font-black uppercase tracking-widest text-xs rounded-none">
                FOLYTATOM A VÁSÁRLÁST
              </Button>
            </Link>
            <Link href="/" className="flex-grow sm:flex-grow-0">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-16 px-10 font-black uppercase tracking-widest text-xs rounded-none">
                 VISSZA A FŐOLDALRA <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
