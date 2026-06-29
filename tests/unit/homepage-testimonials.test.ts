import { describe, expect, it } from "vitest"
import { linkifyPlainText } from "@/lib/linkify-plain-text"
import {
  insertionIndexForHomepageBlockType,
  resolveAllowedHomepageBlockTypes,
} from "@/features/homepage-cms/utils/homepage-block-allowlist"
import { defaultModern } from "@/templates/default-modern/template.config"

describe("linkifyPlainText", () => {
  it("wraps https URLs in external links", () => {
    const nodes = linkifyPlainText("See https://example.com/page for details")
    expect(nodes).toHaveLength(3)
    expect(nodes[1]).toMatchObject({
      type: "a",
      props: {
        href: "https://example.com/page",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    })
  })

  it("normalizes www URLs", () => {
    const nodes = linkifyPlainText("Visit www.example.com today")
    expect(nodes[1]).toMatchObject({
      type: "a",
      props: {
        href: "https://www.example.com",
      },
    })
  })

  it("returns plain text when no URLs are present", () => {
    expect(linkifyPlainText("No links here")).toEqual(["No links here"])
  })
})

describe("default-modern homepage testimonials", () => {
  it("allows testimonials after about in section order", () => {
    const allowed = resolveAllowedHomepageBlockTypes(defaultModern.pages.home)
    expect(allowed).toEqual([
      "hero",
      "about",
      "testimonials",
      "gallery",
      "features",
      "productGrid",
      "contact",
    ])
  })

  it("inserts testimonials directly after about", () => {
    const blocks = [
      { id: "hero-1", type: "hero" as const, enabled: true, data: {} },
      { id: "about-1", type: "about" as const, enabled: true, data: {} },
      { id: "gallery-1", type: "gallery" as const, enabled: true, data: {} },
    ]
    const allowed = resolveAllowedHomepageBlockTypes(defaultModern.pages.home)
    const idx = insertionIndexForHomepageBlockType(blocks, "testimonials", allowed)
    expect(idx).toBe(2)
    expect(blocks[idx - 1]?.type).toBe("about")
  })
})
