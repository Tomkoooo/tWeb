import { ProductService } from "@/services/product";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getBySlug(slug);

  if (!product) return { title: "Termék nem található" };

  return {
    title: `${product.seo?.title || product.name} | Krausz Barkács`,
    description: product.seo?.description || product.description.substring(0, 160),
    keywords: product.seo?.keywords?.join(", "),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images?.[0] ? [`/api/media/${product.images[0]}`] : [],
    },
  };
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

import { ProductDetail } from "./ProductDetail";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await ProductService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
    </main>
  );
}
