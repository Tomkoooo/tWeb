"use client";

import { QuickVariantSelector } from "@/components/shop/QuickVariantSelector";
import { cn } from "@/lib/utils";
import {
  countInStockNumberedVariants,
  countInStockVariants,
  shouldUseCompactVariantPickerOnCard,
} from "@/lib/product-card-variants";
import { getVariantById, getVariantLabel } from "@/lib/product-variants";
import { getBaseVariant, isUniqueNumberedProduct } from "@/lib/unique-numbered-variants";

export function ProductCardVariantArea({
  product,
  selectedVariantId,
  onVariantChange,
  className,
  chipClassName,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  className?: string;
  chipClassName?: string;
}) {
  if (!shouldUseCompactVariantPickerOnCard(product)) {
    return (
      <QuickVariantSelector
        product={product}
        selectedVariantId={selectedVariantId}
        onVariantChange={onVariantChange}
        className={className}
        chipClassName={chipClassName}
      />
    );
  }

  const numberedInStock = countInStockNumberedVariants(product);
  const numbered = isUniqueNumberedProduct(product);
  const base = numbered ? getBaseVariant(product) : null;
  const baseInStock = Boolean(base && (Number(base.stock) || 0) > 0);
  const selected = selectedVariantId ? getVariantById(product, selectedVariantId) : null;

  return (
    <p
      className={cn(
        "text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-snug",
        className
      )}
    >
      {numbered ? (
        numberedInStock > 0 ? (
          <>
            {numberedInStock} db elérhető sorszám
            {baseInStock ? " · alap példány is" : ""}
            <span className="block font-bold text-neutral-500 normal-case tracking-normal mt-0.5">
              Sorszám vagy alap példány a termékoldalon.
            </span>
          </>
        ) : baseInStock ? (
          <>
            Általános példány elérhető
            <span className="block font-bold text-neutral-500 normal-case tracking-normal mt-0.5">
              Az egyedi sorszámok elfogytak — közvetlenül kosárba tehető.
            </span>
          </>
        ) : (
          <>Jelenleg nincs készleten</>
        )
      ) : (
        <>
          {countInStockVariants(product)} elérhető variáns
          <span className="block font-bold text-neutral-500 normal-case tracking-normal mt-0.5">
            Válassz a termékoldalon.
          </span>
        </>
      )}
      {selected ? (
        <span className="block mt-1 text-primary-foreground">
          Kiválasztva: {getVariantLabel(selected)}
        </span>
      ) : null}
    </p>
  );
}
