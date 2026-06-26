import type { RenderProps, HomePageDeps } from "@/templates/types"
import { KeramiaRoot } from "../../components/KeramiaRoot"
import type { HomeContent } from "./schema"
import { KeramiaCampaignHub } from "./blocks/KeramiaCampaignHub"
import { RealHomepageSections } from "@/features/homepage-cms/render/RealHomepageSections"

export function HomeRender({ content, deps }: RenderProps<HomeContent, HomePageDeps>) {
  const hasBlocks = content.blocks?.some((b) => b.enabled !== false)

  return (
    <KeramiaRoot>
      {hasBlocks ? (
        <RealHomepageSections snapshot={content} dependencies={deps} />
      ) : (
        <KeramiaCampaignHub />
      )}
    </KeramiaRoot>
  )
}
