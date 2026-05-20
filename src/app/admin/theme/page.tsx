import { ThemeEditor } from "@/features/theme/components/ThemeEditor"
import { TemplateService } from "@/services/template"
import { getEffectiveThemeBase, ThemeService } from "@/services/theme"

export default async function AdminThemePage() {
  const template = await TemplateService.getDbActive()
  const merged = await ThemeService.getMergedForTemplate(template)
  const baseline = getEffectiveThemeBase(template)
  const baselineSource = template.defaultTheme
    ? `this template's default (${template.manifest.name})`
    : "the engine default palette"
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white uppercase">Theme</h1>
      <p className="text-sm text-neutral-400 max-w-2xl">
        Active template: <span className="text-white">{template.manifest.name}</span>.{" "}
        <strong className="text-neutral-300">Reset to default & save</strong> restores {baselineSource}
        . <strong className="text-neutral-300">Preview baseline</strong> updates the preview only until you click save reset.
      </p>
      <ThemeEditor
        initial={merged}
        resetBaseline={baseline}
        resetHelpText={
          template.defaultTheme
            ? "Clears saved overrides and applies this template’s packaged colors."
            : "Clears saved overrides and applies the engine default palette (this template does not ship its own colors)."
        }
      />
    </div>
  )
}
