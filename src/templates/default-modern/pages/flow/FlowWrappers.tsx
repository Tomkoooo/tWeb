"use client"

import type { FlowPageBodyProps, FlowPageWrapperProps } from "@/templates/types"

/** Reserved for future layout tweaks; keeps flow routes inside a predictable full-width column. */
export function DefaultModernFlowPageShell({ children }: FlowPageWrapperProps) {
  return <div className="w-full min-h-0">{children}</div>
}

/** `flowPages.cart.Body` demo: markup-only wrapper — must render `children` (enforced by types + review). */
export function DefaultModernCartFlowBody({ children, route }: FlowPageBodyProps) {
  void route
  return <div className="min-w-0" data-template-flow-body="cart">{children}</div>
}
