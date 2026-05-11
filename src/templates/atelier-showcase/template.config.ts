import {
  DEFAULT_TEMPLATE_SURFACES,
  defineTemplate,
  type TemplateModule,
} from "@/templates/types"
import { atelierShowcaseTheme } from "./theme"
import { Navbar } from "./chrome/Navbar"
import { Footer } from "./chrome/Footer"
import { AtelierProductCard } from "./commerce/AtelierProductCard"
import { AtelierCategoryPill } from "./commerce/AtelierCategoryPill"
import { AtelierNavbarSearch } from "./commerce/AtelierNavbarSearch"
import { AtelierProductDetailSlot } from "./commerce/AtelierProductDetailSlot"

import { homeSchema } from "./pages/home/schema"
import { homeDefaultContent } from "./pages/home/defaultContent"
import { HomeRender } from "./pages/home/Render"
import { HomeEditorPanel } from "./pages/home/EditorPanel"

import { shopSchema } from "./pages/shop/schema"
import { shopDefaultContent } from "./pages/shop/defaultContent"
import { ShopRender } from "./pages/shop/Render"
import { ShopEditorPanel } from "./pages/shop/EditorPanel"

import { pdpSchema } from "./pages/pdp/schema"
import { pdpDefaultContent } from "./pages/pdp/defaultContent"
import { PdpRender } from "./pages/pdp/Render"
import { PdpEditorPanel } from "./pages/pdp/EditorPanel"

import { AtelierCartRouteMain } from "./pages/flow/AtelierCartRouteMain"
import { AtelierCheckoutRouteMain } from "./pages/flow/AtelierCheckoutRouteMain"
import { AtelierProfileRouteMain } from "./pages/flow/AtelierProfileRouteMain"
import { AtelierProfileRouteChrome } from "./pages/flow/AtelierProfileRouteChrome"

import { editorialSchema } from "./static-pages/editorial/schema"
import { editorialDefaultContent } from "./static-pages/editorial/defaultContent"
import { EditorialRender } from "./static-pages/editorial/Render"
import { EditorialEditorPanel } from "./static-pages/editorial/EditorPanel"

import { journalSchema } from "./static-pages/journal/schema"
import { journalDefaultContent } from "./static-pages/journal/defaultContent"
import { JournalRender } from "./static-pages/journal/Render"
import { JournalEditorPanel } from "./static-pages/journal/EditorPanel"

export const atelierShowcase: TemplateModule = defineTemplate({
  manifest: {
    id: "atelier-showcase",
    name: "Atelier Showcase",
    version: "1.0.0",
    author: "Webshop Engine",
    description:
      "Showcase: homepage blocks, full-bleed cart/checkout/profile via flowPageCompose routeOnly, custom shop/PDP commerce slots, CMS editorial + journal.",
    screenshots: ["/template-previews/atelier-showcase.svg"],
    capabilities: {
      hasBlog: false,
      staticPages: ["editorial", "journal"],
      restyles: ["home", "shop", "pdp"],
    },
    surfaces: DEFAULT_TEMPLATE_SURFACES,
    deployment: "commerce",
  },
  defaultTheme: atelierShowcaseTheme,
  commerceSlots: {
    ProductCard: AtelierProductCard,
    CategoryPill: AtelierCategoryPill,
    NavbarSearch: AtelierNavbarSearch,
    ProductDetail: AtelierProductDetailSlot,
  },
  chrome: {
    Navbar,
    Footer,
  },
  pages: {
    home: {
      schema: homeSchema,
      defaultContent: homeDefaultContent,
      Render: HomeRender,
      EditorPanel: HomeEditorPanel,
      cmsPageKind: "homepage-blocks",
      allowedBlocks: [
        "hero",
        "divider",
        "richText",
        "gallery",
        "about",
        "features",
        "productGrid",
        "testimonials",
        "cta",
        "contact",
      ],
    },
    shop: {
      schema: shopSchema,
      defaultContent: shopDefaultContent,
      Render: ShopRender,
      EditorPanel: ShopEditorPanel,
    },
    pdp: {
      schema: pdpSchema,
      defaultContent: pdpDefaultContent,
      Render: PdpRender,
      EditorPanel: PdpEditorPanel,
    },
  },
  staticPages: {
    editorial: {
      schema: editorialSchema,
      defaultContent: editorialDefaultContent,
      Render: EditorialRender,
      EditorPanel: EditorialEditorPanel,
    },
    journal: {
      schema: journalSchema,
      defaultContent: journalDefaultContent,
      Render: JournalRender,
      EditorPanel: JournalEditorPanel,
    },
  },
  flowPages: {
    cart: {
      flowPageCompose: "routeOnly",
      RouteMain: AtelierCartRouteMain,
    },
    checkout: {
      flowPageCompose: "routeOnly",
      RouteMain: AtelierCheckoutRouteMain,
    },
    profile: {
      flowPageCompose: "routeOnly",
      RouteMain: AtelierProfileRouteMain,
      RouteChrome: AtelierProfileRouteChrome,
    },
  },
})
