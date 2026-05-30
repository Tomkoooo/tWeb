"use client"

import Link from "next/link"
import { mediaImageSrc } from "@/lib/images"
import { useCmsEdit } from "@/features/homepage-cms/components/editor/cms-edit-context"
import { EditableTextInline } from "@/features/homepage-cms/components/primitives/EditableTextInline"
import { EditableLinkInline } from "@/features/homepage-cms/components/primitives/EditableLinkInline"
import { EditableImage } from "@/features/homepage-cms/components/primitives/EditableImage"

const BLOCK_ID = "story-zsdav"

type Props = {
  title: string
  image: string
  boxHeading: string
  body: string
  ctaLabel: string
  ctaHref: string
  bannerText: string
}

export function MineshowStory({
  title,
  image,
  boxHeading,
  body,
  ctaLabel,
  ctaHref,
  bannerText,
}: Props) {
  const cms = useCmsEdit()

  return (
    <section className="bg-[#b8d88a] px-4 py-12 md:py-16">
      {title || cms.enabled ? (
        <h2 className="font-minecraft text-center text-sm md:text-base text-[#2d2817] mb-10 max-w-3xl mx-auto">
          <EditableTextInline
            blockType="about"
            blockId={BLOCK_ID}
            field="title"
            value={title}
            className="text-[#2d2817] text-sm md:text-base text-center font-minecraft"
          />
        </h2>
      ) : null}
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2 items-stretch">
        <div className="minecraft-map-frame overflow-hidden bg-[#1a3d5c]/10 min-h-[280px]">
          {cms.enabled ? (
            <EditableImage
              src={mediaImageSrc(image || "/generic-hero.svg")}
              alt=""
              editMode
              className="h-full w-full object-cover min-h-[280px] pixelated"
              flexibleCrop
              usageLabel="Történet kép"
              onChange={(next) => cms.patchBlockData("about", { image: next }, BLOCK_ID)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaImageSrc(image || "/generic-hero.svg")}
              alt=""
              className="h-full w-full object-cover min-h-[280px] pixelated"
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="minecraft-panel-wood flex-1 p-6 md:p-8 flex flex-col">
            {boxHeading || cms.enabled ? (
              <h3 className="font-minecraft text-sm text-white mb-4">
                <EditableTextInline
                  blockType="about"
                  blockId={BLOCK_ID}
                  field="boxHeading"
                  value={boxHeading}
                  className="text-white text-sm font-minecraft"
                />
              </h3>
            ) : null}
            <p className="font-minecraft text-white/95 text-xs md:text-sm leading-loose flex-1 whitespace-pre-line">
              <EditableTextInline
                blockType="about"
                blockId={BLOCK_ID}
                field="paragraph"
                value={body}
                multiline
                className="text-white/95 text-xs md:text-sm font-minecraft leading-loose"
              />
            </p>
            {cms.enabled ? (
              <EditableLinkInline
                blockType="about"
                blockId={BLOCK_ID}
                labelField="ctaLabel"
                hrefField="ctaHref"
                label={ctaLabel}
                href={ctaHref}
                className="minecraft-btn-blue w-full text-center mt-6"
              />
            ) : ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="minecraft-btn-blue w-full text-center mt-6">
                {ctaLabel}
              </Link>
            ) : null}
          </div>
          {bannerText || cms.enabled ? (
            <div className="bg-[#5D9B38] border-4 border-t-0 border-[#4e311f] px-4 py-3 text-center">
              <p className="font-minecraft text-[10px] md:text-xs text-[#1a2e0f] leading-relaxed">
                <EditableTextInline
                  blockType="about"
                  blockId={BLOCK_ID}
                  field="bannerText"
                  value={bannerText}
                  multiline
                  className="text-[#1a2e0f] text-[10px] md:text-xs font-minecraft leading-relaxed text-center"
                />
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
