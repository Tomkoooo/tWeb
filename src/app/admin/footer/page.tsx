import { FooterEditor } from "@/features/site-settings/components/FooterEditor"
import { FooterSettingsService } from "@/services/footer-settings"

export default async function AdminFooterPage() {
  const footer = await FooterSettingsService.get()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-white uppercase">Footer</h1>
      <FooterEditor initial={footer} />
    </div>
  )
}
