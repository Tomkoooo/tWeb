import { cache } from "react"
import dbConnect from "@/lib/db"
import ActiveTemplate from "@/models/ActiveTemplate"
import {
  FALLBACK_TEMPLATE_ID,
  getTemplateById,
  loadTemplateModule,
  listTemplates,
  listAllTemplates,
} from "@/templates/registry"
import { revalidateStorefrontTags, STOREFRONT_CACHE_TAGS } from "@/lib/storefront-cache-tags"
import type { TemplateModule } from "@/templates/types"
import { readPreviewTemplateId } from "@/services/template-preview"
import { ThemeService } from "@/services/theme"
import {
  getDefaultTemplateIdForDeployment,
  isTemplateAllowedForDeployment,
  listAllowedTemplateIdsForDeployment,
} from "@/config/deployments-registry"
import { headers } from "next/headers"

export type ActiveTemplateInfo = {
  templateId: string
  templateVersion: string
  activatedAt: Date | null
  activatedBy: string | null
}

const readActiveTemplateRecord = cache(async (): Promise<ActiveTemplateInfo> => {
  await dbConnect()
  const doc = await ActiveTemplate.findOne({ key: "active" }).lean()
  if (!doc) {
    return {
      templateId: FALLBACK_TEMPLATE_ID,
      templateVersion: getTemplateById(FALLBACK_TEMPLATE_ID)!.manifest.version,
      activatedAt: null,
      activatedBy: null,
    }
  }
  return {
    templateId: doc.templateId,
    templateVersion: doc.templateVersion,
    activatedAt: doc.activatedAt ?? null,
    activatedBy: doc.activatedBy ?? null,
  }
})

export class TemplateService {
  static async getActiveInfo(): Promise<ActiveTemplateInfo> {
    return readActiveTemplateRecord()
  }

  static async getActive(): Promise<TemplateModule> {
    const previewId = await readPreviewTemplateId()
    if (previewId) {
      return loadTemplateModule(previewId)
    }
    const info = await readActiveTemplateRecord()
    return loadTemplateModule(info.templateId)
  }

  /** Active template from Mongo — ignores admin preview cookie (use for theme persistence). */
  static async getDbActive(): Promise<TemplateModule> {
    const info = await readActiveTemplateRecord()
    return loadTemplateModule(info.templateId)
  }

  static async getById(id: string): Promise<TemplateModule | null> {
    try {
      return await loadTemplateModule(id)
    } catch {
      return null
    }
  }

  static async listForDeployment(): Promise<TemplateModule[]> {
    const host = await TemplateService.getRequestHost()
    const allowed = new Set(listAllowedTemplateIdsForDeployment(host))
    const all = await listAllTemplates()
    return all.filter((t) => allowed.has(t.manifest.id))
  }

  /** @deprecated Use `listForDeployment()` — returns only templates allowed on this deployment. */
  static list(): TemplateModule[] {
    return listTemplates()
  }

  static async listAll(): Promise<TemplateModule[]> {
    return listAllTemplates()
  }

  static async getSuggestedTemplateId(): Promise<string> {
    const host = await TemplateService.getRequestHost()
    return getDefaultTemplateIdForDeployment(host)
  }

  private static async getRequestHost(): Promise<string | null> {
    try {
      const h = await headers()
      return h.get("host")
    } catch {
      return null
    }
  }

  static async activate(templateId: string, activatedBy?: string): Promise<TemplateModule> {
    const host = await TemplateService.getRequestHost()
    if (!isTemplateAllowedForDeployment(templateId, host)) {
      throw new Error(
        `Template '${templateId}' is not allowed for this deployment. Check deployments.config.json and DEPLOYMENT_KEY.`
      )
    }
    const template = await loadTemplateModule(templateId)
    await dbConnect()
    await ActiveTemplate.findOneAndUpdate(
      { key: "active" },
      {
        key: "active",
        templateId: template.manifest.id,
        templateVersion: template.manifest.version,
        activatedAt: new Date(),
        activatedBy,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )
    await ThemeService.clearStoredIfLegacySnapshot()
    revalidateStorefrontTags(STOREFRONT_CACHE_TAGS.template, STOREFRONT_CACHE_TAGS.theme)
    return template
  }
}
