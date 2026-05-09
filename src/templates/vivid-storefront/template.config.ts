import { defineTemplate, type TemplateModule } from "@/templates/types"
import { vividStorefrontTheme } from "./theme"
import { Navbar } from "./chrome/Navbar"
import { Footer } from "./chrome/Footer"

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

import { aboutSchema } from "./static-pages/about/schema"
import { aboutDefaultContent } from "./static-pages/about/defaultContent"
import { AboutRender } from "./static-pages/about/Render"
import { AboutEditorPanel } from "./static-pages/about/EditorPanel"

export const vividStorefront: TemplateModule = defineTemplate({
  manifest: {
    id: "vivid-storefront",
    name: "Vivid Storefront",
    version: "1.0.0",
    author: "Webshop Engine",
    description:
      "A bold, warm e-commerce template with a coral primary, deep navy chrome, and an electric purple accent. Animated hero, editorial collection cards, product spotlight, pillars, testimonials, and a slow-newsletter band — built for shops with personality.",
    screenshots: ["/template-previews/vivid-storefront.svg"],
    capabilities: {
      hasBlog: false,
      staticPages: ["about"],
      restyles: ["home", "shop", "pdp"],
    },
  },
  defaultTheme: vividStorefrontTheme,
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
    about: {
      schema: aboutSchema,
      defaultContent: aboutDefaultContent,
      Render: AboutRender,
      EditorPanel: AboutEditorPanel,
    },
  },
})
