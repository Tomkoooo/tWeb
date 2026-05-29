type Props = {
  title: string
  body: string
}

export function MineshowPricing({ title, body }: Props) {
  return (
    <section className="bg-[#b8d88a] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-minecraft text-center text-sm md:text-base text-[#2d2817] mb-6">
          {title}
        </h2>
        <div className="minecraft-panel-wood p-6 md:p-8">
          <p className="font-minecraft text-white/95 text-[10px] md:text-xs leading-loose whitespace-pre-line">
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
