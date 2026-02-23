"use client"

import { SessionProvider } from "next-auth/react"
import { CartSync } from "./cart/CartSync"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
    </SessionProvider>
  )
}
