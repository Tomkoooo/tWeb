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
  LogOut,
  Mail,
  Truck,
  CreditCard,
  Tag
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

const menuItems = [
  { icon: LayoutDashboard, label: "Áttekintés", href: "/admin" },
  { icon: ShoppingCart, label: "Rendelések", href: "/admin/orders" },
  { icon: FileEdit, label: "CMS", href: "/admin/cms" },
  { icon: Mail, label: "Emailek", href: "/admin/emails" },
  { icon: Package, label: "Kategóriák", href: "/admin/categories" },
  { icon: Package, label: "Termékek", href: "/admin/products" },
  { icon: Truck, label: "Szállítás", href: "/admin/shipping" },
  { icon: CreditCard, label: "Fizetés", href: "/admin/payment" },
  { icon: Tag, label: "Kuponok", href: "/admin/coupons" },
  { icon: BarChart3, label: "Statisztikák", href: "/admin/stats" },
  { icon: Settings, label: "Beállítások", href: "/admin/info" },
  { icon: Users, label: "Vásárlók", href: "/admin/users" },
  { icon: MessageSquare, label: "Vélemények", href: "/admin/reviews" },
]

export function AdminSidebar({ className, onAction }: { className?: string, onAction?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className={cn("h-full flex flex-col bg-[#0A0A0B]", className)}>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group" onClick={onAction}>
          <div className="w-10 h-10 rounded-none bg-accent flex items-center justify-center font-black text-white italic shadow-lg shadow-accent/20 transition-all duration-300 group-hover:rounded-full">
            K
          </div>
          <span className="text-2xl font-heading font-black tracking-tight text-white uppercase italic">
            Krausz <span className="text-accent underline decoration-accent/20 underline-offset-4">Admin</span>
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
              onClick={onAction}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all duration-300",
                isActive 
                  ? "bg-accent text-white shadow-lg shadow-accent/10" 
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-neutral-600")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          <ShoppingCart className="w-5 h-5" />
          Vissza a boltba
        </Link>
        
        <button 
          onClick={() => {
            if (onAction) onAction();
            signOut({ callbackUrl: "/" });
          }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          Kijelentkezés
        </button>
      </div>
    </div>
  )
}

