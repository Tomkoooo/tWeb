import clientPromise from "@/lib/mongodb"

export const BOOTSTRAP_ADMIN_ENV = "BOOTSTRAP_ADMIN_EMAILS"

let warnedAboutLeftoverEnv = false

/** Parse comma-, semicolon-, or newline-separated admin allowlist from env. */
export function parseBootstrapAdminEmails(value: string | undefined): string[] {
  if (!value?.trim()) return []

  const seen = new Set<string>()
  const emails: string[] = []

  for (const part of value.split(/[,;\n]+/)) {
    const email = part.trim().toLowerCase()
    if (!email || seen.has(email)) continue
    seen.add(email)
    emails.push(email)
  }

  return emails
}

export function getBootstrapAdminEmails(): string[] {
  return parseBootstrapAdminEmails(process.env[BOOTSTRAP_ADMIN_ENV])
}

/**
 * Promote the signing-in user to ADMIN when their email is on
 * `BOOTSTRAP_ADMIN_EMAILS` (comma-separated allowlist). Idempotent and safe
 * to call on every sign-in.
 *
 * Every allowlisted email is promoted on first login while the env var is set.
 * Once at least one ADMIN exists, a one-time warning reminds operators to
 * remove the env var after onboarding.
 */
export async function maybeBootstrapAdmin(email: string | undefined | null): Promise<void> {
  const allowlist = getBootstrapAdminEmails()
  if (allowlist.length === 0) return
  const candidateEmail = (email || "").trim().toLowerCase()
  if (!candidateEmail || !allowlist.includes(candidateEmail)) return

  try {
    const client = await clientPromise
    const db = client.db()
    const users = db.collection("users")

    const existingAdmin = await users.findOne({ role: "ADMIN" })
    if (existingAdmin && !warnedAboutLeftoverEnv) {
      warnedAboutLeftoverEnv = true
      console.warn(
        `[bootstrap-admin] ${BOOTSTRAP_ADMIN_ENV} is set but at least one ADMIN already exists. Remove ${BOOTSTRAP_ADMIN_ENV} from the environment after onboarding.`
      )
    }

    const candidateUser = await users.findOne({ email: candidateEmail })
    if (!candidateUser || candidateUser.role === "ADMIN") return

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
