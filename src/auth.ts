import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { authConfig } from "./auth.config"
import { maybeBootstrapAdmin } from "@/lib/bootstrap-admin"
import { OrderGuestAccessService } from "@/services/order-guest-access"

const trustHost = process.env.AUTH_TRUST_HOST
  ? process.env.AUTH_TRUST_HOST === "true"
  : process.env.NODE_ENV !== "production"

function safeOrigin(value?: string) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function safeMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return undefined
  }

  const candidate = metadata as Record<string, unknown>
  return {
    provider: typeof candidate.provider === "string" ? candidate.provider : undefined,
    message: typeof candidate.message === "string" ? candidate.message : undefined,
    name: typeof candidate.name === "string" ? candidate.name : undefined,
    type: typeof candidate.type === "string" ? candidate.type : undefined,
    callbackUrlOrigin: safeOrigin(
      typeof candidate.callbackUrl === "string" ? candidate.callbackUrl : undefined
    ),
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  trustHost,
  ...authConfig,
  logger: {
    error(error) {
      const authError = error as Error & {
        type?: string
        code?: string
        cause?: unknown
      }
      const errorCode = authError.type || authError.code || authError.name
      const metadata = safeMetadata(authError.cause)

      if (errorCode === "InvalidCheck") {
        console.error("[auth][diagnostic] InvalidCheck during OAuth check", {
          code: errorCode,
          trustHost,
          authUrlOrigin: safeOrigin(process.env.AUTH_URL),
          nextauthUrlOrigin: safeOrigin(process.env.NEXTAUTH_URL),
          ...metadata,
        })
        return
      }

      console.error("[auth][error]", errorCode, metadata)
    },
  },
  events: {
    async signIn({ user }) {
      const userId = user.id?.trim()
      const email = user.email?.trim()
      if (!userId || !email) return
      try {
        await OrderGuestAccessService.linkGuestOrdersToUser(userId, email)
      } catch (error) {
        console.error("[auth] link guest orders failed", error)
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      // Fetch the latest user data from the database to ensure the role is up to date
      // even if the JWT token is old.
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }

        session.user.role = (token.role as "ADMIN" | "USER") || "USER"

        const lookupEmail = typeof token.email === "string" ? token.email : session.user.email

        if (!lookupEmail) {
          return session
        }

        await maybeBootstrapAdmin(lookupEmail)

        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection("users").findOne({ email: lookupEmail });
          
          if (dbUser) {
            if (dbUser._id) {
              session.user.id = String(dbUser._id);
            }
            if (dbUser.role) {
              session.user.role = dbUser.role as "ADMIN" | "USER";
            }
          }
        } catch (error) {
          console.error("Error fetching user role from DB:", error);
        }
      }
      return session;
    },
  },
})



