"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { categories, minPrice, type CategoryKey, type IngredientKey } from "@/data/products";
import { useCatalog } from "@/components/CatalogProvider";
import { ProductCard } from "@/components/ProductCard";
import { CloseIcon } from "@/components/icons";

type Sort = "featured" | "asc" | "desc" | "name";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ShopClient() {
  const { t, lang } = useI18n();
  const { products } = useCatalog();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const cat = params.get("c") as CategoryKey | null;
  const ing = params.get("i") as IngredientKey | null;
  const q = params.get("q") ?? "";
  const sort = (params.get("s") as Sort) ?? "featured";

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const list = useMemo(() => {
    const nq = normalize(q.trim());
    const out = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!ing || p.ingredients.includes(ing)) &&
        (!nq || Object.values(p.name).some((n) => normalize(n).includes(nq)) || normalize(p.tagline[lang]).includes(nq)),
    );
    if (sort === "asc") out.sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "desc") out.sort((a, b) => minPrice(b) - minPrice(a));
    if (sort === "name") out.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
    return out;
  }, [cat, ing, q, sort, lang, products]);

  const title = cat ? t.categories[cat] : ing ? t.ingredients[ing] : t.shop.title;
  const chip = "whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors";

  return (
    <>
      <header className="mx-auto max-w-[1400px] px-4 pb-2 pt-10 text-center sm:px-6 lg:px-16">
        <h1 className="h-section">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-taupe">{t.shop.subtitle}</p>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:px-0">
            <button onClick={() => set("c", null)} className={`${chip} ${!cat ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>
              {t.shop.filterAll}
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => set("c", c.key)}
                className={`${chip} ${cat === c.key ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
              >
                {t.categories[c.key]}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <span className="text-xs text-taupe">
              {list.length} {t.shop.results}
            </span>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em]">
              {t.shop.sort}
              <select value={sort} onChange={(e) => set("s", e.target.value === "featured" ? null : e.target.value)} className="border border-line bg-linen px-3 py-2 text-xs normal-case tracking-normal outline-none">
                <option value="featured">{t.shop.sortFeatured}</option>
                <option value="asc">{t.shop.sortPriceAsc}</option>
                <option value="desc">{t.shop.sortPriceDesc}</option>
                <option value="name">{t.shop.sortName}</option>
              </select>
            </label>
          </div>
        </div>

        {(ing || q) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {ing && (
              <button onClick={() => set("i", null)} className="flex items-center gap-1.5 bg-sand px-3 py-1.5 text-xs">
                {t.shop.ingredient}: {t.ingredients[ing]} <CloseIcon width={14} height={14} />
              </button>
            )}
            {q && (
              <button onClick={() => set("q", null)} className="flex items-center gap-1.5 bg-sand px-3 py-1.5 text-xs">
                “{q}” <CloseIcon width={14} height={14} />
              </button>
            )}
          </div>
        )}

        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-taupe">{t.shop.empty}</p>
            <button onClick={() => router.replace(pathname)} className="mt-6 text-xs uppercase tracking-[0.2em] underline underline-offset-8">
              {t.shop.reset}
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
