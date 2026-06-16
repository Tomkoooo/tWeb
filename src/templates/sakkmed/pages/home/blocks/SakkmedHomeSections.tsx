"use client"

import Link from "next/link"
import { FallbackImage } from "@/components/common/FallbackImage"
import { ContactInquiryForm } from "@/components/site-contact/ContactInquiryForm"
import { SiteContactEmailsList } from "@/components/site-contact/SiteContactEmailsList"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import { mediaImageSrc } from "@/lib/images"
import { PROJECT_LINKS, SERVICE_LINKS } from "../../../lib/constants"

/** Full-bleed homepage hero background (concert / event photo). */
const HERO_BACKGROUND = "/sakkmed/gallery.jpg"

type Props = {
  snapshot: HomepageSnapshot
  siteContact: { emails: Array<{ id: string; label: string; email: string }> }
}

function block<T extends { type: string }>(snapshot: HomepageSnapshot, type: T["type"], id?: string) {
  return snapshot.blocks.find(
    (b) => b.type === type && b.enabled !== false && (!id || b.id === id)
  )
}

export function SakkmedHomeSections({ snapshot, siteContact }: Props) {
  const cms = useCmsEdit()
  const hero = block(snapshot, "hero", "hero-sakkmed")
  const services = block(snapshot, "features", "services-sakkmed")
  const about = block(snapshot, "about", "about-sakkmed")
  const projects = block(snapshot, "gallery", "projects-sakkmed")
  const clients = block(snapshot, "gallery", "clients-sakkmed")
  const gallery = block(snapshot, "gallery", "gallery-sakkmed")
  const contact = block(snapshot, "contact", "contact-sakkmed")

  const heroData = hero?.type === "hero" ? hero.data : null
  const servicesData = services?.type === "features" ? services.data : null
  const aboutData = about?.type === "about" ? about.data : null
  const projectsData = projects?.type === "gallery" ? projects.data : null
  const clientsData = clients?.type === "gallery" ? clients.data : null
  const galleryData = gallery?.type === "gallery" ? gallery.data : null
  const contactData = contact?.type === "contact" ? contact.data : null

  return (
    <>
      <section className="relative -mt-[57px] min-h-[calc(100svh-0px)] overflow-hidden border-b border-border/60 pt-[57px]">
        <FallbackImage
          src={HERO_BACKGROUND}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-background" aria-hidden />
        <div className="absolute inset-0 bg-black/35" aria-hidden />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-57px)] max-w-6xl flex-col justify-center px-4 py-16 md:py-24">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              {heroData?.badges?.[0] || "SAKKMED 2005 Kft."}
            </p>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold uppercase leading-none tracking-tight text-white drop-shadow-md md:text-6xl">
                <EditableTextInline blockType="hero" blockId="hero-sakkmed" field="title" value={heroData?.title || "A SIKERES"} />
              </h1>
              <p className="text-3xl font-light uppercase tracking-[0.2em] text-white/85 drop-shadow-md md:text-5xl whitespace-pre-line">
                <EditableTextInline
                  blockType="hero"
                  blockId="hero-sakkmed"
                  field="description"
                  value={heroData?.description || "RENDEZVÉNY\nKIVITELEZŐJE"}
                  multiline
                />
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={heroData?.primaryCtaHref || "#contact"}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
              >
                {heroData?.primaryCtaLabel || "Kapcsolat"}
              </Link>
              <Link
                href={heroData?.secondaryCtaHref || "#services"}
                className="rounded-full border border-white/30 bg-black/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/45"
              >
                {heroData?.secondaryCtaLabel || "Szolgáltatások"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold">
              <EditableTextInline blockType="features" blockId="services-sakkmed" field="title" value={servicesData?.title || "Szolgáltatásaink"} />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <EditableTextInline blockType="features" blockId="services-sakkmed" field="subtitle" value={servicesData?.subtitle || ""} multiline />
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(servicesData?.cards || []).map((card, idx) => (
              <article key={idx} className="rounded-xl border border-border/60 bg-surface/30 p-5">
                <h3 className="text-lg font-semibold text-primary">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {card.description.replace(/\s*\|\s*/g, "\n")}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {SERVICE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-wide hover:border-primary hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-border/60 bg-muted/20 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-3xl font-bold">
            <EditableTextInline blockType="about" blockId="about-sakkmed" field="title" value={aboutData?.title || "Rólunk"} />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {(aboutData?.cards || []).map((card, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-background p-6 text-center">
                <p className="text-4xl font-bold text-primary">{card.title}</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(aboutData?.accordions || []).map((item, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-background/60 p-5">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {item.content.replace(/\s*\|\s*/g, "\n")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-3xl font-bold">
            <EditableTextInline blockType="gallery" blockId="projects-sakkmed" field="title" value={projectsData?.title || "Projektjeink"} />
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(projectsData?.items || []).map((item, idx) => {
              const href = PROJECT_LINKS[idx]?.href || "#"
              return (
                <Link key={idx} href={href} className="group overflow-hidden rounded-xl border border-border/60">
                  <div className="relative aspect-[16/10]">
                    <FallbackImage src={mediaImageSrc(item.image)} alt={item.caption || ""} fill className="object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="bg-surface/40 px-4 py-3 font-semibold">{item.caption}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section id="clients" className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-[0.2em]">
            <EditableTextInline blockType="gallery" blockId="clients-sakkmed" field="title" value={clientsData?.title || "Ügyfeleink"} />
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {(clientsData?.items || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-center rounded-lg border border-border/40 bg-background/40 p-4">
                <FallbackImage src={mediaImageSrc(item.image)} alt={item.caption || "Partner"} width={160} height={80} className="h-12 w-auto object-contain opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="border-b border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-3xl font-bold">
            <EditableTextInline blockType="gallery" blockId="gallery-sakkmed" field="title" value={galleryData?.title || "Galéria"} />
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(galleryData?.items || []).map((item, idx) => (
              <figure key={idx} className="overflow-hidden rounded-xl border border-border/60">
                <div className="relative aspect-[4/3]">
                  <FallbackImage src={mediaImageSrc(item.image)} alt={item.caption || ""} fill className="object-cover" />
                </div>
                {(item.caption || cms.enabled) && (
                  <figcaption className="px-3 py-2 text-sm text-muted-foreground">{item.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-3xl font-bold">
            <EditableTextInline blockType="contact" blockId="contact-sakkmed" field="title" value={contactData?.title || "Kapcsolat"} />
          </h2>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6 rounded-xl border border-border/60 bg-surface/30 p-6 text-sm">
              <div>
                <h3 className="font-semibold text-primary">Raktár, árukiadás</h3>
                <p className="mt-2">1194 Budapest, Vásár tér 1.</p>
                <p className="text-muted-foreground">Nyitvatartás: Hétfő – Péntek 7:15 – 15:15</p>
                <p className="mt-2">Bencs János | Logisztikai vezető — bencs.janos@esemenyszervezes.hu</p>
                <p>Tömöri Gyula | Technikai vezető — tomori.gyula@esemenyszervezes.hu</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Központi iroda</h3>
                <p className="mt-2">
                  <EditableTextInline blockType="contact" blockId="contact-sakkmed" field="companyName" value={contactData?.companyName || "SAKKMED 2005 Kft."} />
                </p>
                <p>
                  <EditableTextInline blockType="contact" blockId="contact-sakkmed" field="address" value={contactData?.address || "1095 Budapest, Soroksári út 48."} />
                </p>
                <p className="text-muted-foreground">Adószám: 13543011-2-43</p>
                <p className="mt-2">Balázs Gábor | ügyvezető — balazs.gabor@esemenyszervezes.hu</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">BTL Ügynökség Kft.</h3>
                <p>1095 Budapest, Soroksári út 48. · Adószám: 23729825-2-43</p>
                <p>Kovács Henriette | ügyvezető — kovacs.henriette@esemenyszervezes.hu</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary">Pénzügy</h3>
                <p>Marti Csillag | Pénzügyi vezető — marti.csillag@esemenyszervezes.hu</p>
              </div>
              <p className="text-muted-foreground">
                <EditableTextInline blockType="contact" blockId="contact-sakkmed" field="description" value={contactData?.description || ""} multiline />
              </p>
              {siteContact.emails.length > 0 ? (
                <SiteContactEmailsList emails={siteContact.emails} className="text-accent" itemClassName="underline" />
              ) : null}
            </div>
            {siteContact.emails.length > 0 ? (
              <div className="rounded-xl border border-border/60 bg-background p-6">
                <ContactInquiryForm
                  contactEmails={siteContact.emails}
                  nameLabel={contactData?.nameLabel || "Név"}
                  emailLabel={contactData?.emailLabel || "E-mail"}
                  messageLabel={contactData?.messageLabel || "Üzenet"}
                  sendButtonLabel={contactData?.sendButtonLabel || "Küldés"}
                  recipientLabel="Címzett"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Kapcsolatfelvételi űrlaphoz adj meg címzett e-mailt a CMS → Weboldal beállítások → Kapcsolat e-mailek menüben.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
