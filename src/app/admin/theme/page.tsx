import { ThemeEditor } from "@/features/theme/components/ThemeEditor"
import { ThemeService } from "@/services/theme"

export default async function AdminThemePage() {
  const theme = await ThemeService.get()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white uppercase">Theme</h1>
      <ThemeEditor initial={theme} />
    </div>
  )
}
