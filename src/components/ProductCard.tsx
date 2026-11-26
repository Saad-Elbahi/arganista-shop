"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { inStock, minPrice, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCart } from "./cart/CartProvider";
import { PlusIcon } from "./icons";
import Image from "next/image";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, lang, href } = useI18n();
  const { add } = useCart();
  const multi = product.variants.length > 1;
  const available = inStock(product);
  const first = product.variants.find((v) => v.inStock !== false) ?? product.variants[0];
  const promo = product.variants.find((v) => v.compareAt && v.compareAt > v.price);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link href={href(`/product/${product.slug}`)} className="relative block aspect-[4/5] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name[lang]}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${product.images[1] ? "group-hover:opacity-0" : ""}`}
          />
          {product.images[1] && (
            <Image src={product.images[1]} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          )}
        </Link>
        {!available ? (
          <span className="absolute start-3 top-3 bg-ink/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">{t.product.outOfStock}</span>
        ) : promo ? (
          <span className="absolute start-3 top-3 bg-rose px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">-{Math.round((1 - promo.price / promo.compareAt!) * 100)}%</span>
        ) : product.badges?.[0] && (
          <span
            className={`absolute start-3 top-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ${
              product.badges[0] === "best" ? "bg-white/90 text-ink" : "bg-copper text-white"
            }`}
          >
            {product.badges[0] === "best" ? t.product.best : t.product.new}
          </span>
        )}
        <button
          onClick={() => add(product.slug, first.id)}
          hidden={!available}
          className="absolute bottom-3 end-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition-all hover:bg-leaf hover:text-cream sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          aria-label={`${t.product.quickAdd} — ${product.name[lang]}`}
          title={t.product.quickAdd}
        >
          <PlusIcon width={18} height={18} />
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-taupe">{t.categories[product.category]}</p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug">
          <Link href={href(`/product/${product.slug}`)} className="hover:text-copper">
            {product.name[lang]}
          </Link>
        </h3>
        <p className="mt-auto pt-2 text-sm">
          {multi && <span className="text-taupe">{t.product.from} </span>}
          {formatPrice(minPrice(product), lang)}
        </p>
      </div>
    </article>
  );
}
