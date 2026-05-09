import { describe, expect, it } from "vitest"
import { TEMPLATE_REGISTRY, FALLBACK_TEMPLATE_ID } from "@/templates/registry"
import { RESERVED_STATIC_PAGE_SLUGS, assertValidStaticPageSlug } from "@/templates/types"

describe("Template registry contract", () => {
  it("registers at least one template", () => {
    expect(Object.keys(TEMPLATE_REGISTRY).length).toBeGreaterThan(0)
  })

  it("includes the fallback template id", () => {
    expect(TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID]).toBeDefined()
  })

  for (const [id, template] of Object.entries(TEMPLATE_REGISTRY)) {
    describe(`template '${id}'`, () => {
      it("manifest id matches registry key", () => {
        expect(template.manifest.id).toBe(id)
      })

      it("has a non-empty name and version", () => {
        expect(template.manifest.name.trim()).not.toBe("")
        expect(template.manifest.version).toMatch(/^\d+\.\d+\.\d+/)
      })

      it("declares all three restyled pages", () => {
        expect(template.pages.home).toBeDefined()
        expect(template.pages.shop).toBeDefined()
        expect(template.pages.pdp).toBeDefined()
      })

      it("home defaultContent passes home schema", () => {
        const result = template.pages.home.schema.safeParse(
          template.pages.home.defaultContent
        )
        expect(result.success).toBe(true)
      })

      it("shop defaultContent passes shop schema", () => {
        const result = template.pages.shop.schema.safeParse(
          template.pages.shop.defaultContent
        )
        expect(result.success).toBe(true)
      })

      it("pdp defaultContent passes pdp schema", () => {
        const result = template.pages.pdp.schema.safeParse(
          template.pages.pdp.defaultContent
        )
        expect(result.success).toBe(true)
      })

      it("manifest staticPages and staticPages map agree", () => {
        const declared = new Set(template.manifest.capabilities.staticPages)
        const defined = new Set(Object.keys(template.staticPages))
        for (const slug of declared) {
          expect(defined.has(slug)).toBe(true)
        }
        for (const slug of defined) {
          expect(declared.has(slug)).toBe(true)
        }
      })

      for (const [slug, def] of Object.entries(template.staticPages)) {
        it(`static page '${slug}' uses a safe slug`, () => {
          expect(() => assertValidStaticPageSlug(slug)).not.toThrow()
          expect(RESERVED_STATIC_PAGE_SLUGS.has(slug)).toBe(false)
        })
        it(`static page '${slug}' defaultContent passes its schema`, () => {
          const result = def.schema.safeParse(def.defaultContent)
          expect(result.success).toBe(true)
        })
      }

      it("provides chrome with Navbar and Footer components", () => {
        expect(typeof template.chrome.Navbar).toBe("function")
        expect(typeof template.chrome.Footer).toBe("function")
      })

      it("provides defaultTheme with the required tokens", () => {
        const required = [
          "primary",
          "primaryForeground",
          "secondary",
          "background",
          "foreground",
          "border",
          "muted",
        ] as const
        for (const key of required) {
          expect(typeof template.defaultTheme[key]).toBe("string")
        }
      })
    })
  }
})

describe("Static page slug validator", () => {
  it("accepts simple slugs", () => {
    expect(() => assertValidStaticPageSlug("about")).not.toThrow()
    expect(() => assertValidStaticPageSlug("our-story")).not.toThrow()
    expect(() => assertValidStaticPageSlug("legal/terms")).not.toThrow()
  })

  it("rejects reserved slugs", () => {
    for (const slug of RESERVED_STATIC_PAGE_SLUGS) {
      expect(() => assertValidStaticPageSlug(slug)).toThrow()
    }
  })

  it("rejects slugs starting with /", () => {
    expect(() => assertValidStaticPageSlug("/about")).toThrow()
  })

  it("rejects slugs containing ..", () => {
    expect(() => assertValidStaticPageSlug("../etc/passwd")).toThrow()
  })

  it("rejects uppercase characters", () => {
    expect(() => assertValidStaticPageSlug("About")).toThrow()
  })

  it("rejects empty string", () => {
    expect(() => assertValidStaticPageSlug("")).toThrow()
  })
})
