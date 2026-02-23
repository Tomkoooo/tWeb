"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Hammer, Users, Lightbulb } from "lucide-react"

interface StoryProps {
  title?: string
  content?: string
  accordions?: string // JSON string
}

export function Story({ title, content, accordions }: StoryProps) {
  const displayTitle = title || "A KRAUSZ LEGENDÁJA"
  const displayContent = content || "Magyarország szívében alapítva, a Krausz Barkács Mester egyetlen vízióval indult: olyan szerszámokat készíteni, amelyek ugyalonnan keményen dolgoznak, mint az emberek, akik használják őket."

  const parsedAccordions = React.useMemo(() => {
    if (!accordions) return null
    try {
      const parsed = JSON.parse(accordions)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch (e) {
      return null
    }
  }, [accordions])

  const defaultAccordions = [
    {
      title: "KÜLDETÉSÜNK: ERŐ ÉS PRECIZITÁS",
      content: "Nem csak szerszámokat adunk el; eszközöket biztosítunk az építéshez és az alkotáshoz. Minden darabot úgy tesztelünk, hogy kibírja a legextrémebb ipari igénybevételt is."
    },
    {
      title: "KRAUSZ MINŐSÉGI ÍGÉRET",
      content: "Szerszámaink magas széntartalmú acélból készülnek, ergonomikus markolattal. Ha Krausz szerszámot fogsz a kezedben, azonnal érzed a különbséget a tömegtermék és a mestermunka között."
    },
    {
      title: "INNOVATÍV FEJLESZTÉSEK",
      content: "Folyamatosan keressük az új technológiákat, legyen szó rezgéscsillapításról vagy intelligens akkumulátor kezelésről, hogy munkád hatékonyabb legyen."
    }
  ]

  const displayAccordions = parsedAccordions || defaultAccordions

  return (
    <section id="about" className="py-32 bg-[#0A0A0A] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-7xl font-heading font-black mb-10 text-white uppercase tracking-tighter">
              {displayTitle.includes("LEGENDÁJA") ? (
                <>
                  A KRAUSZ <span className="text-[#FF5500]">LEGENDÁJA</span>
                </>
              ) : (
                displayTitle
              )}
            </h2>
            <p className="text-neutral-400 text-xl mb-12 leading-relaxed max-w-xl">
              {displayContent}
            </p>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {displayAccordions.map((item: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/5 bg-white/5 px-6 rounded-none">
                  <AccordionTrigger className="text-white hover:text-[#FF5500] font-heading font-black uppercase tracking-widest text-left no-underline py-6">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-400 text-lg leading-relaxed pb-6 whitespace-pre-wrap">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Cards with high-contrast blurs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <Shield className="w-10 h-10" />, title: "BIZTONSÁG", desc: "Maximális védelem a legveszélyesebb munkák során is." },
              { icon: <Hammer className="w-10 h-10" />, title: "MESTERSÉG", desc: "Minden kalapácsütésnél érezhető szakértelem." },
              { icon: <Users className="w-10 h-10" />, title: "KÖZÖSSÉG", desc: "Több ezer elégedett magyar mesterember bizalma." },
              { icon: <Lightbulb className="w-10 h-10" />, title: "OKOS TERVEZÉS", desc: "Ergonómia, ami kíméli az ízületeket hosszú távon." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className={cn(
                  "glass-card p-10 h-full flex flex-col items-center text-center group hover:border-[#FF5500]/50 transition-all",
                  i % 2 === 1 ? "lg:mt-12" : ""
                )}>
                  <div className="w-20 h-20 bg-[#FF5500]/5 rounded-full flex items-center justify-center mb-8 border border-white/5 group-hover:bg-[#FF5500]/20 transition-all">
                    <div className="text-[#FF5500]">{item.icon}</div>
                  </div>
                  <h3 className="text-white font-heading font-black mb-4 tracking-widest uppercase">{item.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
import { cn } from "@/lib/utils"
