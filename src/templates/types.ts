import type { ComponentType, ReactNode } from "react"
import type { ZodType } from "zod"
import type { ThemeTokens } from "@/services/theme"
import type { FooterSettings } from "@/services/footer-settings"

export type RestyledPage = "home" | "shop" | "pdp"

export type ChromeProps = {
  brandName: string
  logoSrc: string
  children?: ReactNode
}

export type EditorProps<TContent = unknown> = {
  content: TContent
  templateId: string
  pageKey: string
  onSave?: (next: TContent) => Promise<void> | void
}

export type HomePageDeps = {
  reviews: Array<{
    id: string
    name: string
    role: string
    content: string
    rating: number
    avatar: string
  }>
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    image: string
    category: string
    rating: number
    hasVariants: boolean
    requireVariantSelection: boolean
  }>
  categories: Array<{
    id: string
    name: string
    description: string
    image: string
    slug: string
  }>
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
}

export type ShopPageDeps = {
  products: unknown[]
  categories: unknown[]
  total: number
  pages: number
  currentPage: number
  query: {
    q?: string
    category?: string
    discounted?: boolean
    sort?: string
    page?: number
  }
}

export type PdpPageDeps = {
  product: unknown
  selectedVariantId?: string
}

export type StaticPageDeps = {
  branding: { brandName: string; logoNav: string; logoFooter: string }
}

export type AnyPageDeps =
  | HomePageDeps
  | ShopPageDeps
  | PdpPageDeps
  | StaticPageDeps

export type RenderProps<TContent, TDeps extends AnyPageDeps = AnyPageDeps> = {
  content: TContent
  deps: TDeps
}

export interface PageDefinition<TContent, TDeps extends AnyPageDeps = AnyPageDeps> {
  schema: ZodType<TContent>
  defaultContent: TContent
  Render: ComponentType<RenderProps<TContent, TDeps>>
  EditorPanel: ComponentType<EditorProps<TContent>>
  allowedBlocks?: string[]
}

export type StaticPageFieldKind = "text" | "richText" | "image" | "list"

export type TemplateCapabilities = {
  hasBlog: boolean
  staticPages: string[]
  restyles: RestyledPage[]
}

export interface TemplateManifest {
  id: string
  name: string
  version: string
  author: string
  description: string
  screenshots: string[]
  capabilities: TemplateCapabilities
}

export interface TemplateModule {
  manifest: TemplateManifest
  defaultTheme: ThemeTokens
  chrome: {
    Navbar: ComponentType<ChromeProps>
    Footer: ComponentType<ChromeProps & {
      email?: string
      phone?: string
      address?: string
      categories?: Array<{ id: string; name: string; slug: string; depth: number }>
      footerSettings?: FooterSettings
    }>
  }
  // PageDefinition is intentionally typed with `any` at the engine boundary:
  // each template specializes its own content type while the engine resolves
  // them generically. Inside a template the strong types still flow.
  pages: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    home: PageDefinition<any, HomePageDeps>
    shop: PageDefinition<any, ShopPageDeps>
    pdp: PageDefinition<any, PdpPageDeps>
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staticPages: Record<string, PageDefinition<any, StaticPageDeps>>
  editorPanels?: Record<string, ComponentType<EditorProps>>
}

export const RESERVED_STATIC_PAGE_SLUGS = new Set<string>([
  "shop",
  "products",
  "cart",
  "checkout",
  "admin",
  "api",
  "auth",
  "profile",
  "maintenance",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "uploads",
])

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/

export function assertValidStaticPageSlug(slug: string): void {
  if (!slug) throw new Error("Template static-page slug must be non-empty")
  if (slug.startsWith("/")) throw new Error(`Template slug must not start with /: ${slug}`)
  if (slug.includes("..")) throw new Error(`Template slug must not contain '..': ${slug}`)
  if (RESERVED_STATIC_PAGE_SLUGS.has(slug.split("/")[0])) {
    throw new Error(
      `Template slug '${slug}' is reserved by the engine and cannot be used as a static page.`
    )
  }
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `Template slug '${slug}' must contain only lowercase letters, digits, hyphens, and forward slashes.`
    )
  }
}

export function defineTemplate(template: TemplateModule): TemplateModule {
  if (!template.manifest.id) throw new Error("TemplateModule.manifest.id required")
  for (const slug of template.manifest.capabilities.staticPages) {
    assertValidStaticPageSlug(slug)
    if (!template.staticPages[slug]) {
      throw new Error(
        `Template '${template.manifest.id}' declares static page '${slug}' in manifest but does not define it under staticPages.`
      )
    }
  }
  for (const slug of Object.keys(template.staticPages)) {
    assertValidStaticPageSlug(slug)
  }
  return template
}
