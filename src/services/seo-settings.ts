import dbConnect from "@/lib/db"
import SeoSetting from "@/models/SeoSetting"

export type SeoSettings = {
  siteTitle: string
  siteDescription: string
  favicon: string
  ogImage: string
  twitterImage: string
  defaultLocale: string
  robotsIndex: boolean
  robotsFollow: boolean
  canonicalBaseUrl: string
}

const DEFAULTS: SeoSettings = {
  siteTitle: "Generic Webshop",
  siteDescription: "Lorem ipsum dolor sit amet.",
  favicon: "/generic-favicon.svg",
  ogImage: "/generic-hero.svg",
  twitterImage: "/generic-hero.svg",
  defaultLocale: "en_US",
  robotsIndex: true,
  robotsFollow: true,
  canonicalBaseUrl: "",
}

export class SeoSettingsService {
  static async get() {
    await dbConnect()
    let doc = await SeoSetting.findOne({ key: "seo" }).sort({ updatedAt: -1, _id: -1 }).lean()
    if (!doc) {
      await SeoSetting.create({
        key: "seo",
        siteTitle: DEFAULTS.siteTitle,
        siteDescription: DEFAULTS.siteDescription,
        favicon: DEFAULTS.favicon,
        ogImage: DEFAULTS.ogImage,
        twitterImage: DEFAULTS.twitterImage,
        defaultLocale: DEFAULTS.defaultLocale,
        robotsIndex: DEFAULTS.robotsIndex,
        robotsFollow: DEFAULTS.robotsFollow,
        canonicalBaseUrl: DEFAULTS.canonicalBaseUrl,
      })
      doc = await SeoSetting.findOne({ key: "seo" }).sort({ updatedAt: -1, _id: -1 }).lean()
    }
    return {
      siteTitle: doc?.siteTitle || DEFAULTS.siteTitle,
      siteDescription: doc?.siteDescription || DEFAULTS.siteDescription,
      favicon: doc?.favicon || DEFAULTS.favicon,
      ogImage: doc?.ogImage || DEFAULTS.ogImage,
      twitterImage: doc?.twitterImage || DEFAULTS.twitterImage,
      defaultLocale: doc?.defaultLocale || DEFAULTS.defaultLocale,
      robotsIndex: doc?.robotsIndex ?? DEFAULTS.robotsIndex,
      robotsFollow: doc?.robotsFollow ?? DEFAULTS.robotsFollow,
      canonicalBaseUrl: doc?.canonicalBaseUrl || DEFAULTS.canonicalBaseUrl,
    }
  }

  static async update(input: Partial<SeoSettings>) {
    await dbConnect()
    const merged = { ...(await this.get()), ...input }
    const latest = await SeoSetting.findOne({ key: "seo" }).sort({ updatedAt: -1, _id: -1 }).lean()
    if (latest?._id) {
      await SeoSetting.findByIdAndUpdate(latest._id, { $set: { ...merged, key: "seo" } })
    } else {
      await SeoSetting.create({ key: "seo", ...merged })
    }
    return merged
  }
}
