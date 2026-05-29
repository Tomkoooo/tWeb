import Link from "next/link"
import type { ChromeProps } from "@/templates/types"
import { ChromeAuthActions } from "./ChromeAuthActions"
type FooterProps = ChromeProps & {
  email?: string
  address?: string
  legalLinks?: Array<{ key: string; title: string; href: string }>
}

const DEFAULT_LINKS = [
  { title: "Gyakori kérdések", href: "/#faq" },
  { title: "Jegyvásárlás", href: "/jegyvasarlas" },
]

export function Footer({
  brandName,
  logoSrc,
  email = "event@playit.hu",
  address,
  legalLinks = [],
}: FooterProps) {
  const displayAddress = address || ""
  const links = legalLinks.length > 0 ? legalLinks : DEFAULT_LINKS

  return (
    <footer className="bg-[#4e311f] border-t-4 border-[#2d1810] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt={brandName}
              className="h-12 mx-auto object-contain pixelated mb-4"
            />
          ) : (
            <p className="font-minecraft text-sm text-[#78B7FF] mb-4">MINESHOW</p>
          )}
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-minecraft-body text-xs underline"
              aria-label="Facebook"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-minecraft-body text-xs underline"
              aria-label="Instagram"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 font-minecraft-body text-xs text-white/90">
          <div>
            <p className="font-semibold mb-2">A Mineshow szervezője</p>
            <p>PlayIT Entertainment Kft.</p>
            <p className="mt-2">Székhely: 1135 Budapest, Szegedi út 37-39.</p>
            <p>Levelezési cím: 1055 Budapest, Szent István krt. 29. fsz.</p>
            <p className="mt-2">Nyitva: H–Cs, 09:00–17:00</p>
            <p className="mt-2">{displayAddress}</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Hasznos linkek</p>
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:underline">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Kapcsolat</p>
            <p>
              Ügyfélszolgálat:{" "}
              <a href={`mailto:${email}`} className="underline">
                {email}
              </a>
            </p>
            <p className="mt-4 text-white/70">
              Fizetés: SimplePay, bankkártya (Stripe)
            </p>
            <p className="mt-3">
              <ChromeAuthActions variant="footer" />
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#1a120c] py-3 text-center font-minecraft-body text-[10px] text-white/50">
        powered by webshop-engine
      </div>
    </footer>
  )
}
