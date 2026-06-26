import {
  DEFAULT_TEMPLATE_SURFACES,
  defineTemplate,
  type TemplateModule,
} from "@/templates/types"
import dynamic from "next/dynamic"
import { STATIC_PAGE_SLUGS } from "./lib/constants"
import { keramiaDentalTheme } from "./theme"
import { Navbar } from "./chrome/Navbar"
import { Footer } from "./chrome/Footer"

import { homeSchema } from "./pages/home/schema"
import { homeDefaultContent } from "./pages/home/defaultContent"
import { HomeRender } from "./pages/home/Render"

import { shopSchema } from "./pages/shop/schema"
import { shopDefaultContent } from "./pages/shop/defaultContent"
import { ShopRender } from "./pages/shop/Render"

import { pdpSchema } from "./pages/pdp/schema"
import { pdpDefaultContent } from "./pages/pdp/defaultContent"
import { PdpRender } from "./pages/pdp/Render"

import { campaignPageSchema } from "./static-pages/shared/schema"
import { KERAMIA_CAMPAIGN_DEFAULTS } from "./static-pages/shared/defaults"
import { CampaignPageRender } from "./static-pages/shared/Render"

const HomeEditorPanel = dynamic(() => import("./pages/home/EditorPanel").then((m) => m.HomeEditorPanel))
const ShopEditorPanel = dynamic(() => import("./pages/shop/EditorPanel").then((m) => m.ShopEditorPanel))
const PdpEditorPanel = dynamic(() => import("./pages/pdp/EditorPanel").then((m) => m.PdpEditorPanel))
const CampaignPageEditorPanel = dynamic(() =>
  import("./static-pages/shared/EditorPanel").then((m) => m.CampaignPageEditorPanel)
)

const staticPages = Object.fromEntries(
  STATIC_PAGE_SLUGS.map((slug) => [
    slug,
    {
      schema: campaignPageSchema,
      defaultContent: KERAMIA_CAMPAIGN_DEFAULTS[slug],
      Render: CampaignPageRender,
      EditorPanel: CampaignPageEditorPanel,
    },
  ])
)

export const keramiaDental: TemplateModule = defineTemplate({
  manifest: {
    id: "keramia-dental",
    name: "Kerámia Dental",
    version: "1.0.0",
    author: "Webshop Engine",
    description:
      "Fogászati nyári akciók — három kampány landing oldal (fogfehérítés, implant, new patient) kapcsolatfelvételi űrlappal.",
    screenshots: ["/template-previews/keramia-dental.svg"],
    capabilities: {
      hasBlog: false,
      staticPages: [...STATIC_PAGE_SLUGS],
      staticPageLabels: {
        fogfeherites: "Fogfehérítés akció",
        implant: "Implantáció akció",
        newpatient: "New Patient Special",
      },
      restyles: ["home"],
    },
    surfaces: DEFAULT_TEMPLATE_SURFACES,
    deployment: "landing",
  },
  defaultTheme: keramiaDentalTheme,
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
      allowedBlocks: ["hero", "about", "features", "contact", "cta", "richText"],
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
  staticPages,
})
