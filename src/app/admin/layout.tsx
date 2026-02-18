import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <AdminSidebar />
      <main className="pl-64 min-h-screen">
        <div className="px-8 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
