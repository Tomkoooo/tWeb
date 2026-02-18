import { DefaultSession } from "next-auth"

// Define Role type since Prisma is removed
type Role = "USER" | "ADMIN"

declare module "next-auth" {
  interface Session {
    user: {
      role: Role
    } & DefaultSession["user"]
  }
 
  interface User {
    role: Role
  }
}


declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: "USER" | "ADMIN"
  }
}

