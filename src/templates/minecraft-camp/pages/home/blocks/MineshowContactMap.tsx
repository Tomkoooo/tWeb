type Props = {
  addressTitle: string
  email?: string
  companyName?: string
  mapEmbedUrl: string
}

export function MineshowContactMap({
  addressTitle,
  email,
  companyName,
  mapEmbedUrl,
}: Props) {
  if (!mapEmbedUrl) return null

  return (
    <section id="helyszin" className="bg-[#b8d88a] px-4 py-12 border-t-4 border-[#3d2817]/20">
      <div className="max-w-5xl mx-auto space-y-6">
        {addressTitle ? (
          <h2 className="font-minecraft text-center text-xs md:text-sm text-[#2d2817]">
            {addressTitle}
          </h2>
        ) : null}
        <div className="minecraft-map-frame overflow-hidden aspect-[21/9] min-h-[240px] bg-[#e8f5d6]">
          <iframe
            title="Térkép"
            src={mapEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        {(companyName || email) && (
          <div className="minecraft-panel p-4 text-center font-minecraft text-[10px] text-[#3d2817]">
            {companyName ? <p className="mb-1">{companyName}</p> : null}
            {email ? (
              <p>
                <a href={`mailto:${email}`} className="text-[#1a3d5c] underline">
                  {email}
                </a>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
