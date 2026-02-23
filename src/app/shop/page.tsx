import { ProductService } from "@/services/product"
import { CategoryService } from "@/services/category"
import { ShopHeader } from "@/components/shop/ShopHeader"
import { ShopFilters } from "@/components/shop/ShopFilters"
import { ProductCard } from "@/components/shop/ProductCard"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/layout/Navbar"
import { Filter } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const { q, category } = await searchParams
  
  let title = "Webshop | Krausz Barkács Mester"
  let description = "Válogasson prémium szerszámaink és ipari gépeink közül. Krausz - A minőség garanciája."

  if (q) {
    title = `Keresés: ${q} | Krausz Barkács Mester`
  } else if (category) {
    const cat = await CategoryService.getById(category)
    if (cat) {
      title = `${cat.name} | Krausz Barkács Mester`
      description = cat.seo?.description || description
    }
  }

  return {
    title,
    description,
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    q?: string; 
    category?: string; 
    discounted?: string;
    sort?: string;
  }>
}) {
  const params = await searchParams
  const currentPage = parseInt(params.page || "1")
  const limit = 12

  const filters = {
    search: params.q,
    category: params.category,
    isDiscounted: params.discounted === "true",
    sort: params.sort || "newest",
    isActive: true,
    isVisible: true,
  }

  const [paginationResult, categoriesResult] = await Promise.all([
    ProductService.getPaginated(currentPage, limit, filters),
    CategoryService.getTree()
  ])

  // Sanitize data for Client Components
  const products = JSON.parse(JSON.stringify(paginationResult.products))
  const total = paginationResult.total
  const pages = paginationResult.pages
  const categories = JSON.parse(JSON.stringify(categoriesResult))

  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <Navbar/>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Mobile Filter Button */}
          <div className="lg:hidden block mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full btn-krausz bg-transparent border-white/20 text-white rounded-none h-14 flex gap-3 text-xs tracking-widest uppercase">
                  <Filter className="w-4 h-4" />
                  Szűrők megjelenítése
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black border-r border-white/10 w-full sm:max-w-md overflow-y-auto">
                <div className="mt-12">
                  <ShopFilters categories={categories} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32">
              <ShopFilters categories={categories} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ShopHeader total={total} q={params.q} />

            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg-white/5">
                <p className="text-neutral-500 font-medium italic mb-6">Nincs a keresésnek megfelelő termék.</p>
                <Link href="/shop">
                  <Button variant="outline" className="btn-krausz border-white/20 text-white rounded-none">
                    MINDEN TERMÉK MUTATÁSA
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {products.map((product: any) => (
                    <ProductCard key={product._id.toString()} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-3">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                      const pageParams = new URLSearchParams(Object.entries(params) as any)
                      pageParams.set("page", p.toString())
                      
                      return (
                        <Link key={p} href={`/shop?${pageParams.toString()}`}>
                          <Button 
                            variant="outline"
                            className={cn(
                              "w-12 h-12 rounded-none font-black tracking-widest text-xs",
                              p === currentPage 
                                ? "bg-[#FF5500] border-[#FF5500] text-white" 
                                : "bg-black border-white/10 text-neutral-500 hover:text-white"
                            )}
                          >
                            {p}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
