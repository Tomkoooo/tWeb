import { ProductService } from "@/services/product";
import { Plus, Package, Edit2, Trash2, Search as SearchIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default async function AdminProducts({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string; q?: string; active?: string; visible?: string; discounted?: string }> 
}) {
  const { page, q, active, visible, discounted } = await searchParams;
  const currentPage = parseInt(page || "1");
  
  const filters: any = { search: q };
  if (active === "true") filters.isActive = true;
  if (active === "false") filters.isActive = false;
  if (visible === "true") filters.isVisible = true;
  if (visible === "false") filters.isVisible = false;
  if (discounted === "true") filters.isDiscounted = true;

  const { products, total, pages } = await ProductService.getPaginated(currentPage, 10, filters);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase italic text-white">
            Termékek <span className="text-accent underline decoration-accent/10 underline-offset-8">Készlete</span>
          </h1>
          <p className="text-white/40 font-medium italic">Kezelje a bolt árukészletét, árait és kategóriáit.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Új Termék
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md w-full">
          <SearchIcon className="absolute left-4 top-3 w-5 h-5 text-neutral-600" />
          <form method="GET">
            <Input 
              name="q"
              defaultValue={q}
              placeholder="Termék keresése..." 
              className="bg-black border-white/10 pl-12 h-11 text-white focus-visible:ring-accent w-full"
            />
          </form>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, active: active === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-9 rounded-lg border uppercase tracking-widest text-[10px] font-black", active === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500")}>
              Aktív
            </Button>
          </Link>
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, visible: visible === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-9 rounded-lg border uppercase tracking-widest text-[10px] font-black", visible === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500")}>
              Látható
            </Button>
          </Link>
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, discounted: discounted === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-9 rounded-lg border uppercase tracking-widest text-[10px] font-black", discounted === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500")}>
              Akciós
            </Button>
          </Link>
          {Object.values(filters).some(v => v !== undefined && v !== "") && (
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5">
                Szűrők törlése
              </Button>
            </Link>
          )}
        </div>

        <div className="hidden lg:block flex-1" />
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
          Találat: <span className="text-white">{total}</span>
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden text-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Termék</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Állapot</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Készlet</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Ár</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">
                  Nem található a keresésnek megfelelő termék.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                        {product.images?.[0] ? (
                          <img src={`/api/media/${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-neutral-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider">{product.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">/{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-[9px] w-fit px-1.5 py-0.5 rounded font-black uppercase tracking-widest border",
                        product.isActive ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      )}>
                        {product.isActive ? "Aktív" : "Inaktív"}
                      </span>
                      {!product.isVisible && (
                        <span className="text-[9px] w-fit px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-neutral-500 font-black uppercase tracking-widest">
                          Rejtett
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${product.stock > 10 ? 'text-white' : product.stock > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {product.stock} db
                      </span>
                      {product.stock <= 5 && (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-black text-white">{product.netPrice.toLocaleString()} Ft</p>
                      {product.discount > 0 && (
                        <p className="text-[10px] text-accent font-bold uppercase">-{product.discount}% kedvezmény</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/products/${product._id}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="hover:bg-red-500/10 text-neutral-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/products?page=${p}${q ? `&q=${q}` : ''}`}>
              <Button 
                variant={p === currentPage ? "default" : "ghost"}
                className={p === currentPage ? "bg-accent text-white" : "text-white/40"}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
