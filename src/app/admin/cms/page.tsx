import Link from "next/link"
import { TemplateService } from "@/services/template"
import { listEditablePages } from "@/templates/cms-pages"
import { isShopEnabled } from "@/lib/features/shop"

export const dynamic = "force-dynamic"

export default async function AdminCmsHub() {
  const template = await TemplateService.getActive()
  const pages = listEditablePages(template, isShopEnabled())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          CMS <span className="admin-text-accent">oldalak</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Sablon: <code className="text-neutral-200">{template.manifest.name}</code>
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <li key={p.adminSegment}>
            <Link
              href={`/admin/cms/${p.adminSegment}`}
              className="block rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white/30 hover:bg-white/10"
            >
              {p.label}
              <span className="mt-1 block text-[10px] font-normal normal-case tracking-normal text-neutral-500">
                {p.pageKey} · {p.category}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
