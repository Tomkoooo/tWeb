import { getActiveChrome } from "@/lib/active-chrome"
import { PageContentService } from "@/services/page-content"
import type { FlowPageWrapperProps, FlowRouteKey } from "@/templates/types"

function FlowPassthrough({ children }: FlowPageWrapperProps) {
  return <>{children}</>
}

/**
 * Composes optional `flowPages[route]` pieces: **`Body`** (around engine `children`), then **`shell`** (persisted band),
 * then **`Wrapper`** — defaults are passthrough where omitted.
 */
export default async function FlowPageTemplateBridge({
  route,
  children,
}: {
  route: FlowRouteKey
  children: React.ReactNode
}) {
  const { template, branding } = await getActiveChrome()
  const flowDef = template.flowPages?.[route]
  const Wrapper = flowDef?.Wrapper ?? FlowPassthrough
  const shellDef = flowDef?.shell
  const Body = flowDef?.Body

  let inner: React.ReactNode = children
  if (Body) {
    const BodyCmp = Body
    inner = <BodyCmp route={route}>{inner}</BodyCmp>
  }
  if (shellDef) {
    const content = await PageContentService.getPublished<unknown>(
      template.manifest.id,
      `page:${route}`
    )
    const Shell = shellDef.Shell
    inner = (
      <Shell
        content={content}
        deps={{
          branding: {
            brandName: branding.brandName,
            logoNav: branding.logoNav,
            logoFooter: branding.logoFooter,
          },
        }}
      >
        {inner}
      </Shell>
    )
  }

  return <Wrapper>{inner}</Wrapper>
}
