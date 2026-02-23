"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, Search, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

import { UserNav } from "./UserNav"
import { LiveSearch } from "./LiveSearch"
import { useCartStore } from "@/store/useCartStore"

const navLinks = [
  { name: "Rólunk", href: "/#about" },
  { name: "Bolt", href: "/shop" },
  { name: "Vélemények", href: "/#reviews" },
  { name: "Kapcsolat", href: "/#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/95 backdrop-blur-2xl border-b border-white/5 py-4"
          : "bg-transparent py-10"
      )}
    >
      <div className="container mx-auto flex items-center">
        {/* Left: Logo */}
        <div className="flex-none">
          <Link href="/" className="flex items-center gap-6 group">
            <div className="relative w-12 h-12 lg:w-14 lg:h-14">
              <Image
                src="/logo.jpg"
                alt="Krausz Logó"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl lg:text-2xl font-heading font-black text-white tracking-[0.3em] group-hover:text-[#FF5500] transition-colors hidden sm:block uppercase">
              KRAUSZ
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-14 mx-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[11px] font-black text-neutral-400 hover:text-white transition-colors relative group uppercase tracking-[0.25em] whitespace-nowrap"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#FF5500] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex flex-none items-center gap-6 lg:gap-10">
          <div className="hidden lg:block">
            <LiveSearch className="w-48 lg:w-40 xl:w-48 focus-within:w-64 transition-all duration-300" />
          </div>

          <Button asChild variant="ghost" size="icon" className="relative group p-0 w-10 h-10 hover:bg-transparent">
            <Link href="/cart">
              <ShoppingCart className="w-6 h-6 text-white group-hover:text-[#FF5500] transition-colors" />
              <CartCountBadge />
            </Link>
          </Button>

          {/* User Auth Nav */}
          <UserNav />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden lg:hidden p-0 w-10 h-10 ml-2">
                <Menu className="w-8 h-8 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-white/10 w-full sm:max-w-md">
              <div className="flex flex-col gap-10 mt-20 px-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-3xl font-heading font-black text-white hover:text-[#FF5500] transition-colors uppercase tracking-widest"
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="mt-10">
                   <LiveSearch 
                    placeholder="KERESÉS..." 
                    inputClassName="h-16 text-lg"
                   />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

function CartCountBadge() {
  const [mounted, setMounted] = React.useState(false)
  const totalItems = useCartStore((state: any) => state.totalItems)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (totalItems === 0) return null

  return (
    <Badge className="absolute -top-1 -right-1 bg-[#FF5500] text-white border-none text-[10px] w-5 h-5 flex items-center justify-center p-0 font-black">
      {totalItems}
    </Badge>
  )
}
