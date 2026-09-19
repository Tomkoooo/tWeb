import Image from "next/image"

/**
 * Ported verbatim from the original Krausz Barkácsmester storefront
 * (main@1fae4a56: src/app/loading.tsx) — the tan background, pixel GIF, and
 * "MESTERMUNKA FOLYAMATBAN" copy are the original hardcoded design, not
 * placeholder. Asset already shipped at /uploads/rpg-pixel.gif.
 */
export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#b7a480]"
      role="status"
      aria-live="polite"
      aria-label="Betöltés"
    >
      <div className="relative mb-8 h-64 w-64">
        <Image
          src="/uploads/rpg-pixel.gif"
          alt="Krausz Mester dolgozik..."
          fill
          unoptimized
          className="object-contain"
        />
      </div>

      <div className="animate-pulse text-center">
        <h2 className="mb-2 text-2xl font-black uppercase tracking-[0.3em] text-white">
          MESTERMUNKA <span className="text-[#FF5500]">FOLYAMATBAN</span>
        </h2>
        <div className="mx-auto mt-4 h-1 w-12 bg-[#FF5500]" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5500]/10 blur-[120px]" />
    </div>
  )
}
