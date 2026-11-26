"use client";

import Image from "next/image";
import Link from "next/link";
import { imageFor } from "@/data/products";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { FreeShippingMeter, QtyStepper } from "@/components/cart/CartDrawer";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { t, lang, href } = useI18n();
  const { lines, subtotal, shipping, total, setQty, remove } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-center font-serif text-5xl">{t.cart.title}</h1>
      <div className="stitch mx-auto mb-12 mt-6 max-w-[200px]" />

      {lines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl text-taupe">{t.cart.empty}</p>
          <Link href={href("/shop")} className="mt-8 inline-block bg-leaf px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream hover:bg-leaf-dark">
            {t.cart.continue}
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((l) => (
              <li key={l.slug + l.variantId} className="flex gap-5 py-6">
                <Link href={href(`/product/${l.slug}`)} className="relative h-32 w-26 shrink-0 overflow-hidden" style={{ background: l.product.tint }}>
                  <Image src={imageFor(l.product, l.variantId)} alt={l.product.name[lang]} fill sizes="120px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={href(`/product/${l.slug}`)} className="font-serif text-xl hover:text-copper">{l.product.name[lang]}</Link>
                      {l.variant.label && <p className="mt-1 text-xs text-taupe">{l.variant.label}</p>}
                      <p className="mt-1 text-sm text-taupe">{formatPrice(l.variant.price, lang)}</p>
                    </div>
                    <p className="whitespace-nowrap">{formatPrice(l.lineTotal, lang)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QtyStepper small value={l.qty} onChange={(n) => setQty(l.slug, l.variantId, n)} />
                    <button onClick={() => remove(l.slug, l.variantId)} className="text-xs text-taupe underline underline-offset-4 hover:text-copper">
                      {t.cart.remove}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-5 bg-cream p-7">
            <FreeShippingMeter />
            <dl className="space-y-3 border-t border-line pt-5 text-sm">
              <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{formatPrice(subtotal, lang)}</dd></div>
              <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{shipping === 0 ? t.cart.free : formatPrice(shipping, lang)}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>{t.cart.total}</dt><dd>{formatPrice(total, lang)}</dd></div>
            </dl>
            <Link href={href("/checkout")} className="block bg-leaf py-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-cream hover:bg-leaf-dark">
              {t.cart.checkout}
            </Link>
            <Link href={href("/shop")} className="block text-center text-xs uppercase tracking-[0.2em] underline underline-offset-4">
              {t.cart.continue}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
