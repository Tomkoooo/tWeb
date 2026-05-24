import { timeAsync } from "@/lib/dev-timing"
import { getActiveChrome } from "@/lib/active-chrome"
import {
  getHomepageRenderDependencies,
  type HomepageFeaturedResolveOptions,
} from "@/features/homepage-cms/render/homepage-deps"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import { PageContentService } from "@/services/page-content"
import {
  resolveStorefrontFooterContact,
  type FooterCategoryItem,
} from "@/lib/storefront-footer-data"
import type { HomepageDepsInternal } from "@/features/homepage-cms/render/homepage-deps"
import type { ActiveChrome } from "@/lib/active-chrome"
import type { TemplateModule } from "@/templates/types"

export type HomepagePageData = {
  chrome: ActiveChrome
  content: HomepageSnapshot
  dependencies: Omit<HomepageDepsInternal, "shopContentSnapshot" | "categoryTreeSnapshot"> & {
    templateId: string
  }
  footerData: {
    categories: FooterCategoryItem[]
    email: string
    contactEmails: import("@/lib/contact-emails").ContactEmailEntry[]
    phone: string
    address: string
  }
}

export async function getHomepagePageData(): Promise<HomepagePageData> {
  const chrome = await timeAsync("homepage.getActiveChrome", () => getActiveChrome())
  const { template, branding } = chrome
  const homePageDef = template.pages.home

  const content = await timeAsync("homepage.pageContent", () =>
    PageContentService.get<HomepageSnapshot>(template.manifest.id, "page:home").catch(
      () => homePageDef.defaultContent as HomepageSnapshot
    )
  )

  const productGridBlock = content.blocks.find(
    (b) => b.type === "productGrid" && b.enabled !== false
  )
  const productGridData =
    productGridBlock?.type === "productGrid" ? productGridBlock.data : undefined

  const featuredOptions: HomepageFeaturedResolveOptions = {
    cmsSelectedProductIds: productGridData?.selectedProductIds,
    maxItems: productGridData?.maxItems,
  }

  const deps = await timeAsync("homepage.renderDependencies", () =>
    getHomepageRenderDependencies(featuredOptions)
  )

  const footerData = await timeAsync("homepage.footerContact", () =>
    resolveStorefrontFooterContact(template, {
      homepageContent: content,
      shopContentSnapshot: deps.shopContentSnapshot,
      categoryTreeSnapshot: deps.categoryTreeSnapshot,
    })
  )

  const { shopContentSnapshot: _s, categoryTreeSnapshot: _c, ...publicDeps } = deps
  return {
    chrome,
    content,
    dependencies: { ...publicDeps, templateId: template.manifest.id },
    footerData,
  }
}
