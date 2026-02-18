"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  LayoutDashboard, 
  Settings, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  FileEdit,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

const menuItems = [
  { icon: LayoutDashboard, label: "Áttekintés", href: "/admin" },
  { icon: BarChart3, label: "Statisztikák", href: "/admin/stats" },
  { icon: FileEdit, label: "Tartalomkezelés", href: "/admin/cms" },
  { icon: Settings, label: "Bolt adatok", href: "/admin/info" },
  { icon: Package, label: "Termékek", href: "/admin/products" },
  { icon: ShoppingCart, label: "Rendelések", href: "/admin/orders" },
  { icon: MessageSquare, label: "Vélemények", href: "/admin/reviews" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-bold text-white italic shadow-lg shadow-accent/20">
            K
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase italic">
            Krausz <span className="text-accent">Admin</span>
          </span>
        </Link>
        
        {session?.user && (
          <div className="mt-8 px-2">
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-1">Üdvözöljük,</p>
            <p className="text-sm font-bold text-white truncate italic">Szia, {session.user.name}!</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-accent text-white" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/40")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <ShoppingCart className="w-5 h-5" />
          Vissza a boltba
        </Link>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Kijelentkezés
        </button>
      </div>
    </aside>
  )
}

