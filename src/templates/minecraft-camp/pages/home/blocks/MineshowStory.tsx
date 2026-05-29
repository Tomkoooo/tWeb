import Link from "next/link"

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
  return (
    <section className="bg-[#b8d88a] px-4 py-12 md:py-16">
      {title ? (
        <h2 className="font-minecraft text-center text-sm md:text-base text-[#2d2817] mb-10 max-w-3xl mx-auto">
          {title}
        </h2>
      ) : null}
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-2 items-stretch">
        <div className="minecraft-map-frame overflow-hidden bg-[#1a3d5c]/10 min-h-[280px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image || "/generic-hero.svg"}
            alt=""
            className="h-full w-full object-cover min-h-[280px] pixelated"
          />
        </div>
        <div className="flex flex-col">
          <div className="minecraft-panel-wood flex-1 p-6 md:p-8 flex flex-col">
            {boxHeading ? (
              <h3 className="font-minecraft text-sm text-white mb-4">{boxHeading}</h3>
            ) : null}
            <p className="font-minecraft text-white/95 text-xs md:text-sm leading-loose flex-1 whitespace-pre-line">
              {body}
            </p>
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="minecraft-btn-blue w-full text-center mt-6">
                {ctaLabel}
              </Link>
            ) : null}
          </div>
          {bannerText ? (
            <div className="bg-[#5D9B38] border-4 border-t-0 border-[#4e311f] px-4 py-3 text-center">
              <p className="font-minecraft text-[10px] md:text-xs text-[#1a2e0f] leading-relaxed">
                {bannerText}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
