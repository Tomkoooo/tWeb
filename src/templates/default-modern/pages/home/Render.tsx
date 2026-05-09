import { RealHomepageSections } from "@/features/homepage-cms/render/RealHomepageSections"
import type { RenderProps, HomePageDeps } from "@/templates/types"
import type { HomeContent } from "./schema"

export function HomeRender({ content, deps }: RenderProps<HomeContent, HomePageDeps>) {
  return <RealHomepageSections snapshot={content} dependencies={deps} />
}
