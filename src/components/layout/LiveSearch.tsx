"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight, Loader2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useClickAway } from "react-use"

interface LiveSearchProps {
  className?: string
  placeholder?: string
  inputClassName?: string
}

export function LiveSearch({ className, placeholder = "KERESÉS...", inputClassName }: LiveSearchProps) {
  const router = useRouter()
  const [q, setQ] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useClickAway(containerRef, () => setIsOpen(false))

  const handleSearch = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Search fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (q) handleSearch(q)
      else setResults([])
    }, 300)

    return () => clearTimeout(timer)
  }, [q, handleSearch])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/shop?q=${encodeURIComponent(q)}`)
      setIsOpen(false)
    }
  }

  const navigateToProduct = (slug: string) => {
    router.push(`/products/${slug}`)
    setIsOpen(false)
    setQ("")
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={onSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "pl-12 bg-white/5 border-white/5 focus-visible:ring-[#FF5500] rounded-none text-[10px] font-bold tracking-[0.2em] text-white placeholder:text-neutral-700 transition-all",
            inputClassName
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5500] animate-spin" />
        )}
      </form>

      {isOpen && (q.length >= 2 || (q.length > 0 && results.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 shadow-2xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => navigateToProduct(product.slug)}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <div className="relative w-12 h-12 bg-neutral-900 border border-white/5 flex-none">
                    {product.images?.[0] ? (
                      <Image
                        src={`/api/media/${product.images[0]}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 absolute inset-0 m-auto text-neutral-700" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-black text-white uppercase truncate tracking-widest">{product.name}</p>
                    <p className="text-[10px] font-bold text-[#FF5500] mt-1">
                      {product.netPrice.toLocaleString("hu-HU")} FT
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-700" />
                </button>
              ))}
              <Button
                onClick={onSubmit}
                variant="ghost"
                className="w-full h-12 rounded-none bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white font-black text-[10px] tracking-widest uppercase gap-3 transition-all"
              >
                Minden találat megtekintése
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : !isLoading && q.length >= 2 ? (
            <div className="p-8 text-center bg-white/5 border-t border-white/5">
              <p className="text-neutral-500 text-xs font-black tracking-widest uppercase mb-4 italic">
                Nincs találat, megnyitás a katalógusban
              </p>
              <Button
                onClick={() => {
                   router.push('/shop')
                   setIsOpen(false)
                }}
                variant="outline"
                className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-none font-black text-[10px] tracking-widest uppercase transition-all"
              >
                Keresés a boltban
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
