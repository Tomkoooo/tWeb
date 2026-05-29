import { CampList } from "@/plugins/camp-booking/storefront/CampList"
import type { RenderProps, HomePageDeps } from "@/templates/types"
import type { HomeContent } from "./schema"

export function HomeRender({ content }: RenderProps<HomeContent, HomePageDeps>) {
  const heroTitle =
    (content as { blocks?: Array<{ type: string; data?: { title?: string } }> })?.blocks?.find(
      (b) => b.type === "hero"
    )?.data?.title || "Minecraft tábor"

  return (
    <div className="minecraft-page">
      <section className="minecraft-hero px-4 py-16 md:py-24 text-center">
        <h1 className="font-minecraft text-2xl md:text-4xl text-white drop-shadow-[4px_4px_0_#2d5016] mb-4">
          {heroTitle}
        </h1>
        <p className="font-minecraft-body text-lg text-[#e8f5d6] max-w-xl mx-auto mb-8">
          Foglalj helyet a nyári tábor turnusain — építs, játssz, barátkozz!
        </p>
        <a href="#taborok" className="minecraft-btn inline-block">
          Turnusok
        </a>
      </section>
      <div className="px-4 pb-20 max-w-5xl mx-auto">
        <CampList />
      </div>
    </div>
  )
}
