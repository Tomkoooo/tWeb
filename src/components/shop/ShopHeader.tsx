"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  LayoutGrid, 
  List, 
  ChevronDown,
  ArrowUpDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ShopHeaderProps {
  total: number
  q?: string
}

const sortOptions = [
  { label: "Legújabb", value: "newest" },
  { label: "Ár: Alacsonytól", value: "price-asc" },
  { label: "Ár: Magastól", value: "price-desc" },
  { label: "Akciós", value: "discount" },
]

export function ShopHeader({ total, q }: ShopHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.set("page", "1")
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/5 p-6 border border-white/5">
      <div>
        <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-1">
          {q ? `KERESÉS: "${q}"` : "ÖSSZES TERMÉK"}
        </h1>
        <p className="text-neutral-500 text-xs font-black tracking-widest uppercase">
          {total} TALÁLAT A KÉSZLETBEN
        </p>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 border-white/10 bg-black text-white hover:bg-white/5 hover:text-white rounded-none flex gap-3 px-6 font-black text-[10px] tracking-[0.2em] uppercase">
              <ArrowUpDown className="w-4 h-4 text-[#FF5500]" />
              Rendezés: {sortOptions.find(o => o.value === currentSort)?.label}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border-white/10 rounded-none w-56 p-2">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="text-white hover:bg-[#FF5500] focus:bg-[#FF5500] cursor-pointer rounded-none font-black text-[10px] tracking-widest uppercase py-3 px-4"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex border border-white/10 rounded-none h-12 overflow-hidden ml-auto">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-none bg-white/5 border-none text-[#FF5500]">
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-none hover:bg-white/5 text-neutral-600 border-none">
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
