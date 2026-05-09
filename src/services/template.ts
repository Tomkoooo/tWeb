import { cache } from "react"
import dbConnect from "@/lib/db"
import ActiveTemplate from "@/models/ActiveTemplate"
import {
  FALLBACK_TEMPLATE_ID,
  TEMPLATE_REGISTRY,
  getTemplateById,
  listTemplates,
} from "@/templates/registry"
import type { TemplateModule } from "@/templates/types"
import { readPreviewTemplateId } from "@/services/template-preview"

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
      templateVersion: TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_ID].manifest.version,
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
    if (previewId && TEMPLATE_REGISTRY[previewId]) {
      return TEMPLATE_REGISTRY[previewId]
    }
    const info = await readActiveTemplateRecord()
    return getTemplateById(info.templateId)
  }

  static getById(id: string): TemplateModule | null {
    return TEMPLATE_REGISTRY[id] ?? null
  }

  static list(): TemplateModule[] {
    return listTemplates()
  }

  static async activate(templateId: string, activatedBy?: string): Promise<TemplateModule> {
    const template = TEMPLATE_REGISTRY[templateId]
    if (!template) {
      throw new Error(`Unknown template id '${templateId}'.`)
    }
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
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return template
  }
}
