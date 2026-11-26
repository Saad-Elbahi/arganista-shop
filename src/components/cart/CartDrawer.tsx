"use client";

import Image from "next/image";
import Link from "next/link";
import { imageFor } from "@/data/products";
import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { formatPrice, fill } from "@/lib/format";
import { useCatalog } from "@/components/CatalogProvider";
import { useCart } from "./CartProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "../icons";

export function FreeShippingMeter() {
  const { t, lang } = useI18n();
  const { subtotal } = useCart();
  const { settings } = useCatalog();
  const left = Math.max(0, settings.freeShippingFrom - subtotal);
  const pct = Math.min(100, (subtotal / settings.freeShippingFrom) * 100);
  return (
    <div>
      <p className="mb-2 text-xs text-taupe">
        {left > 0 ? fill(t.cart.freeLeft, { amount: formatPrice(left, lang) }) : t.cart.freeReached}
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-sand">
        <div className="h-full bg-leaf transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function QtyStepper({ value, onChange, small = false }: { value: number; onChange: (n: number) => void; small?: boolean }) {
  const s = small ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className="inline-flex items-center border border-line bg-linen">
      <button type="button" className={`${s} flex items-center justify-center hover:text-copper`} onClick={() => onChange(value - 1)} aria-label="-">
        <MinusIcon width={16} height={16} />
      </button>
      <span className={`${small ? "w-6 text-sm" : "w-8"} text-center tabular-nums`}>{value}</span>
      <button type="button" className={`${s} flex items-center justify-center hover:text-copper`} onClick={() => onChange(value + 1)} aria-label="+">
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const { t, lang, href } = useI18n();
  const { lines, open, setOpen, subtotal, setQty, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label={t.cart.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-linen transition-[transform,visibility] duration-300 ${
          open ? "visible translate-x-0 shadow-2xl" : "invisible translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl">{t.cart.title}</h2>
          <button onClick={() => setOpen(false)} aria-label={t.nav.close}>
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="font-serif text-xl text-taupe">{t.cart.empty}</p>
            <Link href={href("/shop")} onClick={() => setOpen(false)} className="bg-leaf px-8 py-3.5 text-xs uppercase tracking-[0.2em] text-cream hover:bg-leaf-dark">
              {t.cart.continue}
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <FreeShippingMeter />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.slug + l.variantId} className="flex gap-4 py-5">
                  <Link href={href(`/product/${l.slug}`)} onClick={() => setOpen(false)} className="relative h-24 w-20 shrink-0 overflow-hidden" style={{ background: l.product.tint }}>
                    <Image src={imageFor(l.product, l.variantId)} alt={l.product.name[lang]} fill sizes="120px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg leading-tight">{l.product.name[lang]}</p>
                        {l.variant.label && <p className="mt-0.5 text-xs text-taupe">{l.variant.label}</p>}
                      </div>
                      <p className="whitespace-nowrap text-sm">{formatPrice(l.lineTotal, lang)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper small value={l.qty} onChange={(n) => setQty(l.slug, l.variantId, n)} />
                      <button onClick={() => remove(l.slug, l.variantId)} className="text-xs text-taupe underline underline-offset-4 hover:text-copper">
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line bg-cream px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold">{formatPrice(subtotal, lang)}</span>
              </div>
              <Link
                href={href("/checkout")}
                onClick={() => setOpen(false)}
                className="block bg-leaf py-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-cream hover:bg-leaf-dark"
              >
                {t.cart.checkout}
              </Link>
              <Link href={href("/cart")} onClick={() => setOpen(false)} className="block text-center text-xs uppercase tracking-[0.2em] underline underline-offset-4">
                {t.cart.viewCart}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
