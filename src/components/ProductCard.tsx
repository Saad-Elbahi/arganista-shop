"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { inStock, type Product } from "@/data/products";
import { useCart } from "./cart/CartProvider";
import { PlusIcon } from "./icons";
import { Price } from "./Price";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, lang, href } = useI18n();
  const { add } = useCart();
  const available = inStock(product);
  const first = product.variants.find((v) => v.inStock !== false) ?? product.variants[0];
  // the card shows the cheapest size; a promo on any size shows the struck-through price
  const cheapest = [...product.variants].sort((a, b) => a.price - b.price)[0];
  const promo = product.variants.find((v) => v.compareAt && v.compareAt > v.price);
  const shown = promo ?? cheapest;
  const label = !available ? t.product.outOfStock : product.badges?.includes("best") ? t.product.best : product.badges?.includes("new") ? t.product.new : null;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-white">
        <Link href={href(`/product/${product.slug}`)} className="relative block aspect-[4/5]" tabIndex={-1}>
          <Image
            src={product.images[0]}
            alt={product.name[lang]}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className={`object-cover transition duration-700 ease-out group-hover:scale-[1.03] ${product.images[1] ? "group-hover:opacity-0" : ""}`}
          />
          {product.images[1] && (
            <Image src={product.images[1]} alt="" fill sizes="(min-width: 1280px) 22vw, 50vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          )}
        </Link>

        <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {label && <span className={`px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white ${available ? "bg-ink" : "bg-taupe"}`}>{label}</span>}
          {promo && available && <span className="bg-rose px-2 py-1 text-[10px] font-semibold text-white">-{Math.round((1 - promo.price / promo.compareAt!) * 100)}%</span>}
        </div>

        {available && (
          <>
            {/* desktop: bar slides up on hover */}
            <button
              onClick={() => add(product.slug, first.id)}
              className="absolute inset-x-3 bottom-3 hidden translate-y-3 rounded-[4px] bg-leaf py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-0 shadow-md transition duration-300 hover:bg-leaf-dark group-hover:translate-y-0 group-hover:opacity-100 sm:block"
            >
              {t.product.addToCart}
            </button>
            {/* mobile: compact button */}
            <button
              onClick={() => add(product.slug, first.id)}
              className="absolute bottom-2 end-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-md sm:hidden"
              aria-label={`${t.product.quickAdd} — ${product.name[lang]}`}
            >
              <PlusIcon width={17} height={17} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-1 pt-4 text-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-taupe">{t.categories[product.category]}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug">
          <Link href={href(`/product/${product.slug}`)} className="hover:text-leaf">
            {product.name[lang]}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 text-[15px]">
          {product.variants.length > 1 && !promo && <span className="text-xs text-taupe">{t.product.from}</span>}
          {promo && <Price amount={promo.compareAt!} lang={lang} className="text-[13px] text-taupe line-through" />}
          <Price amount={shown.price} lang={lang} className={promo ? "font-medium text-rose" : ""} />
        </p>
      </div>
    </article>
  );
}
