"use client"

import { FallbackImage } from "@/components/common/FallbackImage"
import { mediaImageSrc } from "@/lib/images"
import { EditableDocText } from "@/features/template-cms/primitives/EditableDocText"
import { EditableDocRichText } from "@/features/template-cms/primitives/EditableDocRichText"
import { PressKitInlineRichEditor } from "../admin/PressKitInlineRichEditor"
import { useSurfaceDocEdit } from "@/features/template-cms/surface-doc-edit-context"
import { Button } from "@/components/ui/button"
import type { PressKitPageBlock, PressKitPageContent } from "../lib/page-content"

type Props = {
  content: PressKitPageContent
  brandName?: string
  portalTitle?: string
  previewContact?: { name: string; outlet: string }
}

export function PressKitPageRender({
  content,
  brandName = "",
  portalTitle = "Sajtóanyagok",
  previewContact,
}: Props) {
  const cms = useSurfaceDocEdit()

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 space-y-10 text-foreground">
      {cms.enabled ? (
        <div className="flex flex-wrap gap-2 border border-dashed border-white/20 bg-black/40 p-3 rounded-lg">
          <p className="w-full text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
            Blokkok — kattints az előnézeten a szövegek szerkesztéséhez
          </p>
        </div>
      ) : null}

      {previewContact ? (
        <p className="text-sm text-muted-foreground">
          {previewContact.name} · {previewContact.outlet}
        </p>
      ) : null}

      {content.blocks.map((block, index) => (
        <PressKitBlockView
          key={block.id}
          block={block}
          index={index}
          blocks={content.blocks}
          brandName={brandName}
          portalTitle={portalTitle}
        />
      ))}
    </article>
  )
}

function PressKitBlockView({
  block,
  index,
  blocks,
  brandName,
  portalTitle,
}: {
  block: PressKitPageBlock
  index: number
  blocks: PressKitPageBlock[]
  brandName: string
  portalTitle: string
}) {
  const cms = useSurfaceDocEdit()
  const base = `blocks.${index}`

  const removeBlock = () => {
    cms.setPath(
      "blocks",
      blocks.filter((_, i) => i !== index)
    )
  }

  const moveBlock = (dir: -1 | 1) => {
    const next = [...blocks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    const tmp = next[index]!
    next[index] = next[target]!
    next[target] = tmp
    cms.setPath("blocks", next)
  }

  const blockChrome = cms.enabled ? (
    <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
        {block.type}
      </span>
      <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => moveBlock(-1)}>
        ↑
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => moveBlock(1)}>
        ↓
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-7 text-[10px] text-rose-400" onClick={removeBlock}>
        Törlés
      </Button>
    </div>
  ) : null

  if (block.type === "hero") {
    return (
      <section>
        {blockChrome}
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            <EditableDocText path={`${base}.eyebrow`} value={block.eyebrow} placeholder="Sajtóanyag" />
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            <EditableDocText path={`${base}.pageTitle`} value={block.pageTitle} placeholder={portalTitle} />
          </h1>
          {brandName && !cms.enabled ? (
            <p className="text-sm text-muted-foreground">{brandName}</p>
          ) : null}
        </header>
        {block.heroImage || cms.enabled ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted">
            {block.heroImage ? (
              <FallbackImage
                src={mediaImageSrc(block.heroImage)}
                alt=""
                fill
                className="object-cover"
              />
            ) : null}
            {cms.enabled ? (
              <div className="absolute bottom-2 left-2 right-2 rounded bg-black/60 p-2 text-xs text-white">
                <span className="block text-[10px] uppercase tracking-widest opacity-80">Hero kép URL</span>
                <EditableDocText path={`${base}.heroImage`} value={block.heroImage} placeholder="/api/media/…" />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    )
  }

  if (block.type === "embargo") {
    if (!block.text && !cms.enabled) return null
    return (
      <section>
        {blockChrome}
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <EditableDocText path={`${base}.text`} value={block.text} multiline placeholder="Embargó / figyelmeztetés" />
        </div>
      </section>
    )
  }

  if (block.type === "richText") {
    return (
      <section className="space-y-3">
        {blockChrome}
        {(block.title || cms.enabled) && (
          <h2 className="text-2xl font-semibold">
            <EditableDocText path={`${base}.title`} value={block.title} placeholder="Szakasz címe" />
          </h2>
        )}
        <EditableDocRichText
          path={`${base}.bodyHtml`}
          html={block.bodyHtml}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </section>
    )
  }

  if (block.type === "plainText") {
    const html = block.bodyHtml || (block.body ? `<p>${block.body}</p>` : "")
    if (!html.replace(/<[^>]+>/g, "").trim() && !cms.enabled) return null
    return (
      <section className="space-y-3">
        {blockChrome}
        <PressKitInlineRichEditor
          path={`${base}.bodyHtml`}
          html={html}
          className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed"
        />
      </section>
    )
  }

  if (block.type === "highlights") {
    if (block.items.length === 0 && !cms.enabled) return null
    return (
      <section>
        {blockChrome}
        <div className="grid gap-4 sm:grid-cols-2">
          {block.items.map((item, itemIdx) => (
            <div key={itemIdx} className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                <EditableDocText
                  path={`${base}.items.${itemIdx}.label`}
                  value={item.label}
                  placeholder="Címke"
                />
              </p>
              <p className="font-medium">
                <EditableDocText
                  path={`${base}.items.${itemIdx}.detail`}
                  value={item.detail}
                  multiline
                  placeholder="Részlet"
                />
              </p>
            </div>
          ))}
        </div>
        {cms.enabled ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() =>
              cms.setPath(`${base}.items`, [...block.items, { label: "", detail: "" }])
            }
          >
            Kiemelés hozzáadása
          </Button>
        ) : null}
      </section>
    )
  }

  return null
}
