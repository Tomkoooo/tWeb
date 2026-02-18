"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#b7a480]">
      <div className="relative w-64 h-64 mb-8">
        <Image
          src="/uploads/rpg-pixel.gif"
          alt="Krausz Mester dolgozik..."
          fill
          unoptimized
          className="object-contain"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="text-center"
      >
        <h2 className="text-white font-heading font-black text-2xl uppercase tracking-[0.3em] mb-2">
          MESTERMUNKA <span className="text-[#FF5500]">FOLYAMATBAN</span>
        </h2>
        <div className="w-12 h-1 bg-[#FF5500] mx-auto mt-4" />
      </motion.div>

      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5500]/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}
