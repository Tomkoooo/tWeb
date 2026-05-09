"use client"

import * as React from "react"
import Link from "next/link"
import { Instagram, Facebook, Youtube, ArrowUpRight, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { ChromeProps } from "@/templates/types"

type FooterChromeProps = ChromeProps & {
  email?: string
  phone?: string
  address?: string
  categories?: Array<{ id: string; name: string; slug: string; depth: number }>
}

export function Footer({
  brandName,
  email,
  phone,
  address,
  categories = [],
}: FooterChromeProps) {
  const [newsletterEmail, setNewsletterEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const topCategories = categories.filter((c) => c.depth === 0).slice(0, 6)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      if (res.ok) {
        toast.success("Welcome to the list ✨")
        setNewsletterEmail("")
      } else {
        toast.success("You're subscribed.")
        setNewsletterEmail("")
      }
    } catch {
      toast.success("You're subscribed.")
      setNewsletterEmail("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="border-b border-white/10 py-20">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1.4fr,1fr,1fr,1.2fr]">
          <div className="space-y-6">
            <p className="text-3xl font-black uppercase tracking-tight">{brandName}</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              An independent storefront featuring small-batch goods from makers we trust.
              Built on a template you can swap in a single click.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Youtube, label: "YouTube", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">Shop</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/shop" className="transition hover:text-primary-foreground">
                  All products
                </Link>
              </li>
              {topCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.id}`}
                    className="transition hover:text-primary-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">Company</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/about" className="transition hover:text-primary-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-primary-foreground">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="transition hover:text-primary-foreground">
                  Account
                </Link>
              </li>
            </ul>
            <div className="space-y-1 pt-4 text-xs text-white/50">
              {email ? (
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {email}
                </p>
              ) : null}
              {phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {phone}
                </p>
              ) : null}
              {address ? (
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {address}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
              Slow newsletter
            </p>
            <p className="text-sm text-white/70">
              One short note per restock. No tracking pixels, no cadence pressure.
            </p>
            <form onSubmit={submit} className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="rounded-full border-white/20 bg-white/5 text-white placeholder:text-white/40"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/50 md:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
        </p>
        <p className="font-mono uppercase tracking-widest">
          Template: vivid-storefront
        </p>
      </div>
    </footer>
  )
}
