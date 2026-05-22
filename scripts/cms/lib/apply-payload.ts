import { TEMPLATE_REGISTRY } from "@/templates/registry"
import { findPageDefinition } from "@/templates/resolve-page-definition"
import { PageContentService } from "@/services/page-content"
import { homepageSnapshotSchema } from "@/features/homepage-cms/types/homepage-schema"
import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"
import type { CmsImportPayload, CmsImportPage } from "./payload-schema"
import { applyHomepageBlockPatches } from "./apply-homepage-patches"
import { deepMerge } from "./deep-merge"

export type ApplyImportOptions = {
  templateId: string
  payload: CmsImportPayload
  dryRun?: boolean
}

export type ApplyImportResult = {
  templateId: string
  dryRun: boolean
  pages: Array<{
    pageKey: string
    mode: CmsImportPage["mode"]
    published: boolean
    summary: string
  }>
}

function assertTemplate(templateId: string) {
  const template = TEMPLATE_REGISTRY[templateId]
  if (!template) {
    const known = Object.keys(TEMPLATE_REGISTRY).join(", ")
    throw new Error(
      `Unknown templateId="${templateId}". Registered templates: ${known}`
    )
  }
  return template
}

function mergePageContent<T extends Record<string, unknown>>(
  current: T,
  partial: Record<string, unknown>
): T {
  return deepMerge(current, partial)
}

async function resolveNextHomepageContent(
  templateId: string,
  page: CmsImportPage,
  def: ReturnType<typeof findPageDefinition>
): Promise<HomepageSnapshot> {
  const current = (await PageContentService.getDraft(
    templateId,
    page.pageKey
  )) as HomepageSnapshot

  if (page.mode === "replace") {
    if (!page.content) {
      throw new Error(
        `pageKey="${page.pageKey}" mode=replace requires "content" with a full homepage snapshot.`
      )
    }
    return homepageSnapshotSchema.parse(page.content)
  }

  let next = { ...current }

  if (page.content && typeof page.content === "object" && page.content !== null) {
    const partial = page.content as Record<string, unknown>
    if (partial.meta && typeof partial.meta === "object") {
      next.meta = mergePageContent(
        next.meta as Record<string, unknown>,
        partial.meta as Record<string, unknown>
      ) as HomepageSnapshot["meta"]
    }
    if (Array.isArray(partial.blocks)) {
      next.blocks = partial.blocks as HomepageSnapshot["blocks"]
    }
  }

  if (page.blockPatches?.length) {
    next = applyHomepageBlockPatches(next, page.blockPatches)
  }

  if (!def) {
    throw new Error(`No page definition for ${page.pageKey}`)
  }
  return def.schema.parse(next) as HomepageSnapshot
}

async function resolveNextSurfaceContent(
  templateId: string,
  page: CmsImportPage,
  def: NonNullable<ReturnType<typeof findPageDefinition>>
): Promise<unknown> {
  if (page.mode === "replace") {
    if (page.content === undefined) {
      throw new Error(
        `pageKey="${page.pageKey}" mode=replace requires "content".`
      )
    }
    return def.schema.parse(page.content)
  }

  const current = (await PageContentService.getDraft(
    templateId,
    page.pageKey
  )) as Record<string, unknown>

  if (page.content === undefined) {
    throw new Error(
      `pageKey="${page.pageKey}" mode=merge requires "content" (partial) or use mode=replace.`
    )
  }

  const partial =
    typeof page.content === "object" && page.content !== null
      ? (page.content as Record<string, unknown>)
      : {}

  const merged = mergePageContent(current, partial)
  return def.schema.parse(merged)
}

export async function applyCmsImportPayload(
  options: ApplyImportOptions
): Promise<ApplyImportResult> {
  const { templateId, payload, dryRun = false } = options
  assertTemplate(templateId)

  const shouldPublish = payload.publish
  const pages: ApplyImportResult["pages"] = []

  for (const page of payload.pages) {
    const def = findPageDefinition(
      TEMPLATE_REGISTRY[templateId],
      page.pageKey
    )
    if (!def) {
      throw new Error(
        `No page definition for templateId="${templateId}" pageKey="${page.pageKey}".`
      )
    }

    const isHomepage =
      page.pageKey === "page:home" &&
      TEMPLATE_REGISTRY[templateId].pages.home.cmsPageKind === "homepage-blocks"

    let next: unknown
    if (isHomepage) {
      next = await resolveNextHomepageContent(templateId, page, def)
    } else {
      if (page.blockPatches?.length) {
        throw new Error(
          `blockPatches are only supported for homepage-blocks (page:home). Got pageKey="${page.pageKey}".`
        )
      }
      next = await resolveNextSurfaceContent(templateId, page, def)
    }

    let summary: string
    if (isHomepage) {
      const snap = next as HomepageSnapshot
      summary = `${snap.blocks.length} blocks, seoTitle="${snap.meta.seoTitle.slice(0, 40)}…"`
    } else {
      summary = `validated ${page.pageKey} (${page.mode})`
    }

    if (!dryRun) {
      await PageContentService.saveDraft(templateId, page.pageKey, next)
      if (shouldPublish) {
        await PageContentService.publish(templateId, page.pageKey)
      }
    }

    pages.push({
      pageKey: page.pageKey,
      mode: page.mode,
      published: !dryRun && shouldPublish,
      summary,
    })
  }

  return { templateId, dryRun, pages }
}
