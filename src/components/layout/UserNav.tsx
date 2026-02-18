"use client"

import Link from "next/link"
import { useSession, signOut, signIn } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut, User, Package, LogIn } from "lucide-react"

export function UserNav() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
  }

  if (!session) {
    return (
      <Button 
        onClick={() => signIn("google")}
        variant="ghost" 
        className="text-xs font-black text-white hover:text-[#FF5500] hover:bg-transparent tracking-[0.2em] uppercase px-0"
      >
        <LogIn className="w-5 h-5 mr-2 sm:hidden" />
        <span className="hidden sm:inline">Bejelentkezés</span>
      </Button>
    )
  }

  const user = session.user
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-white/10 hover:border-[#FF5500]/50 transition-colors">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="bg-white/5 text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black border-white/10 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none uppercase tracking-wider">{user?.name}</p>
            <p className="text-xs leading-none text-neutral-500">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5">
            <User className="mr-2 h-4 w-4 text-[#FF5500]" />
            <span className="text-xs font-bold uppercase tracking-widest">Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders" className="cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5">
            <Package className="mr-2 h-4 w-4 text-[#FF5500]" />
            <span className="text-xs font-bold uppercase tracking-widest">Rendelések</span>
          </Link>
        </DropdownMenuItem>
        
        {/* @ts-ignore */}
        {user?.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer flex items-center gap-2 hover:bg-white/5 focus:bg-white/5">
                <LayoutDashboard className="mr-2 h-4 w-4 text-[#FF5500]" />
                <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="cursor-pointer flex items-center gap-2 text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Kijelentkezés</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
