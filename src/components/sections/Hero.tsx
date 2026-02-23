"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Star, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeroProps {
  title?: string
  description?: string
}

export function Hero({ title, description }: HeroProps) {
  const displayTitle = title || "KRAUSZ BARKÁCS MESTER"
  const displayDescription = description || "Mestermunka a kezedben. Precíziós szerszámok a modern mesterembernek, aki nem ismer kompromisszumot."

  // To maintain the "Krausz Barkács Mester" structure even with dynamic text, 
  // we check if the title is the default one and then split it.
  // If it's a new title, we just display it.
  const isDefaultTitle = !title || title === "KRAUSZ BARKÁCS MESTER"

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Dynamic Industrial Background Layers */}
      <div className="absolute inset-0 bg-[#0A0A0A] z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-[1]" />
      
      {/* Radical Glow Effects */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-[#FF5500]/10 rounded-full blur-[180px] opacity-40" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] opacity-20" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 min-h-[calc(100vh-80px)]">
          {/* Side Logo with Premium Floating Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-start pt-10 lg:pt-0"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] xl:w-[550px] xl:h-[550px]"
            >
              <div className="absolute inset-0 bg-[#FF5500]/10 blur-[100px] rounded-full scale-110 animate-pulse" />
              <Image
                src="/logo.jpg"
                alt="Krausz Barkács Mester"
                fill
                className="object-contain relative z-10 mix-blend-screen brightness-125"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Typography Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-6xl xl:text-7xl font-heading font-black mb-6 tracking-tighter text-white leading-[0.9] uppercase selection:bg-[#FF5500]">
                {isDefaultTitle ? (
                  <>
                    KRAUSZ
                    <span className="block text-[#FF5500]">BARKÁCS</span>
                    <span className="block">MESTER</span>
                  </>
                ) : (
                  <span className="block">
                    {(() => {
                      const words = displayTitle.split(' ');
                      if (words.length <= 1) return displayTitle;
                      
                      // Match the "Mestermunka a Kezedben" style from the screenshot
                      // We'll highlight the last word/segment
                      const firstPart = words.slice(0, -1).join(' ');
                      const lastWord = words[words.length - 1];
                      
                      return (
                        <>
                          <span className="block">{firstPart}</span>
                          <span className="inline-block bg-[#FF5500] text-white px-4 mt-2">
                            {lastWord}
                          </span>
                        </>
                      );
                    })()}
                  </span>
                )}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-neutral-400 mb-10 font-medium tracking-tight max-w-xl mx-auto lg:mx-0">
                {displayDescription}
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/shop" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="btn-krausz w-full sm:w-auto bg-[#FF5500] hover:bg-white hover:text-black text-white h-14 sm:h-16 px-8 sm:px-10 text-lg border-none group transition-all duration-300"
                >
                  IRÁNY A BOLT
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-krausz border-white/20 text-white hover:bg-white hover:text-black h-14 sm:h-16 px-8 sm:px-10 text-lg group transition-all duration-300 bg-white/5 backdrop-blur-sm"
              >
                RÓLUNK
              </Button>
            </motion.div>

            {/* Micro-Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-12 w-full lg:max-w-xl"
            >
              {[
                { icon: Star, text: "PRÉMIUM", sub: "MINŐSÉG" },
                { icon: Shield, text: "GARI", sub: "VÁLLALÁS" },
                { icon: Zap, text: "GYORS", sub: "SZÁLLÍTÁS" },
              ].map((item, i) => (
                <div key={i} className="flex flex-row sm:flex-col items-center lg:items-start justify-center sm:justify-start gap-3 sm:gap-1 p-3 border border-white/5 rounded-xl bg-white/5 hover:border-[#FF5500]/30 transition-all duration-300">
                  <item.icon className="w-4 h-4 text-[#FF5500]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest text-white leading-none">{item.text}</span>
                    <span className="text-[8px] font-bold tracking-wider text-neutral-500">{item.sub}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>



      {/* Industrial Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#FF5500] to-transparent" />
      </motion.div>
    </section>
  )
}
