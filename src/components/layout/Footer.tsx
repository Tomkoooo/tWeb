"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSession, signIn } from "next-auth/react"
import { toast } from "sonner"

type LegalLink = {
  key: "impresszum" | "terms" | "gdpr"
  title: string
  href: string
}

export function Footer() {
  const { data: session } = useSession()
  const [newsletterEmail, setNewsletterEmail] = React.useState("")
  const [newsletterLoading, setNewsletterLoading] = React.useState(false)
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState(false)
  const [legalLinks, setLegalLinks] = React.useState<LegalLink[]>([])

  React.useEffect(() => {
    if (session?.user?.email) {
      setNewsletterEmail(session.user.email)
    }
  }, [session?.user?.email])

  React.useEffect(() => {
    const loadSubscription = async () => {
      if (!session?.user) {
        setNewsletterSubscribed(false)
        return
      }
      try {
        const response = await fetch("/api/user/profile")
        if (!response.ok) return
        const data = await response.json()
        setNewsletterSubscribed(Boolean(data.newsletterSubscribed))
      } catch {
        // no-op
      }
    }
    loadSubscription()
  }, [session?.user])

  React.useEffect(() => {
    const loadLegalLinks = async () => {
      try {
        const response = await fetch("/api/legal-docs")
        if (!response.ok) return
        const data = await response.json()
        setLegalLinks(data)
      } catch {
        // Silent fail in footer, links are optional until admin uploads docs
      }
    }
    loadLegalLinks()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!session?.user) {
      signIn("google")
      return
    }

    setNewsletterLoading(true)
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || "Nem sikerült a feliratkozás.")
        return
      }

      toast.success("Sikeres hírlevél feliratkozás.")
      setNewsletterSubscribed(true)
    } catch {
      toast.error("Hálózati hiba történt.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <footer className="bg-black pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-[#FF5500]/5 blur-[150px] opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Company Info */}
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.jpg"
                  alt="Krausz Barkácsmester"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-heading font-black text-white tracking-[0.2em] uppercase">
                KRAUSZ
              </span>
            </Link>
            <p className="text-neutral-500 text-lg leading-relaxed">
              Az erő, a tartósság és a magyar mesterség jelképe. Professzionális szerszámok azoknak, akik nem ismernek kompromisszumot.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <Button key={i} variant="ghost" size="icon" className="w-12 h-12 rounded-none bg-white/5 border border-white/5 text-neutral-400 hover:text-[#FF5500] hover:bg-white/10 transition-all">
                  <Icon className="w-6 h-6" />
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-white font-heading font-black text-xl uppercase tracking-widest">Linkek</h3>
            <ul className="space-y-5">
              {[
                { label: "Kezdőlap", href: "#home" },
                { label: "Rólunk", href: "#about" },
                { label: "Termékek", href: "#shop" },
                { label: "Vélemények", href: "#reviews" },
                { label: "Kapcsolat", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-neutral-400 hover:text-white transition-colors text-base font-bold uppercase tracking-widest">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            <h3 className="text-white font-heading font-black text-xl uppercase tracking-widest">Kategóriák</h3>
            <ul className="space-y-5">
              {["Kalapácsok", "Csavarkulcsok", "Elektromos Szerszámok", "Védőfelszerelés"].map((item) => (
                <li key={item}>
                  <Link href="#shop" className="text-neutral-400 hover:text-white transition-colors text-base font-bold uppercase tracking-widest">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="text-white font-heading font-black text-xl uppercase tracking-widest">Kapcsolat</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-5 text-neutral-400">
                <MapPin className="w-6 h-6 text-[#FF5500] shrink-0" />
                <span className="text-base font-medium">123 Ipari Út, Mesterváros, Magyarország</span>
              </li>
              <li className="flex items-center gap-5 text-neutral-400">
                <Phone className="w-6 h-6 text-[#FF5500] shrink-0" />
                <span className="text-base font-medium">+36 1 234 5678</span>
              </li>
              <li className="flex items-center gap-5 text-neutral-400">
                <Mail className="w-6 h-6 text-[#FF5500] shrink-0" />
                <span className="text-base font-medium uppercase tracking-tighter">iroda@krausz-mester.hu</span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Hírlevél</p>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email címed"
                className="w-full h-11 bg-black border border-white/10 px-3 text-white text-sm focus:outline-none focus:border-accent"
                disabled={Boolean(session?.user?.email)}
              />
              <Button
                type="submit"
                disabled={newsletterLoading || newsletterSubscribed}
                className="w-full h-11 rounded-none bg-accent hover:bg-accent/85 text-white text-[10px] font-black uppercase tracking-widest"
              >
                {session?.user
                  ? newsletterSubscribed
                    ? "Már feliratkoztál"
                    : "Feliratkozás a hírlevélre"
                  : "Bejelentkezés és feliratkozás"}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="bg-white/5 mb-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-neutral-600 text-sm font-bold tracking-widest text-center md:text-left">
            © {new Date().getFullYear()} KRAUSZ BARKÁCSMESTER. MINDEN JOG FENNTARTVA.
          </p>
          <div className="flex gap-8 text-xs font-black text-neutral-600 uppercase tracking-widest">
            {legalLinks.find((l) => l.key === "gdpr") ? (
              <Link href={legalLinks.find((l) => l.key === "gdpr")!.href} className="hover:text-white transition-colors" target="_blank">
                GDPR
              </Link>
            ) : null}
            {legalLinks.find((l) => l.key === "terms") ? (
              <Link href={legalLinks.find((l) => l.key === "terms")!.href} className="hover:text-white transition-colors" target="_blank">
                Feltételek
              </Link>
            ) : null}
            {legalLinks.find((l) => l.key === "impresszum") ? (
              <Link href={legalLinks.find((l) => l.key === "impresszum")!.href} className="hover:text-white transition-colors" target="_blank">
                Impresszum
              </Link>
            ) : null}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="w-14 h-14 rounded-none bg-white/5 border-white/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white transition-all shadow-2xl"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </footer>
  )
}
