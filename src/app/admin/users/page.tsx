import { Shield, User, ShoppingBag, Coins, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/actions/admin-users";
import { cn } from "@/lib/utils";
import { UserManagementSheet } from "@/components/admin/UserManagementSheet";
import { formatHuf } from "@/lib/pricing";

type AdminUserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  ordersCount?: number;
  totalSpent?: number;
  lastOrderAt?: string | Date | null;
  recentOrders?: Array<{
    _id: string;
    total: number;
    status: string;
    createdAt: string | Date;
  }>;
};

type AdminUsersSearchParams = Promise<{
  q?: string;
  role?: string;
  hasOrders?: string;
}>;

export default async function AdminUsersPage({ searchParams }: { searchParams: AdminUsersSearchParams }) {
  const filters = await searchParams;
  const users = await getAdminUsers(filters) as AdminUserRow[];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
          Vásárlók <span className="text-primary underline decoration-primary/10 underline-offset-8">Kezelése</span>
        </h1>
        <p className="text-white/40 font-medium italic">
          Felhasználók, szerepkörök és vásárlási összefoglaló.
        </p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white/5 border border-white/10 p-4">
        <input
          name="q"
          defaultValue={filters.q || ""}
          placeholder="Keresés név vagy email alapján..."
          className="md:col-span-2 h-12 bg-black border border-white/10 px-4 text-sm text-white placeholder:text-neutral-600 rounded-none"
        />
        <select
          name="role"
          defaultValue={filters.role || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none uppercase"
        >
          <option value="all">Minden szerepkör</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="hasOrders"
          defaultValue={filters.hasOrders || "all"}
          className="h-12 bg-black border border-white/10 px-4 text-sm text-white rounded-none uppercase"
        >
          <option value="all">Minden vásárló</option>
          <option value="yes">Van rendelése</option>
          <option value="no">Nincs rendelése</option>
        </select>
        <Button className="h-12 rounded-none bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[10px]">
          Szűrés
        </Button>
      </form>

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
                        <User className="w-4 h-4 text-primary" />
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
                      {formatHuf(item.totalSpent || 0)}
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
                      <UserManagementSheet
                        user={{
                          _id: item._id.toString(),
                          name: item.name,
                          email: item.email,
                          role: item.role,
                        }}
                        recentOrders={(item.recentOrders || []).map((order) => ({
                          _id: order._id.toString(),
                          total: order.total,
                          status: order.status,
                          createdAt: order.createdAt,
                        }))}
                      />
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
