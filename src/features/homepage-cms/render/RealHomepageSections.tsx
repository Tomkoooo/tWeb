"use client"

import dynamic from "next/dynamic"

const Hero = dynamic(
  () => import("@/components/sections/Hero").then((m) => ({ default: m.Hero })),
  { ssr: true }
)
import { Story } from "@/components/sections/Story"
import { Shop } from "@/components/sections/Shop"
import { Features } from "@/components/sections/Features"
import { Reviews } from "@/components/sections/Reviews"
import { Contact } from "@/components/sections/Contact"
import type { HomepageSnapshot, HomepageBlockType } from "@/features/homepage-cms/types/block-types"
import type { HomePageDeps } from "@/templates/types"
import { resolveContactDisplayField } from "@/lib/contact-display"

function getBlockData(snapshot: HomepageSnapshot, type: HomepageBlockType) {
  const block = snapshot.blocks.find((item) => item.type === type && item.enabled !== false)
  return block?.data
}

function isVisible(data: unknown, key: string) {
  const visibility = (data as { visibility?: Record<string, boolean> } | undefined)?.visibility
  if (!visibility) return true
  return visibility[key] !== false
}

export function RealHomepageSections({
  snapshot,
  dependencies,
}: {
  snapshot: HomepageSnapshot
  dependencies: HomePageDeps
}) {
  const hero = getBlockData(snapshot, "hero") as
    | {
        title?: string
        description?: string
        primaryCtaLabel?: string
        primaryCtaHref?: string
        secondaryCtaLabel?: string
        secondaryCtaHref?: string
        heroImage?: string
        heroImages?: string[]
        imageDurationSeconds?: number
        heroDurationSeconds?: number
        heroSlides?: Array<{
          title: string
          description: string
          primaryCtaLabel: string
          primaryCtaHref: string
          secondaryCtaLabel: string
          secondaryCtaHref: string
          badges: string[]
          images: string[]
          imageDurationSeconds: number
          durationSeconds: number
        }>
        badges?: string[]
      }
    | undefined
  const about = getBlockData(snapshot, "about") as
    | {
        title?: string
        paragraph?: string
        accordions?: Array<{ title: string; content: string }>
        cards?: Array<{ title: string; description: string; icon?: string }>
      }
    | undefined
  const productGrid = getBlockData(snapshot, "productGrid") as
    | {
        title?: string
        description?: string
        viewAllLabel?: string
        viewAllHref?: string
        categoriesTitle?: string
        categoriesDescription?: string
      }
    | undefined
  const features = getBlockData(snapshot, "features") as
    | {
        title?: string
        subtitle?: string
        cards?: Array<{ title: string; description: string; icon?: string }>
      }
    | undefined
  const testimonials = getBlockData(snapshot, "testimonials") as
    | {
        title?: string
        subtitle?: string
        items?: Array<{ quote: string; name: string; role: string; rating: number }>
      }
    | undefined
  const contact = getBlockData(snapshot, "contact") as
    | {
        title?: string
        description?: string
        address?: string
        phone?: string
        email?: string
        sendButtonLabel?: string
        nameLabel?: string
        emailLabel?: string
        messageLabel?: string
      }
    | undefined

  const testimonialReviews =
    testimonials?.items?.map((item, index) => ({
      id: `cms-review-${index}`,
      name: item.name,
      role: item.role,
      content: item.quote,
      rating: item.rating,
      avatar: "/generic-logo.svg",
    })) ?? []
  const featuresSection = features ? (
    <Features
      title={isVisible(features, "title") ? features.title : ""}
      subtitle={isVisible(features, "subtitle") ? features.subtitle : ""}
      cards={isVisible(features, "cards") ? features.cards : []}
      embedded={Boolean(productGrid)}
    />
  ) : null

  return (
    <>
      {hero ? (
        <Hero
          title={isVisible(hero, "title") ? hero.title : ""}
          description={isVisible(hero, "description") ? hero.description : ""}
          primaryCtaLabel={isVisible(hero, "primaryCta") ? hero.primaryCtaLabel : ""}
          primaryCtaHref={hero.primaryCtaHref}
          secondaryCtaLabel={isVisible(hero, "secondaryCta") ? hero.secondaryCtaLabel : ""}
          secondaryCtaHref={hero.secondaryCtaHref}
          heroImage={isVisible(hero, "heroImage") ? hero.heroImage : ""}
          slides={isVisible(hero, "heroSlides") ? hero.heroSlides : []}
          badges={isVisible(hero, "badges") ? hero.badges : []}
        />
      ) : null}
      {about ? (
        <Story
          title={isVisible(about, "title") ? about.title : ""}
          content={isVisible(about, "paragraph") ? about.paragraph : ""}
          accordions={isVisible(about, "accordions") ? about.accordions : []}
          cards={about.cards}
        />
      ) : null}
      {productGrid ? (
        <Shop
          templateId={dependencies.templateId}
          categories={dependencies.categories}
          products={dependencies.products}
          title={isVisible(productGrid, "title") ? productGrid.title : ""}
          description={isVisible(productGrid, "description") ? productGrid.description : ""}
          viewAllLabel={productGrid.viewAllLabel}
          viewAllHref={productGrid.viewAllHref}
          categoriesTitle={isVisible(productGrid, "categoriesTitle") ? productGrid.categoriesTitle : ""}
          categoriesDescription={isVisible(productGrid, "categoriesDescription") ? productGrid.categoriesDescription : ""}
          afterCategories={featuresSection}
        />
      ) : null}
      {!productGrid ? featuresSection : null}
      <Reviews
        reviews={testimonialReviews.length ? testimonialReviews : dependencies.reviews}
        title={isVisible(testimonials, "title") ? testimonials?.title : ""}
        subtitle={isVisible(testimonials, "subtitle") ? testimonials?.subtitle : ""}
      />
      {contact ? (
        <Contact
          contactEmails={dependencies.siteContact.emails}
          phone={
            isVisible(contact, "phone")
              ? resolveContactDisplayField(contact.phone, dependencies.company.phone)
              : ""
          }
          address={
            isVisible(contact, "address")
              ? resolveContactDisplayField(contact.address, dependencies.company.address)
              : ""
          }
          title={isVisible(contact, "title") ? contact.title : ""}
          description={isVisible(contact, "description") ? contact.description : ""}
          sendButtonLabel={contact.sendButtonLabel}
          nameLabel={contact.nameLabel}
          emailLabel={contact.emailLabel}
          messageLabel={contact.messageLabel}
        />
      ) : null}
    </>
  )
}
