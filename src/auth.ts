import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      // Fetch the latest user data from the database to ensure the role is up to date
      // even if the JWT token is old.
      if (session.user && token.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection("users").findOne({ email: token.email });
          
          if (dbUser && dbUser.role) {
            session.user.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error fetching user role from DB:", error);
        }
      }
      return session;
    },
  },
})



