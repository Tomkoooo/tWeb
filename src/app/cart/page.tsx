"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCartStore, CartItem } from "@/store/useCartStore"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/layout/Navbar"

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    totalPrice, 
    totalNetPrice,
    totalItems 
  } = useCartStore()

  // For pagination (as requested)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(items.length / itemsPerPage)
  
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-48 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-20 border-white/5"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-10 h-10 text-neutral-500" />
            </div>
            <h1 className="text-4xl font-heading font-black text-white mb-6 uppercase tracking-tighter">
              A KOSARAD ÜRES
            </h1>
            <p className="text-neutral-400 text-lg mb-10 max-w-md mx-auto">
              Még nem adtál hozzá semmit a kosaradhoz. Fedezd fel professzionális szerszám kínálatunkat!
            </p>
            <Link href="/shop">
              <Button className="bg-[#FF5500] hover:bg-[#FF7722] text-white h-16 px-12 text-lg btn-krausz font-black">
                IRÁNY A BOLT <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black pt-48 pb-20 px-6">
      <Navbar/>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Items List */}
          <div className="lg:flex-grow">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-4xl md:text-5xl font-heading font-black text-white uppercase tracking-tighter">
                KOSÁR <span className="text-[#FF5500]">({totalItems})</span>
              </h1>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {paginatedItems.map((item: CartItem) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-6 border-white/5 flex flex-col sm:flex-row items-center gap-6"
                  >
                    {/* Item Image */}
                    <div className="relative w-32 h-32 bg-neutral-900 border border-white/5 overflow-hidden flex-none">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow text-center sm:text-left">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="text-xl font-heading font-black text-white hover:text-[#FF5500] transition-colors uppercase mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-bold mt-2">
                        {item.discount > 0 && (
                          <span className="text-[#FF5500]">-{item.discount}% KEDVEZMÉNY</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white/5 border border-white/10 p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white hover:bg-white/10 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-black text-white">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-white hover:bg-white/10 rounded-none"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Price and Delete */}
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">
                          {(item.price * item.quantity).toLocaleString("hu-HU")} FT
                        </div>
                        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                          Bruttó ár
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn(
                      "w-12 h-12 rounded-none font-black transition-all",
                      currentPage === i + 1 ? "bg-[#FF5500] border-[#FF5500] text-white" : "border-white/10 text-neutral-400 hover:border-white/20"
                    )}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Totals Summary */}
          <div className="lg:w-[400px] flex-none">
            <div className="glass-card p-10 border-white/5 sticky top-40">
              <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-8 pb-4 border-b border-white/10">
                RENDELÉS ÖSSZESÍTŐ
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-neutral-400 font-bold text-sm tracking-widest uppercase">
                  <span>Részösszeg (Nettó)</span>
                  <span>{totalNetPrice.toLocaleString("hu-HU")} FT</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400 font-bold text-sm tracking-widest uppercase">
                  <span>ÁFA (27%)</span>
                  <span>{(totalPrice - totalNetPrice).toLocaleString("hu-HU")} FT</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 font-black text-[10px] tracking-[0.3em] uppercase mb-1">Fizetendő összesen</span>
                    <span className="text-4xl font-black text-[#FF5500] tracking-tighter leading-none">
                      {totalPrice.toLocaleString("hu-HU")} FT
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-[#FF5500] hover:bg-[#FF7722] text-white h-20 text-xl btn-krausz font-black tracking-widest uppercase group overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    PÉNZTÁRHOZ
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-none group hover:border-[#FF5500]/30 transition-colors">
                  <Truck className="w-5 h-5 text-[#FF5500]" />
                  <span className="text-[10px] font-black tracking-widest text-neutral-300 uppercase">Gyors és biztos házhozszállítás</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-none group hover:border-[#FF5500]/30 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-[#FF5500]" />
                  <span className="text-[10px] font-black tracking-widest text-neutral-300 uppercase">Hivatalos garancia minden termékre</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-none group hover:border-[#FF5500]/30 transition-colors">
                  <CreditCard className="w-5 h-5 text-[#FF5500]" />
                  <span className="text-[10px] font-black tracking-widest text-neutral-300 uppercase">Biztonságos online fizetési lehetőségek</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
