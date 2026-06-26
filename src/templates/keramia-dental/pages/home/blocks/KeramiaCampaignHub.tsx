"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react"
import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import {
  CAMPAIGN_LINKS,
  HUB_TRUST_POINTS,
  KERAMIA_ADDRESS,
  KERAMIA_HERO_HUB,
  KERAMIA_PHONE,
  KERAMIA_PHONE_HREF,
  KERAMIA_PROMO_PERIOD_HU,
  KERAMIA_PROMO_PERIOD_LONG,
} from "../../../lib/constants"

export function KeramiaCampaignHub() {
  const featured = CAMPAIGN_LINKS.find((c) => c.featured) ?? CAMPAIGN_LINKS[0]
  const others = CAMPAIGN_LINKS.filter((c) => c.slug !== featured.slug)

  return (
    <div className="keramia-sans bg-background text-foreground">
      {/* Hero — primary conversion zone */}
      <section className="keramia-hero-gradient relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="pointer-events-none absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-12 lg:px-8">
          <div className="keramia-hero-copy lg:col-span-6">
            <div className="keramia-promo-badge mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              {KERAMIA_PROMO_PERIOD_HU}
            </div>
            <h1 className="keramia-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Nyári fogászati akciók Székesfehérváron
            </h1>
            <p className="keramia-display mt-5 text-lg font-semibold tracking-wide text-primary sm:text-xl">
              Válassza ki kampányát — fogfehérítés, implantáció vagy New Patient Special.
            </p>
            <p className="keramia-hero-muted mt-5 max-w-xl text-sm leading-relaxed sm:text-base">
              Három dedikált akciós landing oldal egy helyen: részletes információ, átlátható
              kedvezmények és gyors online időpontkérés. Prémium ellátás a Kerámia Dentalnál.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#kampanyok" className="keramia-btn-primary">
                Akciók megtekintése
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={KERAMIA_PHONE_HREF} className="keramia-btn-outline">
                <Phone className="h-4 w-4" />
                {KERAMIA_PHONE}
              </a>
            </div>

            <p className="keramia-display keramia-hero-subtle mt-6 flex items-center gap-2 text-xs tracking-wide">
              <MapPin className="h-4 w-4 text-primary" />
              {KERAMIA_ADDRESS}
            </p>
          </div>

          <div className="relative lg:col-span-6">
            <div className="group relative overflow-hidden rounded-2xl border border-primary/20 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#120d0b]/50 to-transparent" />
              <FallbackImage
                src={mediaImageSrc(KERAMIA_HERO_HUB)}
                alt="Kerámia Dental — ragyogó mosoly"
                width={1200}
                height={800}
                className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-[460px]"
              />
            </div>
            <div className="keramia-hero-surface absolute -bottom-5 -left-5 z-20 flex items-center gap-3 rounded-xl border border-primary/20 px-5 py-4 shadow-2xl">
              <span className="keramia-hero-promo-value text-3xl font-bold leading-none">3</span>
              <span className="keramia-hero-promo-label text-[10px] uppercase leading-tight tracking-widest">
                nyári
                <br />
                kampány
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar — overlaps hero */}
      <section className="keramia-trust-bar mx-auto max-w-7xl px-4 lg:px-8">
        <div className="keramia-card grid grid-cols-1 gap-8 divide-y divide-primary/10 p-6 md:grid-cols-4 md:divide-x md:divide-y-0 md:p-10">
          {HUB_TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex gap-4 md:pl-6 md:first:pl-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="keramia-display text-base font-semibold tracking-wide text-foreground">
                  {point.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campaign routing — core marketing grid */}
      <section id="kampanyok" className="keramia-section-cream scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="keramia-eyebrow">VÁLASSZON KAMPÁNYT</p>
            <h2 className="keramia-serif mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Melyik akció érdekli?
            </h2>
            <div className="keramia-gold-rule mx-auto my-6" />
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Minden kampány saját landing oldalon fut részletes tartalommal, GYIK-kel és
              időpontkérő űrlappal. Az akció {KERAMIA_PROMO_PERIOD_LONG} között érvényes.
            </p>
          </div>

          {/* Featured campaign */}
          <Link
            href={featured.href}
            className="group mb-8 grid overflow-hidden rounded-2xl border border-primary/20 bg-secondary text-secondary-foreground shadow-xl transition hover:border-primary/40 lg:grid-cols-12"
          >
            <div className="relative h-56 overflow-hidden lg:col-span-5 lg:h-auto">
              <FallbackImage
                src={mediaImageSrc(featured.image)}
                alt={featured.labelHu}
                width={800}
                height={600}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="keramia-display absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Kiemelt akció
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 lg:col-span-7 lg:p-12">
              <p className="keramia-eyebrow text-primary">{featured.promoBadge}</p>
              <h3 className="keramia-serif mt-2 text-3xl font-bold group-hover:text-primary md:text-4xl">
                {featured.labelHu}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-secondary-foreground/80 sm:text-base">
                {featured.descriptionHu}
              </p>
              <span className="keramia-display mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Kampány megnyitása
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Secondary campaigns */}
          <div className="grid gap-6 md:grid-cols-2">
            {others.map((campaign) => (
              <Link
                key={campaign.slug}
                href={campaign.href}
                className="group flex flex-col overflow-hidden rounded-xl border border-primary/15 bg-surface transition hover:border-primary/35 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden">
                  <FallbackImage
                    src={mediaImageSrc(campaign.image)}
                    alt={campaign.labelHu}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="keramia-display absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {campaign.promoBadge}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="keramia-display text-[10px] font-semibold uppercase tracking-widest text-accent">
                    {campaign.promoDetail}
                  </p>
                  <h3 className="keramia-serif mt-2 text-xl font-bold text-foreground group-hover:text-accent">
                    {campaign.labelHu}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {campaign.descriptionHu}
                  </p>
                  <span className="keramia-display mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                    Részletek
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Decision helper CTA */}
      <section className="keramia-section-beige border-y border-primary/10 py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="keramia-cta-band relative overflow-hidden p-8 text-center md:p-14">
            <div className="pointer-events-none absolute inset-0 bg-primary/5" />
            <Sparkles className="relative mx-auto mb-5 h-10 w-10 text-primary" />
            <h2 className="keramia-serif relative text-2xl font-bold sm:text-3xl md:text-4xl">
              Nem biztos, melyik akció a megfelelő?
            </h2>
            <p className="keramia-hero-muted relative mx-auto mt-4 max-w-xl text-sm sm:text-base">
              Hívjon minket bizalommal — segítünk kiválasztani a legjobb kezelést, vagy foglaljon
              konzultációt bármelyik kampány oldalán.
            </p>
            <p className="keramia-display relative mt-3 text-xs uppercase tracking-widest text-primary/90">
              {KERAMIA_PROMO_PERIOD_LONG} · csak online jelentkezéssel
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={KERAMIA_PHONE_HREF} className="keramia-btn-primary">
                <Phone className="h-4 w-4" />
                Hívás most
              </a>
              <a href="#kampanyok" className="keramia-btn-outline border-[#fffdf9]/25 text-[#fffdf9] hover:text-primary">
                Akciók újra
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="keramia-section-cream py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
          <div className="flex gap-1 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-primary" />
            ))}
          </div>
          <p className="keramia-serif mt-4 text-lg text-foreground">
            „A mosoly az elme csillogása.”
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Prémium, fájdalommentes fogászat és esztétikai kezelések Székesfehérvár szívében.
          </p>
        </div>
      </section>
    </div>
  )
}
