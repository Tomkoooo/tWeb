"use client"

import { createContext, useContext } from "react"
import type { HomepageBlock, HomepageSnapshot } from "@/features/homepage-cms/types/block-types"

type CmsEditContextValue = {
  enabled: boolean
  snapshot: HomepageSnapshot | null
  updateField: (blockType: HomepageBlock["type"], field: string, value: unknown) => void
}

const CmsEditContext = createContext<CmsEditContextValue>({
  enabled: false,
  snapshot: null,
  updateField: () => undefined,
})

export function CmsEditProvider({
  enabled,
  snapshot,
  updateField,
  children,
}: {
  enabled: boolean
  snapshot: HomepageSnapshot | null
  updateField: CmsEditContextValue["updateField"]
  children: React.ReactNode
}) {
  return (
    <CmsEditContext.Provider value={{ enabled, snapshot, updateField }}>
      {children}
    </CmsEditContext.Provider>
  )
}

export function useCmsEdit() {
  return useContext(CmsEditContext)
}

