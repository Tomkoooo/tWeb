import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isExcludedRoute = req.nextUrl.pathname.startsWith("/api/auth");
  if (isExcludedRoute) {
    return NextResponse.next();
  }
  
  const isLoggedIn = !!req.auth
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin")
  const isAuthPath = req.nextUrl.pathname === "/api/auth/signin"

  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
    }
    // @ts-ignore
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
