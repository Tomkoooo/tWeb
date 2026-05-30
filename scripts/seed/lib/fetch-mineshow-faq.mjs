/**
 * Scrape FAQ accordions from https://mineshow.hu/tabor (SvelteKit page data).
 */

const TABOR_URL = "https://mineshow.hu/tabor"
const FAQ_MARKER = 'properties:{title:"Gyakori Kérdések",items:'

/** Normalize known typos on the live mineshow.hu page. */
function normalizeFaqText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/MInden/g, "Minden")
    .replace(/\bniytva\b/gi, "nyitva")
    .replace(/\bleszenek\b/gi, "lesznek")
    .replace(/\bnyitkozat\b/gi, "nyilatkozat")
    .replace(/Saját lapotopnak/gi, "Saját laptopnak")
    .replace(/rendszer követelménye/gi, "rendszerkövetelménye")
    .replace(/\bMInecraft\b/g, "Minecraft")
    .replace(/\bturus\b/gi, "turnus")
    .replace(/kezdésééig/g, "kezdéséig")
    .trim()
}

function stripHtml(html) {
  return normalizeFaqText(
    String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
  )
}

function parseFaqItemsArray(html) {
  const idx = html.indexOf(FAQ_MARKER)
  if (idx < 0) {
    throw new Error("FAQ block not found on mineshow.hu/tabor")
  }
  let i = idx + FAQ_MARKER.length
  if (html[i] !== "[") {
    throw new Error("FAQ items array not found")
  }
  let depth = 0
  const start = i
  for (; i < html.length; i++) {
    const c = html[i]
    if (c === "[") depth++
    else if (c === "]") {
      depth--
      if (depth === 0) {
        const arrStr = html.slice(start, i + 1)
        const items = Function(`"use strict"; return (${arrStr})`)()
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("FAQ items empty")
        }
        return items.map((item) => ({
          title: normalizeFaqText(item.title || ""),
          content: stripHtml(item.contents),
        }))
      }
    }
  }
  throw new Error("Unterminated FAQ items array")
}

/** @returns {Promise<Array<{ title: string, content: string }>>} */
export async function fetchMineshowFaq(url = TABOR_URL) {
  const res = await fetch(url, {
    headers: { "User-Agent": "webshop-engine-seed/1.0" },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status})`)
  }
  const html = await res.text()
  return parseFaqItemsArray(html)
}
