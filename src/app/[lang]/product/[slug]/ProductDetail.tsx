"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import Image from "next/image";
import { imageFor, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCatalog } from "@/components/CatalogProvider";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { CashIcon, LeafIcon, PlusIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-xs font-medium uppercase tracking-[0.18em]">
        {title}
        <PlusIcon width={16} height={16} className="transition-transform group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-taupe">{children}</div>
    </details>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const { t, lang, href } = useI18n();
  const { add } = useCart();
  const { settings: site } = useCatalog();
  const [img, setImg] = useState(0);
  const [variantId, setVariantId] = useState((product.variants.find((v) => v.inStock !== false) ?? product.variants[0]).id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId)!;
  const soldOut = variant.inStock === false;
  const name = product.name[lang];
  // Gallery: photo of the chosen size first, then the other studio shots
  const main = imageFor(product, variantId);
  const photos = [main, ...product.images.filter((src) => src !== main)];
  const views = photos.map((src, i) => (
    <Image key={src} src={src} alt={i === 0 ? name : ""} fill priority={i === 0} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
  ));

  const waText = encodeURIComponent(
    `${t.checkout.waIntro}\n• ${product.name[lang]}${variant.label ? ` (${variant.label})` : ""} × ${qty}`,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-6">
      <nav className="mb-6 text-xs text-taupe">
        <Link href={href("/")} className="hover:text-ink">{t.nav.home}</Link>
        <span className="mx-2">/</span>
        <Link href={href(`/shop?c=${product.category}`)} className="hover:text-ink">{t.categories[product.category]}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row lg:sticky lg:top-36 lg:self-start">
          <div className="flex gap-3 sm:flex-col">
            {views.map((v, i) => (
              <button
                key={i}
                onClick={() => setImg(i)}
                className={`relative h-24 w-20 overflow-hidden border transition-colors ${i === img ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
                aria-label={`${i + 1}`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="relative aspect-[4/5] flex-1 overflow-hidden">{views[img]}</div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-copper">{t.categories[product.category]}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{product.name[lang]}</h1>
          <p className="mt-3 font-serif text-xl italic text-taupe">{product.tagline[lang]}</p>
          <p className="mt-6 flex items-baseline gap-3 text-2xl">
            {formatPrice(variant.price, lang)}
            {variant.compareAt && variant.compareAt > variant.price && (
              <>
                <span className="text-base text-taupe line-through">{formatPrice(variant.compareAt, lang)}</span>
                <span className="bg-copper px-2 py-0.5 text-xs font-medium text-white">-{Math.round((1 - variant.price / variant.compareAt) * 100)}%</span>
              </>
            )}
          </p>
          {soldOut ? (
            <p className="mt-1 flex items-center gap-2 text-xs text-rose">
              <span className="h-1.5 w-1.5 rounded-full bg-rose" /> {t.product.outOfStock}
            </p>
          ) : (
            <p className="mt-1 flex items-center gap-2 text-xs text-leaf">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> {t.product.inStock}
            </p>
          )}

          <p className="mt-6 leading-relaxed text-taupe">{product.description[lang]}</p>

          {product.variants.length > 1 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em]">{t.product.size}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVariantId(v.id);
                      setImg(0);
                    }}
                    className={`min-w-20 border px-5 py-2.5 text-sm transition-colors ${v.id === variantId ? "border-ink bg-ink text-cream" : "border-line hover:border-ink"} ${v.inStock === false ? "text-taupe line-through decoration-1" : ""}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(99, n)))} />
            <button
              disabled={soldOut}
              onClick={() => {
                add(product.slug, variantId, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              className="flex-1 bg-leaf py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors hover:bg-leaf-dark disabled:cursor-not-allowed disabled:bg-taupe/50"
            >
              {soldOut ? t.product.outOfStock : added ? t.product.added : t.product.addToCart}
            </button>
          </div>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 border border-[#25D366] py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#128C4A] hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon width={18} height={18} /> {t.product.orderWhatsapp}
          </a>

          <ul className="mt-8 grid grid-cols-3 gap-2 border-y border-line py-5 text-center text-[11px] leading-snug text-taupe">
            <li className="flex flex-col items-center gap-2"><CashIcon className="text-copper" />{t.perks[0].title}</li>
            <li className="flex flex-col items-center gap-2"><TruckIcon className="text-copper" />{t.perks[1].title}</li>
            <li className="flex flex-col items-center gap-2"><LeafIcon className="text-copper" />{t.perks[2].title}</li>
          </ul>

          <div className="mt-2">
            <Accordion title={t.product.howTo} open>{product.howTo[lang]}</Accordion>
            <Accordion title={t.product.keyIngredients}>{product.keyIngredients[lang]}</Accordion>
            <Accordion title={t.product.delivery}>{t.product.deliveryText}</Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
