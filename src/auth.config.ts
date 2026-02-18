import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

type Role = "ADMIN" | "USER"

export const authConfig = {
  providers: [Google],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as Role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
} satisfies NextAuthConfig

