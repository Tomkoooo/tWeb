import { AdminTemplateSessionBarSection } from "@/components/admin/AdminTemplateSessionBarSection"

export default async function AdminCmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminTemplateSessionBarSection />
      {children}
    </>
  )
}
