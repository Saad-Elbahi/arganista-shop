"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/data/products";
import type { ShopSettings } from "@/lib/catalog";

type Ctx = { products: Product[]; settings: ShopSettings; bySlug: (slug: string) => Product | undefined };

const CatalogContext = createContext<Ctx | null>(null);

export function CatalogProvider({ products, settings, children }: { products: Product[]; settings: ShopSettings; children: React.ReactNode }) {
  const value = useMemo<Ctx>(() => {
    const map = new Map(products.map((p) => [p.slug, p]));
    return { products, settings, bySlug: (s) => map.get(s) };
  }, [products, settings]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
