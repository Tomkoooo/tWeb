import Link from "next/link"
import { Ticket } from "lucide-react"

export function TicketingAdminScreen({
  path,
  config,
}: {
  path: string[]
  config: Record<string, unknown>
}) {
  const subPath = path.join("/") || "(overview)"
  const checkoutMode =
    typeof config.checkoutMode === "string" ? config.checkoutMode : "direct"

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="rounded-none border border-white/10 bg-white/5 p-3">
          <Ticket className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-black uppercase italic tracking-tight text-white">
            Jegyek <span className="admin-headline-accent">Plugin</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Placeholder admin surface for course/event ticketing. Wire events, inventory, and
            direct checkout here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.02] p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Aktív nézet
          </p>
          <p className="text-lg font-bold text-white font-mono">/{subPath}</p>
        </div>
        <div className="border border-white/10 bg-white/[0.02] p-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            Deployment config
          </p>
          <p className="text-lg font-bold text-white font-mono">checkoutMode: {checkoutMode}</p>
        </div>
      </div>

      <div className="border border-dashed border-white/15 p-6 text-sm text-neutral-400">
        <p className="font-bold text-white mb-2">Következő lépések</p>
        <ul className="list-disc list-inside space-y-1">
          <li>CRUD for `TicketEvent` documents</li>
          <li>Storefront course pages + direct checkout (no cart)</li>
          <li>Order linkage via existing shop checkout APIs</li>
        </ul>
        <p className="mt-4">
          Plugin API probe:{" "}
          <Link
            href="/api/plugins/ticketing/status"
            className="text-white underline underline-offset-4"
            target="_blank"
          >
            GET /api/plugins/ticketing/status
          </Link>
        </p>
      </div>
    </div>
  )
}
