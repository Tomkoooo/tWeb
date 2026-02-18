import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

async function KpiCard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent/40 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-accent" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}%
        </div>
      </div>
      <div>
        <h3 className="text-white/40 text-sm font-medium mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  // In a real app, these would be fetched from the database
  const stats = [
    { title: "Összes Bevétel", value: "8.245.600 Ft", change: 12.5, trend: "up", icon: TrendingUp },
    { title: "Összes Rendelés", value: "482", change: 8.2, trend: "up", icon: ShoppingCart },
    { title: "Aktív Vásárlók", value: "2.154", change: 3.1, trend: "down", icon: Users },
    { title: "Összes Termék", value: "128", change: 5.4, trend: "up", icon: Package },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase italic text-white">
          Vezérlőpult <span className="text-accent underline decoration-accent/10 underline-offset-8">Áttekintés</span>
        </h1>
        <p className="text-white/40 font-medium italic">Üdvözöljük az adminisztrációs felületen. Itt láthatja a bolt jelenlegi állapotát.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <KpiCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px]">
          <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            Legutóbbi Rendelések
          </h2>
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-10" />
            <p className="italic">A rendelések követése hamarosan elérhető lesz...</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[400px]">
          <h2 className="text-xl font-bold mb-6 italic uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            Aktivitási Napló
          </h2>
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <TrendingUp className="w-12 h-12 mb-4 opacity-10" />
            <p className="italic">Az élő aktivitási napló hamarosan érkezik...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

