import { cn } from "@/lib/utils"

/** Checkout step chrome: `dark` matches legacy Krausz-on-dark; `light` uses theme tokens for editorial templates. */
export type CheckoutStepAppearance = "dark" | "light"

export function cxInput(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? cn(
        "h-12 w-full min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      )
    : "bg-black border-white/5 h-14 text-white font-bold uppercase tracking-widest focus-visible:ring-primary rounded-none"
}

export function cxLabel(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
    : "text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]"
}

export function cxSectionHeading(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? "text-sm font-semibold uppercase tracking-[0.2em] text-foreground"
    : "text-sm font-black text-white uppercase tracking-[0.2em]"
}

export function cxTypeToggleShell(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? "flex gap-1 rounded-lg border border-border bg-muted/50 p-1"
    : "flex gap-4 p-1 bg-white/5 border border-white/10 w-fit"
}

export function cxTypeToggleBtn(appearance: CheckoutStepAppearance, active: boolean) {
  return cn(
    "px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-all rounded-md",
    appearance === "light"
      ? active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-background hover:text-foreground"
      : active
        ? "bg-primary text-white"
        : "text-neutral-500 hover:text-white"
  )
}

export function cxMethodCard(appearance: CheckoutStepAppearance, selected: boolean) {
  return cn(
    "p-6 border-2 text-left transition-all duration-300 flex items-center justify-between group rounded-lg",
    appearance === "light"
      ? selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      : selected
        ? "bg-white/5 border-primary"
        : "bg-black border-white/5 hover:border-white/10"
  )
}

export function cxMethodTitle(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? "font-semibold text-foreground uppercase tracking-widest text-xs mb-1"
    : "font-black text-white uppercase tracking-widest text-xs mb-1"
}

export function cxMethodPrice(appearance: CheckoutStepAppearance) {
  return appearance === "light" ? "font-semibold text-foreground text-lg" : "font-black text-white text-lg"
}

export function cxDivider(appearance: CheckoutStepAppearance) {
  return appearance === "light" ? "border-border" : "border-white/10"
}

export function cxGlsBox(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? "h-[420px] rounded-lg border border-border bg-muted/40"
    : "h-[420px] bg-black border border-white/10"
}

export function cxTextarea(appearance: CheckoutStepAppearance) {
  return appearance === "light"
    ? cn(
        "w-full resize-none rounded-lg border border-border bg-card p-4 text-sm text-foreground shadow-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      )
    : "w-full bg-black border border-white/5 rounded-none p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
}

export function cxSummaryMuted(appearance: CheckoutStepAppearance) {
  return appearance === "light" ? "text-sm text-muted-foreground font-medium space-y-1" : "text-sm text-neutral-300 font-medium space-y-1"
}

export function cxSummaryStrong(appearance: CheckoutStepAppearance) {
  return appearance === "light" ? "font-semibold text-foreground uppercase" : "font-black text-white uppercase"
}
