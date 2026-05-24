import { redirect } from "next/navigation"

export default function AdminContactEmailsRedirect() {
  redirect("/admin/cms/settings?section=contact")
}
