import type { HomepageSnapshot } from "@/features/homepage-cms/types/block-types"

export async function saveHomepageDraft(snapshot: HomepageSnapshot) {
  const response = await fetch("/api/admin/homepage/draft", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(snapshot),
  })

  if (!response.ok) {
    throw new Error("Failed to save homepage draft")
  }
}
