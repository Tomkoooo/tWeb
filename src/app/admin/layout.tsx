import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bolt</span>
        </Link>
        
        <span className="text-sm font-heading font-black tracking-tight uppercase italic">
          Krausz <span className="text-accent underline decoration-accent/20 underline-offset-4">Admin</span>
        </span>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r border-white/10 w-72">
            <AdminSidebar onAction={() => {}} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 border-r border-white/5 flex-col z-50">
        <AdminSidebar />
      </aside>

      <main className="lg:ml-72 min-h-screen">
        <div className="px-6 py-8 md:px-10 md:py-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
