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
import { resolveProductView } from "@/lib/product-variants";
import { FooterSettingsService } from "@/services/footer-settings";
import { ShopContentService } from "@/services/shop-content";

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const selectedVariantId = typeof query.variant === "string" ? query.variant : null;
  const product = await ProductService.getBySlug(slug);

  if (!product) return { title: "Termék nem található" };
  const view = resolveProductView(product as any, selectedVariantId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://krauszbarkacs.hu";
  const canonicalUrl = `${appUrl}/products/${product.slug}`;
  const openGraphImage = view.images?.[0] || product.images?.[0];

  return {
    title: `${view.seo.title || product.name} | Krausz Barkács`,
    description: view.seo.description || product.description.substring(0, 160),
    keywords: view.seo.keywords?.join(", "),
    openGraph: {
      title: view.name || product.name,
      description: view.seo.description || product.description.substring(0, 160),
      images: openGraphImage ? [`/api/media/${openGraphImage}`] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

import { ProductDetail } from "./ProductDetail";

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const selectedVariantId = typeof query.variant === "string" ? query.variant : undefined;
  const product = await ProductService.getBySlug(slug);
  const [footerSettings, content] = await Promise.all([
    FooterSettingsService.get(),
    ShopContentService.getAll(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background-dark text-white">
      <Navbar />
      <ProductDetail product={product} initialVariantId={selectedVariantId} />
      <Footer
        settings={footerSettings}
        email={content.contact_email}
        phone={content.contact_phone}
        address={content.contact_address}
      />
    </main>
  );
}
