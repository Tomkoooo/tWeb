import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import { isShopAdminPath, isShopEnabled, isShopPublicPath } from "@/lib/features/shop"
import {
  getCachedMaintenanceEnabled,
  setCachedMaintenanceEnabled,
} from "@/lib/maintenance-flag-cache"

const { auth } = NextAuth(authConfig)
const PUBLIC_FILE_REGEX = /\.[^/]+$/

async function fetchMaintenanceEnabled(origin: string): Promise<boolean> {
  try {
    const response = await fetch(`${origin}/api/feature-flags/maintenance`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      return false
    }

    const payload = await response.json()
    const enabled = payload.enabled === true
    setCachedMaintenanceEnabled(enabled)
    return enabled
  } catch (error) {
    console.error("Maintenance flag fetch error:", error)
    return false
  }
}

async function isMaintenanceEnabled(origin: string): Promise<boolean> {
  const cached = getCachedMaintenanceEnabled()
  if (cached !== null) {
    return cached
  }
  return fetchMaintenanceEnabled(origin)
}

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname
  const isGoogleCallback = pathname.startsWith("/api/auth/callback/google")
  const isAuthRoute = pathname.startsWith("/api/auth")
  const isMaintenancePath = pathname === "/maintenance"
  const isNextInternal = pathname.startsWith("/_next")
  const isStaticAsset = pathname === "/favicon.ico" || PUBLIC_FILE_REGEX.test(pathname)

  if (isGoogleCallback) {
    const host = req.headers.get("host")
    const forwardedHost = req.headers.get("x-forwarded-host")
    const forwardedProto = req.headers.get("x-forwarded-proto")
    console.info("[auth][diagnostic] Google callback request", {
      pathname,
      host,
      forwardedHost,
      forwardedProto,
      nextUrlOrigin: req.nextUrl.origin,
    })
  }

  if (isAuthRoute || isMaintenancePath || isNextInternal || isStaticAsset) {
    return NextResponse.next()
  }

  const maintenanceEnabled = await isMaintenanceEnabled(req.nextUrl.origin)
  const isAdminUser = req.auth?.user?.role === "ADMIN"
  if (maintenanceEnabled && !isAdminUser) {
    return NextResponse.redirect(new URL("/maintenance", req.nextUrl))
  }

  const isLoggedIn = !!req.auth
  const isAdminPath = pathname.startsWith("/admin")

  if (isAdminPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
  }

  if (!isShopEnabled()) {
    if (isShopPublicPath(pathname)) {
      return new NextResponse(null, { status: 404 })
    }
    if (isAdminUser && isShopAdminPath(pathname)) {
      return new NextResponse(null, { status: 404 })
    }
  }

  const previewCookie = req.cookies.get("wse_template_preview")
  if (previewCookie && !isAdminUser) {
    const response = NextResponse.next()
    response.cookies.delete("wse_template_preview")
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
