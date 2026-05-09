"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import type { HomeContent } from "../schema"

type Props = { content: HomeContent["hero"] }

export function HeroBlock({ content }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <DecoBlobs />
      <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-[1.3fr,1fr] md:items-center md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {content.eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {content.eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-5xl font-black leading-[0.95] tracking-tight text-foreground md:text-7xl">
            {content.headline}{" "}
            {content.headlineAccent ? (
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {content.headlineAccent}
              </span>
            ) : null}
          </h1>
          {content.body ? (
            <p className="max-w-xl text-lg leading-relaxed text-mutedForeground">
              {content.body}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {content.primaryCtaLabel ? (
              <Link
                href={content.primaryCtaHref}
                className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-secondary"
              >
                {content.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            {content.secondaryCtaLabel ? (
              <Link
                href={content.secondaryCtaHref}
                className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-8 py-4 text-sm font-bold uppercase tracking-wider text-foreground transition hover:bg-muted"
              >
                {content.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
          {content.badges.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4">
              {content.badges.map((badge, idx) => (
                <span
                  key={`${badge}-${idx}`}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-mutedForeground"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-muted ring-1 ring-border md:max-w-md md:justify-self-end"
        >
          {content.image ? (
            <FallbackImage
              src={content.image}
              alt={content.headline}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-mutedForeground">
              No image
            </div>
          )}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-6 left-6 right-6 rounded-2xl bg-surface/95 p-4 shadow-lg ring-1 ring-border backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  Restocked
                </p>
                <p className="mt-1 font-serif text-lg font-bold text-foreground">
                  Today
                </p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                Live
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function DecoBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
    </div>
  )
}
