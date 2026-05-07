import { SeoEditor } from "@/features/site-settings/components/SeoEditor"
import { SeoSettingsService } from "@/services/seo-settings"

export default async function AdminSeoPage() {
  const seo = await SeoSettingsService.get()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white uppercase">SEO</h1>
      <SeoEditor initial={seo} />
    </div>
  )
}
