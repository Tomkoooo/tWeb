"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { ChevronDown, Menu, Phone, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChromeProps } from "@/templates/types"
import { KeramiaBrandLogo } from "../components/KeramiaBrandLogo"
import {
  CAMPAIGN_LINKS,
  KERAMIA_PHONE,
  KERAMIA_PHONE_HREF,
} from "../lib/constants"
import { ChromeAuthActions } from "./ChromeAuthActions"
import "../keramia-dental.css"

export function Navbar({
  logoSrc,
  cmsChromePreview,
}: ChromeProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [campaignsOpen, setCampaignsOpen] = useState(false)
  const mobilePanelId = useId()
  const isHome = pathname === "/"
  const activeCampaign = CAMPAIGN_LINKS.find((c) => pathname === c.href)

  const closeMobile = () => setMobileOpen(false)
  const contactHref = activeCampaign ? `${activeCampaign.href}#kapcsolat` : "/fogfeherites#kapcsolat"

  useEffect(() => {
    if (!mobileOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        "keramia-chrome-header z-50 text-[#fffdf9]",
        cmsChromePreview ? "relative" : "fixed inset-x-0 top-0"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <KeramiaBrandLogo href="/" logoSrc={logoSrc} onClick={closeMobile} />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Fő navigáció">
          <Link
            href="/"
            className={cn(
              "keramia-display text-sm tracking-wider transition-colors hover:text-primary",
              isHome ? "text-primary" : "text-[#fffdf9]/90"
            )}
          >
            Kezdőlap
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setCampaignsOpen(true)}
            onMouseLeave={() => setCampaignsOpen(false)}
          >
            <button
              type="button"
              className="keramia-display inline-flex items-center gap-1 text-sm tracking-wider text-[#fffdf9]/90 hover:text-primary"
              aria-expanded={campaignsOpen}
            >
              Akciók
              <ChevronDown className={cn("h-4 w-4 transition", campaignsOpen && "rotate-180")} />
            </button>
            {campaignsOpen ? (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="min-w-[280px] rounded-lg border border-primary/15 bg-[#1f1916] py-2 shadow-2xl">
                  {CAMPAIGN_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 text-sm text-[#fffdf9]/85 transition hover:bg-primary/10 hover:text-primary",
                        pathname === item.href && "text-primary"
                      )}
                    >
                      <span className="keramia-display block text-[10px] uppercase tracking-widest text-primary/80">
                        {item.promoBadge}
                      </span>
                      {item.labelHu}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <a
            href={KERAMIA_PHONE_HREF}
            className="keramia-display hidden items-center gap-2 text-sm tracking-wide text-primary transition hover:text-[#fffdf9] xl:flex"
          >
            <Phone className="h-4 w-4" />
            {KERAMIA_PHONE}
          </a>
          <Link href={contactHref} className="keramia-btn-primary hidden px-5 py-3 sm:inline-flex">
            Kérek időpontot
          </Link>
          <ChromeAuthActions cmsChromePreview={cmsChromePreview} />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={contactHref} className="keramia-btn-primary hidden px-4 py-2.5 text-[10px] sm:inline-flex">
            Időpont
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-primary hover:text-[#fffdf9]"
            aria-label={mobileOpen ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={mobileOpen}
            aria-controls={mobilePanelId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Menü bezárása"
            className="fixed inset-0 top-20 z-40 bg-black/50 lg:hidden"
            onClick={closeMobile}
          />
          <nav
            id={mobilePanelId}
            aria-label="Mobil navigáció"
            className="relative z-50 border-t border-primary/10 bg-[#120d0b] px-4 py-6 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeMobile}
                className="keramia-display min-h-11 rounded-md px-3 py-2 text-sm tracking-wider hover:bg-primary/10"
              >
                Kezdőlap
              </Link>
              <p className="keramia-display px-3 pt-4 text-[10px] font-bold uppercase tracking-widest text-primary">
                Nyári akciók
              </p>
              {CAMPAIGN_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className="min-h-11 rounded-md px-3 py-2 text-sm text-[#fffdf9]/85 hover:bg-primary/10 hover:text-primary"
                >
                  {item.labelHu}
                </Link>
              ))}
              <a
                href={KERAMIA_PHONE_HREF}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-primary"
              >
                <Phone className="h-4 w-4" />
                {KERAMIA_PHONE}
              </a>
              <Link href={contactHref} onClick={closeMobile} className="keramia-btn-primary mt-4 w-full">
                Kérek időpontot
              </Link>
              <div className="pt-4">
                <ChromeAuthActions cmsChromePreview={cmsChromePreview} />
              </div>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  )
}
