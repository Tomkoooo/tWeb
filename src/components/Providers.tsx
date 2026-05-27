"use client"

import { lazy, Suspense, type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { CartSync } from "./cart/CartSync"
import { AnalyticsProvider } from "./analytics/AnalyticsProvider"
import { CookieConsentBanner } from "./consent/CookieConsentBanner"
import { ChunkLoadRecovery } from "./ChunkLoadRecovery"

const DevMetricsClient = lazy(() =>
  import("./dev/DevMetricsClient").then((module) => ({
    default: module.DevMetricsClient,
  }))
)

export function Providers({
  children,
  devMetricsEnabled = false,
}: {
  children: ReactNode
  devMetricsEnabled?: boolean
}) {
  return (
    <SessionProvider refetchOnWindowFocus>
      <AnalyticsProvider>
        <ChunkLoadRecovery />
        {devMetricsEnabled ? (
          <Suspense fallback={null}>
            <DevMetricsClient enabled />
          </Suspense>
        ) : null}
        <CartSync />
        {children}
        <CookieConsentBanner />
      </AnalyticsProvider>
    </SessionProvider>
  )
}
