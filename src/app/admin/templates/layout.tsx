import { AdminTemplateSessionBarSection } from "@/components/admin/AdminTemplateSessionBarSection"

export default async function AdminTemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminTemplateSessionBarSection />
      {children}
    </>
  )
}
