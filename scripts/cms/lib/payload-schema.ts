import { z } from "zod"

export const homepageBlockPatchSchema = z.object({
  /** Match block by `id` (e.g. `hero-1`) or `type` (first enabled block of that type). */
  matchBy: z.enum(["id", "type"]).default("type"),
  target: z.string().min(1),
  enabled: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const cmsImportPageSchema = z.object({
  pageKey: z.string().min(1),
  /**
   * `merge` — shallow-merge top-level fields, then apply `blockPatches` on homepage snapshots.
   * `replace` — full page content (validated against template schema).
   */
  mode: z.enum(["merge", "replace"]).default("merge"),
  /** Full or partial page JSON (template-specific). Ignored when only `blockPatches` is set for home. */
  content: z.unknown().optional(),
  /** Homepage-blocks only: patch individual blocks without sending the full snapshot. */
  blockPatches: z.array(homepageBlockPatchSchema).optional(),
})

export const cmsImportPayloadSchema = z.object({
  version: z.literal(1),
  /** Optional note for humans/agents (not persisted). */
  notes: z.string().optional(),
  /** If set, publish each updated page after saving draft. */
  publish: z.boolean().default(false),
  pages: z.array(cmsImportPageSchema).min(1),
})

export type CmsImportPayload = z.infer<typeof cmsImportPayloadSchema>
export type CmsImportPage = z.infer<typeof cmsImportPageSchema>
export type HomepageBlockPatch = z.infer<typeof homepageBlockPatchSchema>
