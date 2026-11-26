"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product, Variant } from "@/data/products";
import { useCatalog } from "@/components/CatalogProvider";

export type CartLine = { slug: string; variantId: string; qty: number };
export type ResolvedLine = CartLine & { product: Product; variant: Variant; lineTotal: number };

type CartCtx = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, variantId: string, qty?: number) => void;
  setQty: (slug: string, variantId: string, qty: number) => void;
  remove: (slug: string, variantId: string) => void;
  clear: () => void;
};

const KEY = "arganista-cart-v1";
const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const { bySlug, settings } = useCatalog();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (saved) setRaw(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(raw));
  }, [raw, loaded]);

  const add = useCallback((slug: string, variantId: string, qty = 1) => {
    setRaw((cur) => {
      const i = cur.findIndex((l) => l.slug === slug && l.variantId === variantId);
      if (i === -1) return [...cur, { slug, variantId, qty }];
      const next = [...cur];
      next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
      return next;
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, variantId: string, qty: number) => {
    setRaw((cur) =>
      qty <= 0
        ? cur.filter((l) => !(l.slug === slug && l.variantId === variantId))
        : cur.map((l) => (l.slug === slug && l.variantId === variantId ? { ...l, qty: Math.min(99, qty) } : l)),
    );
  }, []);

  const remove = useCallback((slug: string, variantId: string) => setQty(slug, variantId, 0), [setQty]);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartCtx>(() => {
    const lines: ResolvedLine[] = [];
    for (const l of raw) {
      const product = bySlug(l.slug);
      const variant = product?.variants.find((v) => v.id === l.variantId);
      if (product && variant && variant.inStock !== false) lines.push({ ...l, product, variant, lineTotal: variant.price * l.qty });
    }
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal === 0 || subtotal >= settings.freeShippingFrom ? 0 : settings.shippingFee;
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [raw, open, add, setQty, remove, clear, bySlug, settings]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
