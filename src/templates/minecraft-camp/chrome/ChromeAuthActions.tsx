"use client"

import Link from "next/link"
import { useSession, signIn } from "next-auth/react"

type ChromeAuthActionsProps = {
  className?: string
  /** Footer vs navbar styling */
  variant?: "footer" | "nav"
}

export function ChromeAuthActions({ className = "", variant = "footer" }: ChromeAuthActionsProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return null
  }

  const baseClass =
    variant === "footer"
      ? "font-minecraft-body text-xs underline hover:text-[#78B7FF] transition-colors"
      : "font-minecraft text-[8px] text-white/90 hover:underline"

  if (session?.user?.role === "ADMIN") {
    return (
      <Link href="/admin/plugins/camp-booking" className={`${baseClass} ${className}`}>
        Admin megnyitása
      </Link>
    )
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        className={`${baseClass} ${className} bg-transparent border-0 p-0 cursor-pointer text-left`}
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Bejelentkezés
      </button>
    )
  }

  return null
}
