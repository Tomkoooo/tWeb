import Link from "next/link"
import type { ChromeProps } from "@/templates/types"

export function Navbar({ brandName, logoSrc }: ChromeProps) {
  return (
    <header className="minecraft-nav border-b-4 border-[#3d2817] bg-[#5D9B38] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" className="h-10 w-10 object-contain pixelated" />
          ) : null}
          <span className="font-minecraft text-sm text-white drop-shadow-[2px_2px_0_#2d5016]">
            {brandName}
          </span>
        </Link>
        <nav className="flex gap-4">
          <Link
            href="/#taborok"
            className="font-minecraft-body text-sm text-white font-bold hover:underline"
          >
            Táborok
          </Link>
        </nav>
      </div>
    </header>
  )
}
