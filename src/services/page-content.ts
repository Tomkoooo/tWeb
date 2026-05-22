import dbConnect from "@/lib/db"
import TemplateContent from "@/models/TemplateContent"
import { FALLBACK_TEMPLATE_ID, TEMPLATE_REGISTRY } from "@/templates/registry"
import { findPageDefinition } from "@/templates/resolve-page-definition"
import { HomepageCmsService } from "@/services/homepage-cms"
import { insertMissingHomepageBlocks } from "@/features/homepage-cms/utils/insert-missing-homepage-blocks"
import {
  pruneAndDedupeHomepageBlocks,
  resolveAllowedHomepageBlockTypes,
} from "@/features/homepage-cms/utils/homepage-block-allowlist"
import { homepageSnapshotSchema } from "@/features/homepage-cms/types/homepage-schema"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import type { PageDefinition } from "@/templates/types"

function findPageDefinitionByTemplateId(
  templateId: string,
  pageKey: string
): PageDefinition<unknown> | null {
  const template = TEMPLATE_REGISTRY[templateId]
  if (!template) return null
  return findPageDefinition(template, pageKey)
}

function parseWithDef<T>(
  raw: string,
  def: PageDefinition<unknown> | null,
  templateId: string,
  pageKey: string
): T {
  if (!def) {
    try {
      return JSON.parse(raw) as T
    } catch {
      throw new Error(
        `Stored content for templateId='${templateId}' pageKey='${pageKey}' is not valid JSON and there is no schema to fall back to.`
      )
    }
  }
  try {
    const parsed = JSON.parse(raw)
    const data = def.schema.parse(parsed) as T
    if (pageKey === "page:home") {
      const ref = def.defaultContent as HomepageSnapshot
      const homeParsed = homepageSnapshotSchema.safeParse(data)
      const refParsed = homepageSnapshotSchema.safeParse(ref)
      if (homeParsed.success && refParsed.success) {
        const merged = insertMissingHomepageBlocks(homeParsed.data, refParsed.data)
        const allowed = resolveAllowedHomepageBlockTypes(def)
        return pruneAndDedupeHomepageBlocks(merged, allowed) as T
      }
    }
    return data
  } catch (error) {
    console.error(
      `[PageContentService] Failed to parse content for ${templateId}/${pageKey}; falling back to default.`,
      error
    )
    return def.defaultContent as T
  }
}

export type TemplateContentMeta = {
  hasDraft: boolean
  publishedAt?: Date
}

export class PageContentService {
  /**
   * Live storefront content (published snapshot only).
   * Alias: use `get` for backward compatibility.
   */
  static async getPublished<T = unknown>(templateId: string, pageKey: string): Promise<T> {
    return this.get<T>(templateId, pageKey)
  }

  /** @deprecated Prefer getPublished — behavior is identical. */
  static async get<T = unknown>(templateId: string, pageKey: string): Promise<T> {
    await dbConnect()
    let doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
    const def = findPageDefinitionByTemplateId(templateId, pageKey)

    if (!doc && templateId === FALLBACK_TEMPLATE_ID && pageKey === "page:home" && def) {
      const legacy = await HomepageCmsService.getPublished()
      const parsed = def.schema.safeParse(legacy)
      if (parsed.success) {
        const asDefault =
          JSON.stringify(parsed.data) === JSON.stringify(def.defaultContent)
        if (!asDefault) {
          await TemplateContent.findOneAndUpdate(
            { templateId, pageKey },
            {
              templateId,
              pageKey,
              value: JSON.stringify(parsed.data),
            },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
          )
          doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
        }
      }
    }

    if (!doc) {
      if (!def) {
        throw new Error(
          `No page definition for templateId='${templateId}' pageKey='${pageKey}' and no stored content.`
        )
      }
      return def.defaultContent as T
    }

    return parseWithDef<T>(doc.value, def, templateId, pageKey)
  }

  /**
   * Editor baseline: draft when present, otherwise published `value`.
   */
  static async getDraft<T = unknown>(templateId: string, pageKey: string): Promise<T> {
    await dbConnect()
    let doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
    const def = findPageDefinitionByTemplateId(templateId, pageKey)

    if (!doc && templateId === FALLBACK_TEMPLATE_ID && pageKey === "page:home" && def) {
      const legacy = await HomepageCmsService.getPublished()
      const parsed = def.schema.safeParse(legacy)
      if (parsed.success) {
        const asDefault =
          JSON.stringify(parsed.data) === JSON.stringify(def.defaultContent)
        if (!asDefault) {
          await TemplateContent.findOneAndUpdate(
            { templateId, pageKey },
            {
              templateId,
              pageKey,
              value: JSON.stringify(parsed.data),
            },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
          )
          doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
        }
      }
    }

    if (!doc) {
      if (!def) {
        throw new Error(
          `No page definition for templateId='${templateId}' pageKey='${pageKey}' and no stored content.`
        )
      }
      return def.defaultContent as T
    }

    const source =
      doc.draftValue && doc.draftValue.trim().length > 0 ? doc.draftValue : doc.value
    return parseWithDef<T>(source, def, templateId, pageKey)
  }

  static async getMeta(templateId: string, pageKey: string): Promise<TemplateContentMeta> {
    await dbConnect()
    const doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
    if (!doc) return { hasDraft: false }
    return {
      hasDraft: Boolean(doc.draftValue && doc.draftValue.trim().length > 0),
      publishedAt: doc.publishedAt,
    }
  }

  static async saveDraft<T>(
    templateId: string,
    pageKey: string,
    value: T,
    updatedBy?: string
  ): Promise<T> {
    const def = findPageDefinitionByTemplateId(templateId, pageKey)
    if (!def) {
      throw new Error(
        `Cannot save draft: no page definition for templateId='${templateId}' pageKey='${pageKey}'.`
      )
    }
    const validated = def.schema.parse(value)

    await dbConnect()
    await TemplateContent.findOneAndUpdate(
      { templateId, pageKey },
      {
        $set: { draftValue: JSON.stringify(validated), updatedBy },
        $setOnInsert: {
          templateId,
          pageKey,
          value: JSON.stringify(def.defaultContent),
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )
    return validated as T
  }

  static async publish<T>(
    templateId: string,
    pageKey: string,
    publishedBy?: string
  ): Promise<T> {
    const def = findPageDefinitionByTemplateId(templateId, pageKey)
    if (!def) {
      throw new Error(
        `Cannot publish: no page definition for templateId='${templateId}' pageKey='${pageKey}'.`
      )
    }

    await dbConnect()
    const doc = await TemplateContent.findOne({ templateId, pageKey }).lean()
    if (!doc) {
      const baseline = def.defaultContent
      await TemplateContent.findOneAndUpdate(
        { templateId, pageKey },
        {
          $set: {
            templateId,
            pageKey,
            value: JSON.stringify(baseline),
            publishedBy,
            publishedAt: new Date(),
          },
          $unset: { draftValue: 1 },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      )
      return baseline as T
    }

    const raw =
      doc.draftValue && doc.draftValue.trim().length > 0 ? doc.draftValue : doc.value
    const validated = def.schema.parse(JSON.parse(raw))

    await TemplateContent.findOneAndUpdate(
      { templateId, pageKey },
      {
        $set: {
          value: JSON.stringify(validated),
          publishedBy,
          publishedAt: new Date(),
          updatedBy: publishedBy,
        },
        $unset: { draftValue: 1 },
      }
    )
    return validated as T
  }

  static async discardDraft(templateId: string, pageKey: string): Promise<void> {
    await dbConnect()
    await TemplateContent.findOneAndUpdate(
      { templateId, pageKey },
      { $unset: { draftValue: 1 } }
    )
  }

  /**
   * Immediate write to published (no draft). Used for migrations / rare admin tools.
   */
  static async savePublished<T>(
    templateId: string,
    pageKey: string,
    value: T,
    updatedBy?: string
  ): Promise<T> {
    const def = findPageDefinitionByTemplateId(templateId, pageKey)
    if (!def) {
      throw new Error(
        `Cannot save: no page definition for templateId='${templateId}' pageKey='${pageKey}'.`
      )
    }
    const validated = def.schema.parse(value)

    await dbConnect()
    await TemplateContent.findOneAndUpdate(
      { templateId, pageKey },
      {
        $set: {
          value: JSON.stringify(validated),
          updatedBy,
          publishedBy: updatedBy,
          publishedAt: new Date(),
        },
        $unset: { draftValue: 1 },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )
    return validated as T
  }

  /** @deprecated Use saveDraft + publish */
  static async save<T>(
    templateId: string,
    pageKey: string,
    value: T,
    updatedBy?: string
  ): Promise<T> {
    return this.saveDraft(templateId, pageKey, value, updatedBy)
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
