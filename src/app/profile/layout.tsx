import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profil | Krausz",
  description: "Krausz profiloldal és rendelések kezelése",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black pt-48 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-8">Profil</h1>
            <nav className="flex flex-col space-y-2">
              <a 
                href="/profile" 
                className="px-4 py-3 border border-white/10 hover:border-[#FF5500] hover:bg-[#FF5500]/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-between group"
              >
                Adataim
              </a>
              <a 
                href="/profile/orders" 
                className="px-4 py-3 border border-white/10 hover:border-[#FF5500] hover:bg-[#FF5500]/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-between group"
              >
                Rendeléseim
              </a>
              <a 
                href="/profile/feedback" 
                className="px-4 py-3 border border-white/10 hover:border-[#FF5500] hover:bg-[#FF5500]/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-between group"
              >
                Bolt értékelése
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
