import Link from "next/link";
import { Shield, User, ShoppingBag, Coins, CalendarDays, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUsers, updateUserRole } from "@/actions/admin-users";
import { cn } from "@/lib/utils";

type AdminUserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  ordersCount?: number;
  totalSpent?: number;
  lastOrderAt?: string | Date | null;
};

export default async function AdminUsersPage() {
  const users = await getAdminUsers() as AdminUserRow[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
          Vásárlók <span className="text-accent underline decoration-accent/10 underline-offset-8">Kezelése</span>
        </h1>
        <p className="text-white/40 font-medium italic">
          Felhasználók, szerepkörök és vásárlási összefoglaló.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-black">Felhasználó</th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-black">Szerepkör</th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-black">Rendelések</th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-black">Összes költés</th>
              <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-black">Utolso rendelés</th>
              <th className="px-5 py-4 text-right text-[10px] uppercase tracking-widest text-neutral-500 font-black">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-white/30 italic">
                  Nincs még felhasználó.
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        <span className="text-white font-black uppercase tracking-wider">
                          {item.name || "Névtelen felhasználó"}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-bold">{item.email || "Nincs email"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] border",
                        item.role === "ADMIN"
                          ? "text-amber-300 border-amber-300/40 bg-amber-500/10"
                          : "text-neutral-300 border-white/20 bg-white/5"
                      )}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {item.role}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-white font-black">
                    <span className="inline-flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-neutral-500" />
                      {item.ordersCount || 0}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-white font-black">
                    <span className="inline-flex items-center gap-2">
                      <Coins className="w-4 h-4 text-neutral-500" />
                      {(item.totalSpent || 0).toLocaleString("hu-HU")} Ft
                    </span>
                  </td>
                  <td className="px-5 py-5 text-neutral-400 font-bold text-sm">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-neutral-600" />
                      {item.lastOrderAt ? new Date(item.lastOrderAt).toLocaleDateString("hu-HU") : "-"}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${item._id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-none text-neutral-400 hover:text-accent hover:bg-white/5"
                          title="Részletek"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <form action={updateUserRole.bind(null, item._id.toString(), "USER")}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none border-white/20 text-white hover:bg-white/5"
                          disabled={item.role === "USER"}
                        >
                          USER
                        </Button>
                      </form>
                      <form action={updateUserRole.bind(null, item._id.toString(), "ADMIN")}>
                        <Button
                          size="sm"
                          className="rounded-none bg-accent hover:bg-accent/85 text-white"
                          disabled={item.role === "ADMIN"}
                        >
                          ADMIN
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
