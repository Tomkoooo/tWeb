"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Truck, ShieldCheck, Headphones, Wrench, Zap, Award } from "lucide-react"

const features = [
  {
    icon: <Zap className="w-10 h-10" />,
    title: "Maximális Teljesítmény",
    description: "Nagy teljesítményű és nehéz feladatokra tervezett ipari eszközök."
  },
  {
    icon: <ShieldCheck className="w-10 h-10" />,
    title: "Vaskezű Garancia",
    description: "Élettartam garanciát vállalunk minden mester-szériás szerszámunkra."
  },
  {
    icon: <Truck className="w-10 h-10" />,
    title: "Villámgyors Szállítás",
    description: "Szerszámaid 24 órán belül útnak indulnak a budapesti központunkból."
  },
  {
    icon: <Headphones className="w-10 h-10" />,
    title: "Mester Szaktanács",
    description: "Beszélj profi szakembereinkkel, ha nem tudod melyik szerszám a legjobb neked."
  },
  {
    icon: <Wrench className="w-10 h-10" />,
    title: "Mérnöki Precizitás",
    description: "Minden darab tizedmilliméter pontosan illeszkedik a feladathoz."
  },
  {
    icon: <Award className="w-10 h-10" />,
    title: "Ipari Minősítés",
    description: "Szigorú teszteknek vetjük alá minden termékünket, hogy bírhassák a gyűrődést."
  }
]

export function Features() {
  return (
    <section className="py-32 bg-black relative overflow-hidden border-t border-white/5">
      {/* Accent blurs */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF5500]/5 blur-[150px] rounded-full -mr-64 -mb-64 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-heading font-black mb-6 text-white uppercase tracking-tighter"
          >
            A KRAUSZ <span className="text-[#FF5500]">ELŐNY</span>
          </motion.h2>
          <div className="w-24 h-2 bg-[#FF5500] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="glass-card p-10 group hover:border-[#FF5500]/40 transition-all duration-500"
            >
              <div className="text-[#FF5500] mb-8 group-hover:scale-110 transition-transform duration-500 origin-left">
                {feature.icon}
              </div>
              <h3 className="text-white text-2xl font-heading font-black mb-4 tracking-tight uppercase group-hover:text-[#FF5500] transition-colors">
                {feature.title}
              </h3>
              <p className="text-neutral-400 leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
