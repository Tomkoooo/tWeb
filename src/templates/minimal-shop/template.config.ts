import { defineTemplate, type TemplateModule } from "@/templates/types"
import { minimalShopTheme } from "./theme"
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

export const minimalShop: TemplateModule = defineTemplate({
  manifest: {
    id: "minimal-shop",
    name: "Minimal Shop",
    version: "1.0.0",
    author: "Webshop Engine",
    description:
      "Light editorial theme with serif typography, generous whitespace, and a curated-feel product grid. Suitable for boutiques and considered catalogs.",
    screenshots: ["/template-previews/minimal-shop.svg"],
    capabilities: {
      hasBlog: false,
      staticPages: [],
      restyles: ["home", "shop", "pdp"],
    },
  },
  defaultTheme: minimalShopTheme,
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
  staticPages: {},
})
