import type { Metadata } from "next"
import FlowPageTemplateBridge from "@/components/layout/FlowPageTemplateBridge"
import StorefrontFlowShell from "@/components/layout/StorefrontFlowShell"

export const metadata: Metadata = {
  title: "Profil | Krausz",
  description: "Krausz profiloldal és rendelések kezelése",
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontFlowShell>
      <FlowPageTemplateBridge route="profile">
        <div className="min-h-0 px-6 pb-20 pt-12 md:pt-16">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-12 md:flex-row">
              <aside className="w-full shrink-0 space-y-2 md:w-64">
                <h1 className="mb-8 text-3xl font-black uppercase tracking-widest text-foreground">
                  Profil
                </h1>
                <nav className="flex flex-col space-y-2">
                  <a
                    href="/profile"
                    className="group flex items-center justify-between border border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-primary hover:bg-primary/10"
                  >
                    Adataim
                  </a>
                  <a
                    href="/profile/orders"
                    className="group flex items-center justify-between border border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-primary hover:bg-primary/10"
                  >
                    Rendeléseim
                  </a>
                  <a
                    href="/profile/feedback"
                    className="group flex items-center justify-between border border-border px-4 py-3 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:border-primary hover:bg-primary/10"
                  >
                    Bolt értékelése
                  </a>
                </nav>
              </aside>

              <main className="flex-1">{children}</main>
            </div>
          </div>
        </div>
      </FlowPageTemplateBridge>
    </StorefrontFlowShell>
  )
}
