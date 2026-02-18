"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Star, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Dynamic Industrial Background Layers */}
      <div className="absolute inset-0 bg-[#0A0A0A] z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-[1]" />
      
      {/* Radical Glow Effects */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-[#FF5500]/10 rounded-full blur-[180px] opacity-40" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] opacity-20" />

      <div className="container relative z-10 px-6 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Side Logo with Premium Floating Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative order-1 md:order-1"
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
              className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[650px] lg:h-[650px]"
            >
              <div className="absolute inset-0 bg-[#FF5500]/5 blur-3xl rounded-full scale-125 md:scale-140 animate-pulse" />
              <Image
                src="/logo.jpg"
                alt="Krausz Barkács Mester"
                fill
                className="object-contain relative z-10 mix-blend-screen brightness-125"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Clean, Bold, High-Contrast Typography - Left Aligned on Desktop */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-2 max-w-xl lg:max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-heading font-black mb-6 tracking-tighter text-white leading-[0.85] uppercase selection:bg-[#FF5500]">
                KRAUSZ
                <span className="block text-[#FF5500]">BARKÁCS</span>
                <span className="block">MESTER</span>
              </h1>
              <p className="text-lg md:text-2xl text-neutral-400 mb-12 font-medium tracking-tight max-w-xl">
                Mestermunka a kezedben. <br className="hidden md:block" />
                Precíziós szerszámok a modern mesterembernek, aki nem ismer kompromisszumot.
              </p>
            </motion.div>

            {/* High Contrast Buttons with Radius Transition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Button 
                size="sm" 
                className="btn-krausz bg-[#FF5500] hover:bg-white hover:text-black text-white h-16 px-10 text-lg border-none group"
              >
                IRÁNY A BOLT
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="btn-krausz border-white/20 text-white hover:bg-white hover:text-black h-16 px-10 text-lg group"
              >
                RÓLUNK
              </Button>
            </motion.div>

            {/* Backdrop-blurred info cards - Integrated vertically or horizontally depending on space */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full"
            >
              {[
                { icon: Star, text: "PRÉMIUM MINŐSÉG", sub: "Válogatott anyagok" },
                { icon: Shield, text: "GARI VÁLLALÁS", sub: "Hosszú élettartam" },
                { icon: Zap, text: "GYORS SZÁLLÍTÁS", sub: "Akár 24 órán belül" },
              ].map((item, i) => (
                <div key={i} className="glass-card p-4 flex flex-col items-center md:items-start gap-2 group hover:border-[#FF5500]/50 transition-colors">
                  <item.icon className="w-5 h-5 text-[#FF5500]" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">{item.text}</span>
                  <span className="text-[8px] font-bold tracking-[0.1em] text-neutral-500 uppercase">{item.sub}</span>
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
