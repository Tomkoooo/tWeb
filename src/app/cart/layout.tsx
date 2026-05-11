import FlowPageTemplateBridge from "@/components/layout/FlowPageTemplateBridge"
import StorefrontFlowShell from "@/components/layout/StorefrontFlowShell"

export default async function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontFlowShell>
      <FlowPageTemplateBridge route="cart">{children}</FlowPageTemplateBridge>
    </StorefrontFlowShell>
  )
}
