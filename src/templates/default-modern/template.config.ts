import { defineTemplate, type TemplateModule } from "@/templates/types"
import { defaultModernTheme } from "./theme"
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

export const defaultModern: TemplateModule = defineTemplate({
  manifest: {
    id: "default-modern",
    name: "Default Modern",
    version: "1.0.0",
    author: "Webshop Engine",
    description:
      "Polished dark-mode storefront with the visual block-based homepage editor. The starting point for every shop.",
    screenshots: ["/template-previews/default-modern.svg"],
    capabilities: {
      hasBlog: false,
      staticPages: ["about"],
      restyles: ["home", "shop", "pdp"],
    },
  },
  defaultTheme: defaultModernTheme,
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
