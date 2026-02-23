import { ProductService } from "@/services/product";
import { Plus, Package, Edit2, Trash2, Search as SearchIcon, AlertCircle, ExternalLink } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2 uppercase italic text-white leading-[0.9]">
            Termékek <span className="text-accent underline decoration-accent/10 underline-offset-8">Készlete</span>
          </h1>
          <p className="text-white/40 font-medium italic">Kezelje a bolt árukészletét, árait és kategóriáit.</p>
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button variant="krausz" className="w-full sm:w-auto h-14 px-8 flex items-center gap-3">
            <Plus className="w-5 h-5" />
            ÚJ TERMÉK
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white/5 p-4 rounded-none border border-white/10">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-neutral-600" />
          <form method="GET">
            <Input 
              name="q"
              defaultValue={q}
              placeholder="KERESÉS..." 
              className="bg-black border-white/5 pl-12 h-12 text-white font-black uppercase tracking-widest text-xs focus-visible:ring-accent w-full rounded-none"
            />
          </form>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, active: active === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-12 rounded-none border-2 uppercase tracking-widest text-[10px] font-black px-4", active === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500 hover:text-white")}>
              Aktív
            </Button>
          </Link>
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, visible: visible === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-12 rounded-none border-2 uppercase tracking-widest text-[10px] font-black px-4", visible === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500 hover:text-white")}>
              Látható
            </Button>
          </Link>
          <Link href={`/admin/products?${new URLSearchParams({ ...filters, discounted: discounted === 'true' ? '' : 'true' }).toString()}`}>
            <Button variant="ghost" size="sm" className={cn("h-12 rounded-none border-2 uppercase tracking-widest text-[10px] font-black px-4", discounted === 'true' ? "bg-accent/10 border-accent text-accent" : "border-white/5 text-neutral-500 hover:text-white")}>
              Akciós
            </Button>
          </Link>
          {Object.values(filters).some(v => v !== undefined && v !== "") && (
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="h-12 px-4 text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 font-black uppercase tracking-widest text-[10px]">
                Visszaállít
              </Button>
            </Link>
          )}
        </div>

        <div className="hidden xl:block flex-1" />
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-2">
          Találat: <span className="text-white">{total}</span>
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Termék</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Állapot</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Készlet</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500">Ár</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-neutral-500 text-right">Műveletek</th>
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
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-none bg-neutral-900 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-accent/30 transition-colors">
                          {product.images?.[0] ? (
                            <img src={`/api/media/${product.images[0]}`} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Package className="w-6 h-6 text-neutral-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-black text-white uppercase tracking-wider text-base">{product.name}</p>
                          <p className="text-[10px] text-neutral-600 font-black tracking-widest uppercase mt-0.5">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-black uppercase tracking-[0.2em] text-[10px]">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn(
                          "w-fit px-2 py-1 border transition-colors",
                          product.isActive ? "bg-accent/5 border-accent/20 text-accent" : "bg-white/5 border-white/10 text-neutral-500"
                        )}>
                          {product.isActive ? "AKTÍV" : "INAKTÍV"}
                        </span>
                        {!product.isVisible && (
                          <span className="w-fit px-2 py-1 bg-white/5 border border-white/5 text-neutral-600">
                            REJTETT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black uppercase tracking-widest ${product.stock > 10 ? 'text-white' : product.stock > 0 ? 'text-[#FFD700]' : 'text-rose-500'}`}>
                          {product.stock} DB
                        </span>
                        {product.stock <= 5 && (
                          <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div>
                        <p className="font-black text-white text-lg tracking-tighter">{product.netPrice.toLocaleString("hu-HU")} <span className="text-xs text-accent">FT</span></p>
                        {product.discount > 0 && (
                          <p className="text-[10px] text-[#FFD700] font-black uppercase tracking-widest mt-1">-{product.discount}% KEDVEZMÉNY</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="hover:bg-accent/20 text-neutral-500 hover:text-accent rounded-none border border-transparent hover:border-accent/30 transition-all" title="Megtekintés">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${product._id}`}>
                          <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-500 hover:text-white rounded-none border border-transparent hover:border-white/10 transition-all" title="Szerkesztés">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="hover:bg-rose-500/10 text-neutral-500 hover:text-rose-500 rounded-none border border-transparent hover:border-rose-500/20 transition-all" title="Törlés">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
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
