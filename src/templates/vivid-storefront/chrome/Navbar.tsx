"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Menu, Search } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { cn } from "@/lib/utils"
import type { ChromeProps } from "@/templates/types"

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Journal", href: "/#journal" },
  { name: "Contact", href: "/#contact" },
]

export function Navbar({ brandName, logoSrc }: ChromeProps) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all",
          scrolled
            ? "border-primary/20 bg-primary/95 backdrop-blur-md py-3"
            : "border-transparent bg-primary py-5"
        )}
      >
        <div className="container mx-auto flex items-center justify-between gap-6 px-4">
          <Link href="/" className="group flex items-center gap-3">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt={brandName}
                className="h-8 w-auto rounded-sm bg-white/10 p-1"
              />
            ) : null}
            <span className="text-xl font-black uppercase tracking-tight text-primary-foreground">
              {brandName}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-bold uppercase tracking-wider text-primary-foreground/85 transition hover:text-primary-foreground"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-accent transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="/shop" aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="/cart" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] border-l-0 bg-secondary text-secondary-foreground sm:max-w-md"
              >
                <div className="flex h-full flex-col gap-10 px-6 pt-16">
                  <p className="text-2xl font-black uppercase tracking-tight">
                    {brandName}
                  </p>
                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-3xl font-black uppercase tracking-tight transition hover:text-primary"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
      <ScrollMarquee />
    </>
  )
}

function CartBadge() {
  const [mounted, setMounted] = React.useState(false)
  const totalItems = useCartStore((state: { totalItems: number }) => state.totalItems)
  React.useEffect(() => setMounted(true), [])
  if (!mounted || totalItems === 0) return null
  return (
    <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center border-none bg-accent p-0 text-[10px] font-black text-accent-foreground">
      {totalItems}
    </Badge>
  )
}

function ScrollMarquee() {
  const items = ["FREE SHIPPING OVER 25 000 HUF", "30-DAY RETURNS", "INDEPENDENT MAKERS", "MADE WITH CARE"]
  const repeated = [...items, ...items, ...items, ...items]
  return (
    <div className="overflow-hidden border-b border-border bg-secondary text-secondary-foreground">
      <motion.div
        className="flex gap-12 whitespace-nowrap py-2 text-xs font-bold uppercase tracking-[0.3em] will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-12 text-secondary-foreground/80">
            <span>{item}</span>
            <span aria-hidden className="text-accent">★</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
