"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export type Tab = { label: string; products: Product[]; href: string };

/** Centered tabs with an accent underline, then a product grid and a "view all" button. */
export function ProductTabs({ tabs, viewAll, title }: { tabs: Tab[]; viewAll: string; title?: string }) {
  const [i, setI] = useState(0);
  const tab = tabs[i];
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-16 lg:py-20">
      {title && <h2 className="h-section mb-6 text-center">{title}</h2>}
      <div role="tablist" className="no-scrollbar mb-10 flex justify-center gap-6 overflow-x-auto sm:gap-10">
        {tabs.map((tb, k) => (
          <button
            key={tb.label}
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className={`relative shrink-0 pb-3 text-[15px] transition-colors sm:text-base ${k === i ? "font-semibold text-ink" : "text-taupe hover:text-ink"}`}
          >
            {tb.label}
            <span className={`absolute inset-x-1/2 bottom-0 h-[2px] -translate-x-1/2 bg-leaf transition-all ${k === i ? "w-9" : "w-0"}`} />
          </button>
        ))}
      </div>
      <div key={i} className="grid animate-[fadeIn_.4s_ease] grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {tab.products.slice(0, 8).map((p, k) => (
          <ProductCard key={p.slug} product={p} priority={k < 2} />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link href={tab.href} className="btn-primary px-12">
          {viewAll}
        </Link>
      </div>
    </section>
  );
}
