import dbConnect from "@/lib/db"
import ThemeSetting from "@/models/ThemeSetting"

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

const DEFAULT_THEME: ThemeTokens = {
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

export class ThemeService {
  static defaults() {
    return DEFAULT_THEME
  }

  static async get() {
    await dbConnect()
    let doc = await ThemeSetting.findOne({ key: "theme" }).sort({ updatedAt: -1, _id: -1 }).lean()
    if (!doc) {
      await ThemeSetting.create({ key: "theme", colors: DEFAULT_THEME })
      doc = await ThemeSetting.findOne({ key: "theme" }).sort({ updatedAt: -1, _id: -1 }).lean()
    }
    const raw = (doc || {}) as Record<string, unknown>
    const legacyTopLevel: Partial<ThemeTokens> = {
      primary: typeof raw.primary === "string" ? (raw.primary as string) : undefined,
      primaryForeground: typeof raw.primaryForeground === "string" ? (raw.primaryForeground as string) : undefined,
      secondary: typeof raw.secondary === "string" ? (raw.secondary as string) : undefined,
      secondaryForeground: typeof raw.secondaryForeground === "string" ? (raw.secondaryForeground as string) : undefined,
      accent: typeof raw.accent === "string" ? (raw.accent as string) : undefined,
      accentForeground: typeof raw.accentForeground === "string" ? (raw.accentForeground as string) : undefined,
      background: typeof raw.background === "string" ? (raw.background as string) : undefined,
      foreground: typeof raw.foreground === "string" ? (raw.foreground as string) : undefined,
      surface: typeof raw.surface === "string" ? (raw.surface as string) : undefined,
      surfaceForeground: typeof raw.surfaceForeground === "string" ? (raw.surfaceForeground as string) : undefined,
      border: typeof raw.border === "string" ? (raw.border as string) : undefined,
      muted: typeof raw.muted === "string" ? (raw.muted as string) : undefined,
      mutedForeground: typeof raw.mutedForeground === "string" ? (raw.mutedForeground as string) : undefined,
      success: typeof raw.success === "string" ? (raw.success as string) : undefined,
      successForeground: typeof raw.successForeground === "string" ? (raw.successForeground as string) : undefined,
      warning: typeof raw.warning === "string" ? (raw.warning as string) : undefined,
      warningForeground: typeof raw.warningForeground === "string" ? (raw.warningForeground as string) : undefined,
      error: typeof raw.error === "string" ? (raw.error as string) : undefined,
      errorForeground: typeof raw.errorForeground === "string" ? (raw.errorForeground as string) : undefined,
    }
    return { ...DEFAULT_THEME, ...legacyTopLevel, ...((raw.colors as Partial<ThemeTokens>) || {}) } as ThemeTokens
  }

  static async update(colors: Partial<ThemeTokens>) {
    await dbConnect()
    const merged = { ...(await this.get()), ...colors }
    const latest = await ThemeSetting.findOne({ key: "theme" }).sort({ updatedAt: -1, _id: -1 }).lean()
    if (latest?._id) {
      await ThemeSetting.findByIdAndUpdate(latest._id, { $set: { colors: merged, key: "theme" } })
    } else {
      await ThemeSetting.create({ key: "theme", colors: merged })
    }
    return merged
  }
}
