import dbConnect from "@/lib/db"
import TemplateContent from "@/models/TemplateContent"
import { TEMPLATE_REGISTRY } from "@/templates/registry"
import type { PageDefinition } from "@/templates/types"

function findPageDefinition(
  templateId: string,
  pageKey: string
): PageDefinition<unknown> | null {
  const template = TEMPLATE_REGISTRY[templateId]
  if (!template) return null

  if (pageKey === "page:home") return template.pages.home as PageDefinition<unknown>
  if (pageKey === "page:shop") return template.pages.shop as PageDefinition<unknown>
  if (pageKey === "page:pdp") return template.pages.pdp as PageDefinition<unknown>

  if (pageKey.startsWith("page:")) {
    const slug = pageKey.slice("page:".length)
    return (template.staticPages[slug] as PageDefinition<unknown>) ?? null
  }

  return null
}

export class PageContentService {
  static async get<T = unknown>(templateId: string, pageKey: string): Promise<T> {
    await dbConnect()
    const doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
    const def = findPageDefinition(templateId, pageKey)

    if (!doc) {
      if (!def) {
        throw new Error(
          `No page definition for templateId='${templateId}' pageKey='${pageKey}' and no stored content.`
        )
      }
      return def.defaultContent as T
    }

    if (!def) {
      try {
        return JSON.parse(doc.value) as T
      } catch {
        throw new Error(
          `Stored content for templateId='${templateId}' pageKey='${pageKey}' is not valid JSON and there is no schema to fall back to.`
        )
      }
    }

    try {
      const parsed = JSON.parse(doc.value)
      return def.schema.parse(parsed) as T
    } catch (error) {
      console.error(
        `[PageContentService] Failed to parse content for ${templateId}/${pageKey}; falling back to default.`,
        error
      )
      return def.defaultContent as T
    }
  }

  static async save<T>(
    templateId: string,
    pageKey: string,
    value: T,
    updatedBy?: string
  ): Promise<T> {
    const def = findPageDefinition(templateId, pageKey)
    if (!def) {
      throw new Error(
        `Cannot save: no page definition for templateId='${templateId}' pageKey='${pageKey}'.`
      )
    }
    const validated = def.schema.parse(value)

    await dbConnect()
    await TemplateContent.findOneAndUpdate(
      { templateId, pageKey },
      { value: JSON.stringify(validated), updatedBy },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return validated as T
  }

  static async reset(templateId: string, pageKey: string): Promise<void> {
    await dbConnect()
    await TemplateContent.deleteOne({ templateId, pageKey })
  }

  static async listForTemplate(
    templateId: string
  ): Promise<Array<{ pageKey: string; updatedAt: Date }>> {
    await dbConnect()
    const docs = await TemplateContent.find({ templateId })
      .select({ pageKey: 1, updatedAt: 1 })
      .lean()
    return docs.map((d) => ({
      pageKey: d.pageKey,
      updatedAt: (d as { updatedAt?: Date }).updatedAt ?? new Date(),
    }))
  }
}
