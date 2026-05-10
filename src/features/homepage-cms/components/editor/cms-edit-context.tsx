"use client"

import { createContext, useContext } from "react"
import type { HomepageBlock, HomepageSnapshot } from "@/features/homepage-cms/types/block-types"

type CmsEditContextValue = {
  enabled: boolean
  snapshot: HomepageSnapshot | null
  updateField: (blockType: HomepageBlock["type"], field: string, value: unknown) => void
  /** Apply several `data` keys at once on the first enabled block of this type */
  patchBlockData: (
    blockType: HomepageBlock["type"],
    patch: Record<string, unknown>
  ) => void
}

const CmsEditContext = createContext<CmsEditContextValue>({
  enabled: false,
  snapshot: null,
  updateField: () => undefined,
  patchBlockData: () => undefined,
})

export function CmsEditProvider({
  enabled,
  snapshot,
  updateField,
  patchBlockData,
  children,
}: {
  enabled: boolean
  snapshot: HomepageSnapshot | null
  updateField: CmsEditContextValue["updateField"]
  patchBlockData: CmsEditContextValue["patchBlockData"]
  children: React.ReactNode
}) {
  return (
    <CmsEditContext.Provider value={{ enabled, snapshot, updateField, patchBlockData }}>
      {children}
    </CmsEditContext.Provider>
  )
}

export function useCmsEdit() {
  return useContext(CmsEditContext)
}

