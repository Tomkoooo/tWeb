import clientPromise from "@/lib/mongodb"

export const BOOTSTRAP_ADMIN_ENV = "BOOTSTRAP_ADMIN_EMAILS"

let warnedAboutLeftoverEnv = false

function parseAdminEmails(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getBootstrapAdminEmails(): string[] {
  return parseAdminEmails(process.env[BOOTSTRAP_ADMIN_ENV])
}

/**
 * Promote the signing-in user to ADMIN if their email is on the
 * BOOTSTRAP_ADMIN_EMAILS allowlist. Idempotent and safe to call on every sign-in.
 *
 * Once at least one ADMIN exists in the database, the env var is logged as a
 * leftover warning on each sign-in attempt so operators remember to remove it.
 */
export async function maybeBootstrapAdmin(email: string | undefined | null): Promise<void> {
  const allowlist = getBootstrapAdminEmails()
  if (allowlist.length === 0) return
  const candidateEmail = (email || "").trim().toLowerCase()
  if (!candidateEmail) return

  try {
    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")

    const existingAdmin = await users.findOne({ role: "ADMIN" })
    if (existingAdmin) {
      if (!warnedAboutLeftoverEnv) {
        warnedAboutLeftoverEnv = true
        console.warn(
          `[bootstrap-admin] ${BOOTSTRAP_ADMIN_ENV} is set but at least one ADMIN already exists. Remove ${BOOTSTRAP_ADMIN_ENV} from the environment to disable bootstrap.`
        )
      }
      const candidateUser = await users.findOne({ email: candidateEmail })
      if (
        candidateUser &&
        candidateUser._id?.toString() !== existingAdmin._id?.toString() &&
        candidateUser.role !== "ADMIN" &&
        allowlist.includes(candidateEmail)
      ) {
        return
      }
      return
    }

    if (!allowlist.includes(candidateEmail)) return

    const result = await users.updateOne(
      { email: candidateEmail },
      { $set: { role: "ADMIN" } }
    )
    if (result.matchedCount > 0) {
      console.info(
        `[bootstrap-admin] Promoted '${candidateEmail}' to ADMIN via ${BOOTSTRAP_ADMIN_ENV}.`
      )
    }
  } catch (error) {
    console.error("[bootstrap-admin] Failed to bootstrap admin role:", error)
  }
}
