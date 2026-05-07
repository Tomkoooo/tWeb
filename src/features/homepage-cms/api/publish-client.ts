export async function publishHomepageDraft() {
  const response = await fetch("/api/admin/homepage/publish", { method: "POST" })
  if (!response.ok) throw new Error("Failed to publish homepage")
}

export async function discardHomepageDraft() {
  const response = await fetch("/api/admin/homepage/discard", { method: "POST" })
  if (!response.ok) throw new Error("Failed to discard homepage draft")
  return response.json()
}
