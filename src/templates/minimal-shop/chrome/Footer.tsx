import Link from "next/link"
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
  const topLevelCategories = categories.filter((c) => c.depth === 0).slice(0, 6)
  return (
    <footer className="border-t border-border bg-surface py-16 text-surface-foreground">
      <div className="container mx-auto grid gap-12 px-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl font-semibold tracking-tight">{brandName}</p>
          {address ? <p className="mt-3 max-w-sm text-sm text-muted-foreground">{address}</p> : null}
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {email ? <p>{email}</p> : null}
            {phone ? <p>{phone}</p> : null}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/shop" className="hover:text-foreground">
                All products
              </Link>
            </li>
            {topLevelCategories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-foreground">
                Account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 border-t border-border px-4 pt-6 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {brandName}
      </div>
    </footer>
  )
}
