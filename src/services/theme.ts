import dbConnect from "@/lib/db"
import { THEME_TOKEN_KEYS } from "@/lib/theme-token-keys"
import { sanitizeThemeTokens } from "@/lib/theme-sanitize"
import ThemeSetting from "@/models/ThemeSetting"
import type { TemplateModule } from "@/templates/types"

export type ThemeTokens = {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  background: string
  foreground: string
  surface: string
  surfaceForeground: string
  border: string
  muted: string
  mutedForeground: string
  success: string
  successForeground: string
  warning: string
  warningForeground: string
  error: string
  errorForeground: string
}

const ENGINE_DEFAULT_THEME: ThemeTokens = {
  primary: "#111827",
  primaryForeground: "#FFFFFF",
  secondary: "#1F2937",
  secondaryForeground: "#FFFFFF",
  accent: "#2563EB",
  accentForeground: "#FFFFFF",
  background: "#0A0A0A",
  foreground: "#FFFFFF",
  surface: "#151515",
  surfaceForeground: "#FFFFFF",
  border: "#333333",
  muted: "#222222",
  mutedForeground: "#999999",
  success: "#16A34A",
  successForeground: "#FFFFFF",
  warning: "#D97706",
  warningForeground: "#FFFFFF",
  error: "#DC2626",
  errorForeground: "#FFFFFF",
}

type LeanThemeDoc = {
  _id?: unknown
  key?: string
  colors?: Record<string, unknown>
  overridesOnly?: boolean
} & Partial<ThemeTokens>

function legacyTopLevelFromRaw(raw: Record<string, unknown>): Partial<ThemeTokens> {
  return {
    primary: typeof raw.primary === "string" ? (raw.primary as string) : undefined,
    primaryForeground:
      typeof raw.primaryForeground === "string" ? (raw.primaryForeground as string) : undefined,
    secondary: typeof raw.secondary === "string" ? (raw.secondary as string) : undefined,
    secondaryForeground:
      typeof raw.secondaryForeground === "string" ? (raw.secondaryForeground as string) : undefined,
    accent: typeof raw.accent === "string" ? (raw.accent as string) : undefined,
    accentForeground:
      typeof raw.accentForeground === "string" ? (raw.accentForeground as string) : undefined,
    background: typeof raw.background === "string" ? (raw.background as string) : undefined,
    foreground: typeof raw.foreground === "string" ? (raw.foreground as string) : undefined,
    surface: typeof raw.surface === "string" ? (raw.surface as string) : undefined,
    surfaceForeground:
      typeof raw.surfaceForeground === "string" ? (raw.surfaceForeground as string) : undefined,
    border: typeof raw.border === "string" ? (raw.border as string) : undefined,
    muted: typeof raw.muted === "string" ? (raw.muted as string) : undefined,
    mutedForeground:
      typeof raw.mutedForeground === "string" ? (raw.mutedForeground as string) : undefined,
    success: typeof raw.success === "string" ? (raw.success as string) : undefined,
    successForeground:
      typeof raw.successForeground === "string" ? (raw.successForeground as string) : undefined,
    warning: typeof raw.warning === "string" ? (raw.warning as string) : undefined,
    warningForeground:
      typeof raw.warningForeground === "string" ? (raw.warningForeground as string) : undefined,
    error: typeof raw.error === "string" ? (raw.error as string) : undefined,
    errorForeground:
      typeof raw.errorForeground === "string" ? (raw.errorForeground as string) : undefined,
  }
}

/** Mongo row → merged layer (historical ThemeService behavior, before template-aware baseline). */
function themeLayerFromStoredDocument(raw: LeanThemeDoc | Record<string, unknown>): ThemeTokens {
  const r = raw as Record<string, unknown>
  const nestedColors = ((r.colors as Partial<ThemeTokens>) || {}) as Record<string, string>
  return {
    ...ENGINE_DEFAULT_THEME,
    ...legacyTopLevelFromRaw(r),
    ...nestedColors,
  } as ThemeTokens
}

/** Baseline palette for a template before admin overrides apply. */
export function getEffectiveThemeBase(template: TemplateModule | null | undefined): ThemeTokens {
  if (template?.defaultTheme) return template.defaultTheme
  return ENGINE_DEFAULT_THEME
}

/** Persist the full palette so storefront/CMS never keep baseline colors for omitted keys. */
function fullPaletteFromDesired(desired: ThemeTokens): ThemeTokens {
  const out = {} as ThemeTokens
  for (const key of THEME_TOKEN_KEYS) {
    const k = key as keyof ThemeTokens
    out[k] = desired[k]
  }
  return out
}

export class ThemeService {
  /** Global engine defaults when a template ships without `defaultTheme`. */
  static defaults() {
    return ENGINE_DEFAULT_THEME
  }

  /**
   * Final CSS tokens for the storefront: baseline (template.defaultTheme ?? engine defaults)
   * merged with Mongo overrides (partial when `overridesOnly`, else legacy snapshot).
   */
  static async getMergedForTemplate(template: TemplateModule): Promise<ThemeTokens> {
    const base = getEffectiveThemeBase(template)
    await dbConnect()
    const doc = (await ThemeSetting.findOne({ key: "theme" })
      .sort({ updatedAt: -1, _id: -1 })
      .lean()) as LeanThemeDoc | null

    if (!doc ||
        doc.colors === undefined ||
        doc.colors === null ||
        typeof doc.colors !== "object") {
      return sanitizeThemeTokens(base, ENGINE_DEFAULT_THEME)
    }

    if (doc.overridesOnly === true) {
      const partial = doc.colors as Partial<ThemeTokens>
      return sanitizeThemeTokens({ ...base, ...partial } as ThemeTokens, base)
    }

    const legacyLayer = themeLayerFromStoredDocument(doc)
    return sanitizeThemeTokens({ ...base, ...legacyLayer }, base)
  }

  /**
   * Persists `desired` as overrides relative to the active template baseline.
   * Returns the merged effective theme.
   */
  static async saveFullThemeForTemplate(
    template: TemplateModule,
    desired: ThemeTokens
  ): Promise<ThemeTokens> {
    const palette = fullPaletteFromDesired(desired)
    await dbConnect()
    const latest = await ThemeSetting.findOne({ key: "theme" }).sort({ updatedAt: -1, _id: -1 })
    if (latest?._id) {
      await ThemeSetting.findByIdAndUpdate(latest._id, {
        $set: { key: "theme", colors: palette, overridesOnly: true },
      })
    } else {
      await ThemeSetting.create({
        key: "theme",
        colors: palette,
        overridesOnly: true,
      })
    }
    return this.getMergedForTemplate(template)
  }

  /** Clears stored overrides so the active template baseline is used. */
  static async clearStoredOverrides(): Promise<void> {
    await dbConnect()
    await ThemeSetting.findOneAndUpdate(
      { key: "theme" },
      { $set: { key: "theme", colors: {}, overridesOnly: true } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    )
  }

  /**
   * After switching templates, a legacy full theme row (`overridesOnly` not true) would mask
   * the new template's `defaultTheme`. Clear overrides so the new baseline shows immediately.
   * Rows already stored as `overridesOnly: true` are left unchanged.
   */
  static async clearStoredIfLegacySnapshot(): Promise<void> {
    await dbConnect()
    const doc = (await ThemeSetting.findOne({ key: "theme" })
      .sort({ updatedAt: -1, _id: -1 })
      .lean()) as LeanThemeDoc | null
    if (!doc || doc.overridesOnly === true) return
    await this.clearStoredOverrides()
  }

  /**
   * @deprecated Prefer getMergedForTemplate with an explicit template.
   * Resolves using the currently active template from the DB / registry.
   */
  static async get() {
    const { TemplateService } = await import("@/services/template")
    const template = await TemplateService.getActive()
    return this.getMergedForTemplate(template)
  }

  /**
   * @deprecated Prefer saveFullThemeForTemplate.
   * Legacy: merged with old get() semantics — avoid for new code.
   */
  static async update(colors: Partial<ThemeTokens>) {
    const { TemplateService } = await import("@/services/template")
    const template = await TemplateService.getActive()
    const current = await this.getMergedForTemplate(template)
    const merged = { ...current, ...colors }
    return this.saveFullThemeForTemplate(template, merged)
  }
}
