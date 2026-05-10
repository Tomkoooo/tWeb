import type { HomepageBlock, HomepageSnapshot } from "@/features/homepage-cms/types/block-types"

function cloneBlock<T extends HomepageBlock>(block: T): T {
  return structuredClone(block)
}

/**
 * Older saves (or migrations) sometimes dropped block types while the template baseline still declares them.
 * Re-insert missing types from **`reference`** (`template.pages.home.defaultContent`) in canonical order relative
 * to neighbours, preserving any extra blocks the merchant added (e.g. testimonials).
 */
export function insertMissingHomepageBlocks(
  persisted: HomepageSnapshot,
  reference: HomepageSnapshot
): HomepageSnapshot {
  const presentTypes = new Set(persisted.blocks.map((b) => b.type))
  const missing = reference.blocks.filter((b) => !presentTypes.has(b.type))
  if (missing.length === 0) return persisted

  const next = [...persisted.blocks]
  for (const block of missing) {
    const refIdx = reference.blocks.findIndex((b) => b.type === block.type)
    const predecessor: HomepageBlock | undefined =
      refIdx > 0 ? reference.blocks[refIdx - 1] : undefined
    const insertion = cloneBlock(block)

    if (!predecessor) {
      next.unshift(insertion)
      continue
    }

    let anchor = -1
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i]!.type === predecessor.type) {
        anchor = i
        break
      }
    }
    if (anchor === -1) {
      next.push(insertion)
    } else {
      next.splice(anchor + 1, 0, insertion)
    }
  }

  return { ...persisted, blocks: next }
}
