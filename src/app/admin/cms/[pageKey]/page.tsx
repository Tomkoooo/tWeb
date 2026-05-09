import { notFound } from "next/navigation"
import Link from "next/link"
import { TemplateService } from "@/services/template"
import { PageContentService } from "@/services/page-content"
import { TemplatePageEditorClient } from "./TemplatePageEditorClient"

export const dynamic = "force-dynamic"

const RESTYLED_PAGE_KEYS: Record<string, string> = {
  home: "Főoldal",
  shop: "Bolt",
  pdp: "Termékoldal",
}

function describePage(template: ReturnType<typeof TemplateService.getById>, pageKey: string) {
  if (!template) return null
  if (pageKey in RESTYLED_PAGE_KEYS) {
    if (pageKey === "home") return { def: template.pages.home, label: RESTYLED_PAGE_KEYS.home }
    if (pageKey === "shop") return { def: template.pages.shop, label: RESTYLED_PAGE_KEYS.shop }
    if (pageKey === "pdp") return { def: template.pages.pdp, label: RESTYLED_PAGE_KEYS.pdp }
  }
  const def = template.staticPages[pageKey]
  if (def) {
    return { def, label: `Statikus oldal: /${pageKey}` }
  }
  return null
}

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ pageKey: string }>
}) {
  const { pageKey } = await params
  const template = await TemplateService.getActive()
  const found = describePage(template, pageKey)
  if (!found) notFound()

  const fullPageKey =
    pageKey in RESTYLED_PAGE_KEYS ? `page:${pageKey}` : `page:${pageKey}`

  const content = await PageContentService.get(template.manifest.id, fullPageKey)

  const allPageKeys = [
    "home",
    "shop",
    "pdp",
    ...Object.keys(template.staticPages),
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            CMS: {found.label}
          </h1>
          <p className="text-xs text-neutral-500">
            Sablon: <code>{template.manifest.name}</code> ·
            Kulcs: <code>{fullPageKey}</code>
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {allPageKeys.map((key) => {
            const isActive = key === pageKey
            return (
              <Link
                key={key}
                href={`/admin/cms/${key}`}
                className={
                  isActive
                    ? "rounded-md bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white"
                    : "rounded-md border border-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white"
                }
              >
                {RESTYLED_PAGE_KEYS[key] ?? key}
              </Link>
            )
          })}
        </nav>
      </header>

      {pageKey === "home" && template.manifest.id === "default-modern" ? (
        <div className="rounded-md border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-neutral-300">
            A <strong>default-modern</strong> sablon főoldala a vizuális blokk-szerkesztőt
            használja. Nyisd meg a <Link href="/admin/cms" className="text-primary underline">CMS főnézetet</Link>{" "}
            a hagyományos szerkesztőhöz.
          </p>
        </div>
      ) : (
        <TemplatePageEditorClient
          templateId={template.manifest.id}
          pageKey={fullPageKey}
          initialContent={content}
        />
      )}
    </div>
  )
}
