"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-black pt-40 pb-20 px-6">
      <div className="container mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-16 border-white/5"
        >
          <div className="w-24 h-24 bg-[#FF5500]/20 rounded-full flex items-center justify-center mx-auto mb-10">
            <CheckCircle className="w-12 h-12 text-[#FF5500]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-6 uppercase tracking-tighter italic">
            KÖSZÖNJÜK A <span className="text-[#FF5500]">RENDELÉST!</span>
          </h1>
          <p className="text-neutral-400 text-lg mb-12 max-w-md mx-auto font-medium">
            Rendelésedet rögzítettük és hamarosan feldolgozzuk. A visszaigazolást elküldtük az e-mail címedre.
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
