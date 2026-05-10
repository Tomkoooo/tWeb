import { ProductDetail } from "@/app/products/[slug]/ProductDetail"
import type { RenderProps, PdpPageDeps } from "@/templates/types"
import type { PdpContent } from "./schema"

function trimEditorial(e: PdpContent["editorial"]) {
  const has =
    e.eyebrow?.trim() ||
    e.title?.trim() ||
    e.body?.trim() ||
    e.highlights?.some((h) => h.label?.trim() || h.detail?.trim()) ||
    e.supportTitle?.trim() ||
    e.supportBody?.trim() ||
    e.faq?.some((f) => f.question?.trim() && f.answer?.trim()) ||
    e.ctaLabel?.trim() ||
    e.addedLabel?.trim()
  if (!has) return undefined
  return {
    eyebrow: e.eyebrow || undefined,
    title: e.title || undefined,
    body: e.body || undefined,
    highlights: e.highlights?.filter((h) => h.label || h.detail),
    supportTitle: e.supportTitle || undefined,
    supportBody: e.supportBody || undefined,
    faq: e.faq?.filter((f) => f.question?.trim() && f.answer?.trim()),
    ctaLabel: e.ctaLabel || undefined,
    addedLabel: e.addedLabel || undefined,
  }
}

export function PdpRender({ content, deps }: RenderProps<PdpContent, PdpPageDeps>) {
  const trimmed = trimEditorial(content.editorial)
  const editorial = {
    ...(trimmed ?? {}),
    ctaLabel: trimmed?.ctaLabel?.trim() || content.ctaLabel,
    addedLabel: trimmed?.addedLabel?.trim() || undefined,
  }
  return (
    <ProductDetail
      product={deps.product as never}
      initialVariantId={deps.selectedVariantId}
      editorial={editorial}
      introPlacement={content.introPlacement}
    />
  )
}

