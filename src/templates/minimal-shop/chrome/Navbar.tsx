"use client"

import Link from "next/link"
import { ShoppingCart, Search } from "lucide-react"
import type { ChromeProps } from "@/templates/types"

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/#contact" },
]

export function Navbar({ brandName, logoSrc }: ChromeProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={brandName} className="h-8 w-auto" />
          ) : null}
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            {brandName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            aria-label="Search"
            className="rounded-full p-2 text-foreground/70 transition hover:bg-muted hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="rounded-full p-2 text-foreground/70 transition hover:bg-muted hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
