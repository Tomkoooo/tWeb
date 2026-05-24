"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { sfSpinner } from "@/lib/storefront-ui"

type SpinnerSample = {
  id: string
  label: string
  source: string
  className: string
  render: () => React.ReactNode
  surface?: "storefront" | "admin"
}

const RING_SAMPLES: Omit<SpinnerSample, "render">[] = [
  {
    id: "sf-token",
    label: "sfSpinner (storefront-ui token — not used in app yet)",
    source: "src/lib/storefront-ui.ts",
    className: `h-8 w-8 animate-spin rounded-full ${sfSpinner}`,
    surface: "storefront",
  },
  {
    id: "storefront-ring",
    label: "Storefront page loading (profile, cart, orders, flow…)",
    source: "ProfilePageView, CartPageView, FlowRoutePageClient, …",
    className:
      "h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary-foreground/35 border-t-transparent",
    surface: "storefront",
  },
  {
    id: "methods-step",
    label: "Checkout methods step (incomplete ring — border-t only)",
    source: "src/components/checkout/MethodsStep.tsx",
    className: "h-8 w-8 animate-spin rounded-full border-t-2 border-primary-foreground/35",
    surface: "storefront",
  },
  {
    id: "order-detail",
    label: "Profile order detail",
    source: "src/app/profile/orders/[id]/page.tsx",
    className:
      "w-8 h-8 border-t-2 border-primary-foreground/35 border-solid rounded-full animate-spin",
    surface: "storefront",
  },
  {
    id: "root-loading",
    label: "Next.js route loading.tsx",
    source: "src/app/loading.tsx",
    className: "h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary",
    surface: "storefront",
  },
]

const LOADER2_SAMPLES: Omit<SpinnerSample, "render">[] = [
  {
    id: "checkout-success",
    label: "Checkout success (processing)",
    source: "src/app/checkout/success/page.tsx",
    className: "w-12 h-12 text-primary-foreground animate-spin",
    surface: "storefront",
  },
  {
    id: "live-search",
    label: "Header live search",
    source: "src/components/layout/LiveSearch.tsx",
    className: "w-4 h-4 text-primary-foreground animate-spin",
    surface: "storefront",
  },
  {
    id: "admin-highlight-lg",
    label: "Admin image upload",
    source: "src/components/admin/ImageUpload.tsx",
    className: "w-8 h-8 text-highlight animate-spin",
    surface: "admin",
  },
  {
    id: "admin-highlight-sm",
    label: "Admin multi-image upload / product picker",
    source: "MultiImageUpload, FixedProductsSourcePicker",
    className: "w-5 h-5 text-highlight animate-spin",
    surface: "admin",
  },
  {
    id: "admin-accent",
    label: "Admin order status buttons",
    source: "src/components/admin/OrderStatusButtons.tsx",
    className: "w-3.5 h-3.5 animate-spin admin-icon-accent",
    surface: "admin",
  },
  {
    id: "admin-default",
    label: "Admin CMS form / product suggestions (inherits text color)",
    source: "CMSForm, ProductSuggestionsAdminForm",
    className: "w-5 h-5 animate-spin",
    surface: "admin",
  },
]

const THEME_VARS = [
  "--theme-primary",
  "--theme-primary-foreground",
  "--theme-secondary",
  "--theme-secondary-foreground",
  "--theme-muted",
  "--theme-foreground",
  "--theme-background",
  "--color-highlight",
] as const

function readThemeVars(): Record<string, string> {
  const root = document.documentElement
  const style = getComputedStyle(root)
  const out: Record<string, string> = {}
  for (const name of THEME_VARS) {
    out[name] = style.getPropertyValue(name).trim() || "(empty)"
  }
  return out
}

function Swatch({ name, value }: { name: string; value: string }) {
  const isColor = value.startsWith("#") || value.startsWith("rgb") || value.startsWith("oklch")
  return (
    <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 px-3 py-2">
      {isColor ? (
        <span
          className="h-8 w-8 shrink-0 rounded border border-white/20"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      ) : (
        <span className="h-8 w-8 shrink-0 rounded border border-white/20 bg-black/40" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{name}</p>
        <p className="truncate font-mono text-xs text-white">{value}</p>
      </div>
    </div>
  )
}

function SampleCard({ sample }: { sample: SpinnerSample }) {
  const isStorefront = sample.surface === "storefront"
  return (
    <div className="border border-white/10 bg-white/3 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-white">{sample.label}</h3>
        <p className="mt-1 font-mono text-[10px] text-neutral-500">{sample.source}</p>
      </div>
      <div
        className={cn(
          "flex min-h-[120px] items-center justify-center rounded border",
          isStorefront
            ? "border-primary-foreground/20 bg-background text-foreground"
            : "border-white/10 bg-[#0A0A0B]"
        )}
      >
        {sample.render()}
      </div>
      <pre className="overflow-x-auto rounded bg-black/50 p-3 font-mono text-[10px] leading-relaxed text-emerald-300/90 whitespace-pre-wrap break-all">
        {sample.className}
      </pre>
    </div>
  )
}

export function SpinnerPreviewClient() {
  const [themeVars, setThemeVars] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    setThemeVars(readThemeVars())
  }, [])

  const ringSamples: SpinnerSample[] = RING_SAMPLES.map((s) => ({
    ...s,
    render: () => <div className={s.className} aria-label="Loading" />,
  }))

  const loaderSamples: SpinnerSample[] = LOADER2_SAMPLES.map((s) => ({
    ...s,
    render: () => <Loader2 className={s.className} aria-label="Loading" />,
  }))

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-black uppercase tracking-wider text-white">
          Resolved theme colors
        </h2>
        <p className="text-sm text-neutral-400 max-w-2xl">
          Values from <code className="text-primary-foreground/80">&lt;html&gt;</code> at runtime (DB
          theme). Spinners should use{" "}
          <code className="text-primary-foreground/80">primary-foreground</code> on the storefront;
          admin often uses <code className="text-highlight">highlight</code> (#FFD700) instead.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {themeVars
            ? Object.entries(themeVars).map(([name, value]) => (
                <Swatch key={name} name={name} value={value} />
              ))
            : THEME_VARS.map((name) => (
                <div
                  key={name}
                  className="h-[52px] animate-pulse rounded border border-white/10 bg-white/5"
                />
              ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-white">
          Ring spinners (border)
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {ringSamples.map((sample) => (
            <SampleCard key={sample.id} sample={sample} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-white">
          Lucide Loader2
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {loaderSamples.map((sample) => (
            <SampleCard key={sample.id} sample={sample} />
          ))}
        </div>
      </section>

      <section className="rounded border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100/90">
        <p className="font-black uppercase tracking-wider text-amber-300 text-xs mb-2">
          Inconsistencies
        </p>
        <ul className="list-disc space-y-1 pl-5 text-amber-100/80">
          <li>
            <code className="text-xs">sfSpinner</code> uses full{" "}
            <code className="text-xs">border-primary-foreground</code> but most pages use{" "}
            <code className="text-xs">primary-foreground/35</code>.
          </li>
          <li>
            <code className="text-xs">loading.tsx</code> uses{" "}
            <code className="text-xs">border-muted</code> +{" "}
            <code className="text-xs">border-t-primary</code> (different tokens).
          </li>
          <li>Admin uploads use fixed gold <code className="text-xs">text-highlight</code>, not theme accent.</li>
          <li>MethodsStep ring is missing <code className="text-xs">rounded-full border-2</code> — may look broken.</li>
        </ul>
      </section>
    </div>
  )
}
