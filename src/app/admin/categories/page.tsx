import { CategoryService } from "@/services/category";
import { Plus, FolderTree, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminCategories() {
  const categories = await CategoryService.getAll();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase italic text-white">
            Kategóriák <span className="text-accent underline decoration-accent/10 underline-offset-8">Kezelése</span>
          </h1>
          <p className="text-white/40 font-medium italic">Itt kezelheti a bolt termék-kategóriáit és azok hierarchiáját.</p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Új Kategória
          </Button>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden text-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Név</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500">Szülő Kategória</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-neutral-500 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-white/20 italic">
                  Még nincsenek kategóriák létrehozva.
                </td>
              </tr>
            ) : (
              categories.map((category: any) => (
                <tr key={category._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        {category.image ? (
                          <img src={`/api/media/${category.image}`} alt={category.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <FolderTree className="w-5 h-5 text-neutral-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider">{category.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">/{category.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-400">
                      {category.parent ? category.parent.name : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/categories/${category._id}`}>
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
    </div>
  );
}
