"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, slugify } from "@/lib/utils";
import { deriveNetFromGross, netToGross } from "@/lib/pricing";
import { AdminPricePairFields } from "@/components/admin/AdminPricePairFields";
import { AdminFormField, ADMIN_METRICS_ROW_CLASS } from "@/components/admin/AdminFormField";
import { useAdminPricePair } from "@/hooks/useAdminPricePair";
import type { AdminVariantRow } from "@/lib/admin-product-variants";

type VariantOption = { name: string; values: string[] };

type Props = {
  initialOptions?: VariantOption[];
  initialVariants?: AdminVariantRow[];
  defaultNetPrice: number;
  defaultGrossPrice?: number;
  initialRequireVariantSelection?: boolean;
  vatPercent: number;
  onVatChange: (vat: number) => void;
  onModeChange?: (mode: { enabled: boolean; requireVariantSelection: boolean }) => void;
  onVariantsChange?: (variants: AdminVariantRow[]) => void;
};

function cartesianProduct(optionGroups: Array<{ name: string; values: string[] }>) {
  if (optionGroups.length === 0) return [];
  return optionGroups.reduce<Array<Record<string, string>>>(
    (acc, group) => {
      const next: Array<Record<string, string>> = [];
      for (const combination of acc) {
        for (const value of group.values) {
          next.push({ ...combination, [group.name]: value });
        }
      }
      return next;
    },
    [{}]
  );
}

function attributesToId(attributes: Record<string, string>) {
  const source = Object.entries(attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join("-");
  return slugify(source) || `variant-${Date.now()}`;
}

function attributesToLabel(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");
}

export function ProductVariantsEditor({
  initialOptions = [],
  initialVariants = [],
  defaultNetPrice,
  defaultGrossPrice,
  initialRequireVariantSelection = false,
  vatPercent,
  onVatChange,
  onModeChange,
  onVariantsChange,
}: Props) {
  const [enabled, setEnabled] = useState(initialVariants.length > 0 || initialOptions.length > 0);
  const [requireVariantSelection, setRequireVariantSelection] = useState(
    Boolean(initialRequireVariantSelection)
  );
  const [options, setOptions] = useState<Array<{ name: string; valuesText: string }>>(
    initialOptions.length > 0
      ? initialOptions.map((option) => ({ name: option.name, valuesText: option.values.join(", ") }))
      : [{ name: "", valuesText: "" }]
  );
  const [variants, setVariants] = useState<AdminVariantRow[]>(
    initialVariants.map((variant, index) => {
      const net = Number(variant.netPrice ?? defaultNetPrice) || 0;
      return {
        ...variant,
        id: variant.id || `variant-${index + 1}`,
        netPrice: net,
        grossPrice:
          variant.grossPrice != null && variant.grossPrice > 0
            ? Number(variant.grossPrice)
            : netToGross(net, vatPercent),
        discount: Number(variant.discount ?? 0) || 0,
        stock: Number(variant.stock ?? 0) || 0,
        isActive: variant.isActive !== false,
        isDefault: Boolean(variant.isDefault),
        seo: {
          title: variant.seo?.title || "",
          description: variant.seo?.description || "",
          keywords: variant.seo?.keywords || [],
        },
      };
    })
  );

  const bulkPrice = useAdminPricePair(defaultNetPrice, vatPercent, defaultGrossPrice);
  const [bulkDiscount, setBulkDiscount] = useState(0);
  const [bulkStock, setBulkStock] = useState(0);
  const [activeVariantId, setActiveVariantId] = useState<string>(initialVariants?.[0]?.id || "");

  useEffect(() => {
    onModeChange?.({ enabled, requireVariantSelection });
  }, [enabled, requireVariantSelection, onModeChange]);

  useEffect(() => {
    if (enabled) onVariantsChange?.(variants);
  }, [variants, enabled, onVariantsChange]);

  const normalizedOptions = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    for (const option of options) {
      const name = option.name.trim();
      if (!name) continue;
      const values = option.valuesText
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (values.length === 0) continue;
      if (!grouped.has(name)) grouped.set(name, new Set<string>());
      const bucket = grouped.get(name)!;
      for (const value of values) bucket.add(value);
    }
    return Array.from(grouped.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [options]);

  const variantOptionsJson = JSON.stringify(normalizedOptions);
  const variantsJson = JSON.stringify(
    variants.map((variant) => ({
      ...variant,
      seo: {
        title: variant.seo?.title || "",
        description: variant.seo?.description || "",
        keywords: (variant.seo?.keywords || []).filter(Boolean),
      },
    }))
  );

  const activeVariantIndex = variants.findIndex((variant) => variant.id === activeVariantId);
  const safeActiveIndex = activeVariantIndex >= 0 ? activeVariantIndex : variants.length > 0 ? 0 : -1;
  const activeVariant = safeActiveIndex >= 0 ? variants[safeActiveIndex] : null;

  const updateVariantPrices = (
    variantId: string,
    patch: { netPrice?: number; grossPrice?: number }
  ) => {
    setVariants((prev) =>
      prev.map((item) => (item.id === variantId ? { ...item, ...patch } : item))
    );
  };

  const generateCombinations = () => {
    if (normalizedOptions.length === 0) return;
    const matrix = cartesianProduct(normalizedOptions);
    const byId = new Map(variants.map((variant) => [variant.id, variant]));
    const seenIds = new Map<string, number>();
    const nextVariants = matrix.map((attributes, index) => {
      const baseId = attributesToId(attributes);
      const count = seenIds.get(baseId) || 0;
      seenIds.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
      const existing = byId.get(id);
      const net = Number(defaultNetPrice) || 0;
      return (
        existing || {
          id,
          attributes,
          netPrice: net,
          grossPrice: netToGross(net, vatPercent),
          discount: 0,
          stock: 0,
          isActive: true,
          isDefault: index === 0,
          sku: "",
          nameOverride: "",
          descriptionOverride: "",
          seo: { title: "", description: "", keywords: [] },
        }
      );
    });
    setVariants(nextVariants);
    setActiveVariantId(nextVariants[0]?.id || "");
  };

  const applyBulkValues = () => {
    setVariants((prev) =>
      prev.map((variant) => ({
        ...variant,
        netPrice: bulkPrice.netPrice,
        grossPrice: bulkPrice.grossPrice,
        discount: Number(bulkDiscount) || 0,
        stock: Number(bulkStock) || 0,
      }))
    );
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-none p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-heading font-black italic uppercase tracking-wider text-white">Variánsok</h2>
        <button
          type="button"
          onClick={() => setEnabled((prev) => !prev)}
          className={cn(
            "w-14 h-7 rounded-none p-1 transition-colors duration-200 focus:outline-none",
            enabled ? "bg-primary" : "bg-neutral-800"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 bg-white transition-transform duration-200",
              enabled ? "translate-x-7" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <input type="hidden" name="variantsEnabled" value={enabled ? "true" : "false"} />
      <input type="hidden" name="requireVariantSelection" value={enabled && requireVariantSelection ? "true" : "false"} />
      <input type="hidden" name="variantOptionsJson" value={enabled ? variantOptionsJson : "[]"} />
      <input type="hidden" name="variantsJson" value={enabled ? variantsJson : "[]"} />

      {!enabled ? (
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
          Variánsok kikapcsolva. A termék egyetlen változatként jelenik meg.
        </p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-white/10 p-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 block uppercase tracking-[0.2em]">
                ÁFA kulcs (%) — minden variánsra
              </label>
              <Input
                type="number"
                name="vatPercent"
                min={0}
                max={100}
                step={1}
                value={vatPercent}
                onChange={(e) => onVatChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                className="bg-black border-white/5 h-11 text-white font-black tracking-widest focus-visible:ring-primary rounded-none"
              />
            </div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest self-end pb-2">
              A bruttó ár a vevő által fizetett összeg. A nettó a számlázáshoz kerül mentésre.
            </p>
          </div>

          <div className="flex items-center justify-between border border-white/10 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">
                Kötelező variáns választás
              </p>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">
                Ha bekapcsolt, a vevő nem teheti a base terméket kosárba variáns nélkül.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequireVariantSelection((prev) => !prev)}
              className={cn(
                "w-14 h-7 rounded-none p-1 transition-colors duration-200 focus:outline-none",
                requireVariantSelection ? "bg-primary" : "bg-neutral-800"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 bg-white transition-transform duration-200",
                  requireVariantSelection ? "translate-x-7" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
              Opció dimenziók
            </p>
            {options.map((option, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <Input
                  value={option.name}
                  onChange={(event) =>
                    setOptions((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, name: event.target.value } : item))
                    )
                  }
                  placeholder="Pl. Méret"
                  className="md:col-span-3 bg-black border-white/5 h-11 text-white rounded-none"
                />
                <Input
                  value={option.valuesText}
                  onChange={(event) =>
                    setOptions((prev) =>
                      prev.map((item, i) => (i === index ? { ...item, valuesText: event.target.value } : item))
                    )
                  }
                  placeholder="Pl. 3x20, 4x30, 5x40"
                  className="md:col-span-8 bg-black border-white/5 h-11 text-white rounded-none"
                />
                <Button
                  type="button"
                  onClick={() => setOptions((prev) => prev.filter((_, i) => i !== index))}
                  variant="ghost"
                  className="md:col-span-1 h-11 text-rose-500 hover:text-white hover:bg-rose-500/20 rounded-none"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setOptions((prev) => [...prev, { name: "", valuesText: "" }])}
                variant="outline"
                className="h-10 rounded-none border-white/10 text-white hover:bg-white/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Opció hozzáadása
              </Button>
              <Button
                type="button"
                onClick={generateCombinations}
                variant="outline"
                className="h-10 rounded-none admin-action-outline hover:bg-white/10"
              >
                <WandSparkles className="w-4 h-4 mr-2" />
                Variánsok generálása
              </Button>
            </div>
          </div>

          {variants.length > 0 ? (
            <>
              <div className="border border-white/10 p-4 space-y-3">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                  Bulk szerkesztés — alkalmazás minden variánsra
                </p>
                <div className={ADMIN_METRICS_ROW_CLASS}>
                  <AdminPricePairFields
                    netPrice={bulkPrice.netPrice}
                    grossPrice={bulkPrice.grossPrice}
                    vatPercent={vatPercent}
                    onNetChange={bulkPrice.setNetPrice}
                    onGrossChange={bulkPrice.setGrossPrice}
                    compact
                    showVatHint={false}
                  />
                  <AdminFormField label="Kedvezmény (%)">
                    <Input
                      type="number"
                      value={bulkDiscount}
                      onChange={(event) => setBulkDiscount(Number(event.target.value) || 0)}
                      className="h-11 w-full rounded-none border-white/5 bg-black text-white"
                    />
                  </AdminFormField>
                  <AdminFormField label="Készlet (db)">
                    <Input
                      type="number"
                      value={bulkStock}
                      onChange={(event) => setBulkStock(Number(event.target.value) || 0)}
                      className="h-11 w-full rounded-none border-white/5 bg-black text-white"
                    />
                  </AdminFormField>
                  <div className="col-span-2 flex items-end sm:col-span-1 xl:col-span-1">
                    <Button
                      type="button"
                      onClick={applyBulkValues}
                      className="h-11 w-full rounded-none bg-primary text-white xl:w-auto"
                    >
                      Alkalmazás
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {variants.map((variant) => (
                    <button
                      key={`selector-${variant.id}`}
                      type="button"
                      onClick={() => setActiveVariantId(variant.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 border text-[10px] font-black uppercase tracking-widest transition-colors",
                        activeVariant?.id === variant.id ? "admin-item-selected" : "admin-item-idle"
                      )}
                    >
                      {attributesToLabel(variant.attributes)}
                    </button>
                  ))}
                </div>
                {activeVariant ? (
                  <div key={activeVariant.id} className="xl:col-span-8 border border-white/10 p-4 space-y-4 bg-black/20">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="text-xs text-white font-black uppercase tracking-widest">
                          {attributesToLabel(activeVariant.attributes)}
                        </p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{activeVariant.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={activeVariant.isDefault ? "default" : "outline"}
                          className={cn(
                            "h-9 rounded-none text-[10px] font-black uppercase tracking-widest",
                            activeVariant.isDefault ? "bg-primary text-white" : "border-white/10 text-white hover:bg-white/5"
                          )}
                          onClick={() =>
                            setVariants((prev) =>
                              prev.map((item) => ({ ...item, isDefault: item.id === activeVariant.id }))
                            )
                          }
                        >
                          Alapértelmezett
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 rounded-none text-rose-500 hover:text-white hover:bg-rose-500/20"
                          onClick={() =>
                            setVariants((prev) => {
                              const next = prev.filter((item) => item.id !== activeVariant.id);
                              setActiveVariantId(next[0]?.id || "");
                              return next;
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className={ADMIN_METRICS_ROW_CLASS}>
                      <AdminPricePairFields
                        netPrice={activeVariant.netPrice}
                        grossPrice={
                          activeVariant.grossPrice ?? netToGross(activeVariant.netPrice, vatPercent)
                        }
                        vatPercent={vatPercent}
                        onNetChange={(net) =>
                          updateVariantPrices(activeVariant.id, {
                            netPrice: net,
                            grossPrice: netToGross(net, vatPercent),
                          })
                        }
                        onGrossChange={(gross) =>
                          updateVariantPrices(activeVariant.id, {
                            grossPrice: gross,
                            netPrice: deriveNetFromGross(gross, vatPercent),
                          })
                        }
                        compact
                        showVatHint={false}
                      />
                      <AdminFormField label="Kedvezmény (%)">
                        <Input
                          type="number"
                          value={activeVariant.discount}
                          onChange={(event) =>
                            setVariants((prev) =>
                              prev.map((item) =>
                                item.id === activeVariant.id
                                  ? { ...item, discount: Number(event.target.value) || 0 }
                                  : item
                              )
                            )
                          }
                          className="h-11 w-full rounded-none border-white/5 bg-black text-white"
                        />
                      </AdminFormField>
                      <AdminFormField label="Készlet (db)">
                        <Input
                          type="number"
                          value={activeVariant.stock}
                          onChange={(event) =>
                            setVariants((prev) =>
                              prev.map((item) =>
                                item.id === activeVariant.id
                                  ? { ...item, stock: Number(event.target.value) || 0 }
                                  : item
                              )
                            )
                          }
                          className="h-11 w-full rounded-none border-white/5 bg-black text-white"
                        />
                      </AdminFormField>
                      <AdminFormField label="SKU">
                        <Input
                          value={activeVariant.sku || ""}
                          onChange={(event) =>
                            setVariants((prev) =>
                              prev.map((item) =>
                                item.id === activeVariant.id ? { ...item, sku: event.target.value } : item
                              )
                            )
                          }
                          className="h-11 w-full rounded-none border-white/5 bg-black text-white"
                        />
                      </AdminFormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        value={activeVariant.nameOverride || ""}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id ? { ...item, nameOverride: event.target.value } : item
                            )
                          )
                        }
                        className="bg-black border-white/5 h-11 text-white rounded-none"
                        placeholder="Név felülírása (opcionális)"
                      />
                      <Input
                        value={activeVariant.descriptionOverride || ""}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id ? { ...item, descriptionOverride: event.target.value } : item
                            )
                          )
                        }
                        className="bg-black border-white/5 h-11 text-white rounded-none"
                        placeholder="Leírás felülírása (opcionális)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        value={activeVariant.seo?.title || ""}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id
                                ? { ...item, seo: { ...item.seo, title: event.target.value } }
                                : item
                            )
                          )
                        }
                        className="bg-black border-white/5 h-11 text-white rounded-none"
                        placeholder="SEO cím"
                      />
                      <Input
                        value={activeVariant.seo?.description || ""}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id
                                ? { ...item, seo: { ...item.seo, description: event.target.value } }
                                : item
                            )
                          )
                        }
                        className="bg-black border-white/5 h-11 text-white rounded-none"
                        placeholder="SEO leírás"
                      />
                      <Input
                        value={(activeVariant.seo?.keywords || []).join(", ")}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id
                                ? {
                                    ...item,
                                    seo: {
                                      ...item.seo,
                                      keywords: event.target.value
                                        .split(",")
                                        .map((keyword) => keyword.trim())
                                        .filter(Boolean),
                                    },
                                  }
                                : item
                            )
                          )
                        }
                        className="bg-black border-white/5 h-11 text-white rounded-none"
                        placeholder="SEO kulcsszavak"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id={`variant-active-${activeVariant.id}`}
                        type="checkbox"
                        checked={activeVariant.isActive}
                        onChange={(event) =>
                          setVariants((prev) =>
                            prev.map((item) =>
                              item.id === activeVariant.id ? { ...item, isActive: event.target.checked } : item
                            )
                          )
                        }
                      />
                      <label
                        htmlFor={`variant-active-${activeVariant.id}`}
                        className="text-xs font-black uppercase tracking-widest text-neutral-400"
                      >
                        Aktív variáns
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">
              Adj meg opciókat, majd generáld a variánsokat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
