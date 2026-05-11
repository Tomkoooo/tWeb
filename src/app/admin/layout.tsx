import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTemplateSessionBar } from "@/components/admin/AdminTemplateSessionBar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BrandingSettingsService } from "@/services/branding-settings"
import { FeatureFlagService } from "@/services/feature-flags"
import { isShopEnabled } from "@/lib/features/shop"
import { readPreviewTemplateId } from "@/services/template-preview"
import { TemplateService } from "@/services/template"
import { getTemplateById } from "@/templates/registry"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const [branding, newsletterEnabled, glsParcelPickerEnabled, stripePaymentsEnabled] =
    await Promise.all([
      BrandingSettingsService.get(),
      FeatureFlagService.isEnabled("newsletter", false),
      FeatureFlagService.isEnabled("glsParcelPicker", false),
      FeatureFlagService.isEnabled("stripePayments", false),
    ])
  const shopEnabled = isShopEnabled()
  const adminBrandName = branding.brandName || "Generic"
  const enabledFeatures = {
    newsletter: newsletterEnabled,
    glsParcelPicker: glsParcelPickerEnabled,
    stripePayments: stripePaymentsEnabled,
  }

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [activeInfo, previewTemplateId] = await Promise.all([
    TemplateService.getActiveInfo(),
    readPreviewTemplateId(),
  ])
  const dbActiveName = getTemplateById(activeInfo.templateId).manifest.name
  const previewTemplateName = previewTemplateId
    ? getTemplateById(previewTemplateId).manifest.name
    : null

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bolt</span>
        </Link>
        
        <span className="text-sm font-heading font-black tracking-tight uppercase italic">
          {adminBrandName} <span className="text-primary underline decoration-primary/20 underline-offset-4">Admin</span>
        </span>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r border-white/10 w-72">
            <AdminSidebar
              brandName={adminBrandName}
              enabledFeatures={enabledFeatures}
              shopEnabled={shopEnabled}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 border-r border-white/5 flex-col z-50">
        <AdminSidebar
          brandName={adminBrandName}
          enabledFeatures={enabledFeatures}
          shopEnabled={shopEnabled}
        />
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <div className="px-6 py-8 md:px-10 md:py-12 max-w-7xl mx-auto">
          <AdminTemplateSessionBar
            dbActiveName={dbActiveName}
            previewTemplateId={previewTemplateId}
            previewTemplateName={previewTemplateName}
          />
          {children}
        </div>
      </main>
    </div>
  )
}
