import FlowPageTemplateBridge from "@/components/layout/FlowPageTemplateBridge"
import StorefrontFlowShell from "@/components/layout/StorefrontFlowShell"

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontFlowShell>
      <FlowPageTemplateBridge route="checkout">{children}</FlowPageTemplateBridge>
    </StorefrontFlowShell>
  )
}
