"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel"
import { reviews } from "@/lib/mock-data"
import Image from "next/image"

export function Reviews() {
  return (
    <section id="reviews" className="py-32 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF5500]/5 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-heading font-black mb-6 text-white uppercase tracking-tighter"
          >
            MESTER <span className="text-[#FF5500]">VÉLEMÉNYEK</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Aki kézbe vette, az tudja. Hallgasd meg a profi mesterembereket, akiknek minden nap a Krausz a társa munkában.
          </motion.p>
        </div>

        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {reviews.map((review, idx) => (
              <CarouselItem key={review.id} className="p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <div className="glass-card p-12 md:p-16 relative overflow-hidden h-full border-white/10 group hover:border-[#FF5500]/30 transition-all duration-500">
                    <Quote className="w-24 h-24 text-[#FF5500]/10 absolute -top-4 -right-4 transition-transform group-hover:scale-110" />
                    
                    <div className="flex gap-1.5 mb-10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? "fill-[#FFD700] text-[#FFD700]" : "text-white/10"}`}
                        />
                      ))}
                    </div>

                    <p className="text-white text-2xl md:text-3xl italic mb-14 relative z-10 font-medium leading-normal tracking-tight">
                      &ldquo;{review.content}&rdquo;
                    </p>

                    <div className="flex items-center gap-6 border-t border-white/5 pt-10">
                      <div className="relative w-16 h-16 rounded-none overflow-hidden border-2 border-[#FF5500]/30">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white text-xl font-heading font-black tracking-wider uppercase mb-1">{review.name}</h4>
                        <p className="text-[#FF5500] text-sm font-black uppercase tracking-[0.2em]">{review.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-16 gap-6">
            <CarouselPrevious className="relative left-0 translate-y-0 h-16 w-16 bg-white/5 border-white/10 text-white hover:bg-[#FF5500] hover:border-[#FF5500] rounded-none" />
            <CarouselNext className="relative right-0 translate-y-0 h-16 w-16 bg-white/5 border-white/10 text-white hover:bg-[#FF5500] hover:border-[#FF5500] rounded-none" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
