"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import Image from "next/image";
import { imageFor, type Product } from "@/data/products";
import { Price } from "@/components/Price";
import { useCatalog } from "@/components/CatalogProvider";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/CartDrawer";
import { CashIcon, LeafIcon, PlusIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[12px] font-semibold uppercase tracking-[0.16em]">
        {title}
        <PlusIcon width={16} height={16} className="transition-transform group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-[15px] leading-relaxed text-ink/80">{children}</div>
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
    <Image key={src} src={src} alt={i === 0 ? `${name} — Arganista` : `${name} — Arganista (${i + 1})`} fill priority={i === 0} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
  ));

  const waText = encodeURIComponent(
    `${t.checkout.waIntro}\n• ${product.name[lang]}${variant.label ? ` (${variant.label})` : ""} × ${qty}`,
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-5 sm:px-6 lg:px-16">
      <nav className="mb-6 text-xs text-taupe">
        <Link href={href("/")} className="hover:text-ink">{t.nav.home}</Link>
        <span className="mx-2">/</span>
        <Link href={href(`/shop?c=${product.category}`)} className="hover:text-ink">{t.categories[product.category]}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Gallery: large photo, thumbnails underneath */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-white">{views[img]}</div>
          {views.length > 1 && (
            <div className="mt-4 flex justify-center gap-3">
              {views.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
                  className={`relative h-[72px] w-[58px] overflow-hidden rounded-sm border bg-white transition ${i === img ? "border-ink" : "border-line opacity-75 hover:opacity-100"}`}
                  aria-label={`${i + 1}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-taupe">{t.categories[product.category]}</p>
          <h1 className="mt-2 text-[28px] font-normal leading-tight tracking-[-0.015em] sm:text-[34px]">{name}</h1>
          {product.tagline[lang] && <p className="mt-2 text-[15px] text-taupe">{product.tagline[lang]}</p>}

          <p className="mt-6 flex flex-wrap items-baseline gap-3 text-[24px]">
            {variant.compareAt && variant.compareAt > variant.price && <Price amount={variant.compareAt} lang={lang} className="text-[16px] text-taupe line-through" />}
            <Price amount={variant.price} lang={lang} className={variant.compareAt && variant.compareAt > variant.price ? "text-rose" : ""} />
            {variant.compareAt && variant.compareAt > variant.price && (
              <span className="rounded-sm bg-rose px-2 py-0.5 text-xs font-semibold text-white">-{Math.round((1 - variant.price / variant.compareAt) * 100)}%</span>
            )}
          </p>
          <p className={`mt-2 flex items-center gap-2 text-[13px] ${soldOut ? "text-rose" : "text-leaf"}`}>
            <span className={`h-2 w-2 rounded-full ${soldOut ? "bg-rose" : "bg-leaf"}`} />
            {soldOut ? t.product.outOfStock : `${t.product.inStock} · ${t.perks[1].title}`}
          </p>

          {product.variants.length > 1 && (
            <div className="mt-7">
              <p className="mb-3 text-[13px]">
                {t.product.size} : <span className="font-semibold">{variant.label}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setVariantId(v.id);
                      setImg(0);
                    }}
                    className={`min-w-[84px] rounded-[4px] border px-5 py-2.5 text-sm transition ${v.id === variantId ? "border-ink bg-ink text-white" : "border-line hover:border-ink"} ${v.inStock === false ? "text-taupe line-through decoration-1" : ""}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex gap-3">
            <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(99, n)))} />
            <button
              disabled={soldOut}
              onClick={() => {
                add(product.slug, variantId, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              className="btn-primary flex-1 py-4 disabled:bg-taupe/50 disabled:shadow-none"
            >
              {soldOut ? t.product.outOfStock : added ? t.product.added : t.product.addToCart}
            </button>
          </div>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-[4px] bg-[#efefef] py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-[#e4e4e4]"
          >
            <WhatsAppIcon width={17} height={17} className="text-[#25D366]" /> {t.product.orderWhatsapp}
          </a>

          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/85">
            <p>{product.description[lang]}</p>
          </div>

          {product.keyIngredients[lang] && (
            <>
              <h2 className="mt-8 text-[22px] font-normal tracking-[-0.01em]">{t.product.keyIngredients}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/85">{product.keyIngredients[lang]}</p>
            </>
          )}

          <div className="mt-8 border-t border-line">
            <Accordion title={t.product.howTo} open>{product.howTo[lang]}</Accordion>
            <Accordion title={t.product.delivery}>{t.product.deliveryText}</Accordion>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-[12px] leading-snug text-taupe">
            <li className="flex flex-col items-center gap-2"><CashIcon className="text-ink" />{t.perks[0].title}</li>
            <li className="flex flex-col items-center gap-2"><TruckIcon className="text-ink" />{t.perks[1].title}</li>
            <li className="flex flex-col items-center gap-2"><LeafIcon className="text-ink" />{t.perks[2].title}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
