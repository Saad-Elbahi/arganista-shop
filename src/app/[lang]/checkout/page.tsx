"use client";

import Image from "next/image";
import Link from "next/link";
import { imageFor } from "@/data/products";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { CashIcon, WhatsAppIcon } from "@/components/icons";
import { cities } from "@/config/site";
import { useCatalog } from "@/components/CatalogProvider";
import { placeOrder } from "./actions";
import { fill, formatPrice } from "@/lib/format";

type Form = { name: string; phone: string; city: string; otherCity: string; address: string; note: string };
const empty: Form = { name: "", phone: "", city: "", otherCity: "", address: "", note: "" };

// Moroccan mobile/landline: 06/07/05… or +212 / 00212 prefix
const validPhone = (p: string) => /^(?:\+212|00212|0)[5-7]\d{8}$/.test(p.replace(/[\s.-]/g, ""));

export default function CheckoutPage() {
  const { t, lang, href } = useI18n();
  const { lines, subtotal, shipping, total, clear } = useCart();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState<{ id: string; wa: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const { settings: site } = useCatalog();

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!form.name.trim()) err.name = t.checkout.required;
    if (!form.phone.trim()) err.phone = t.checkout.required;
    else if (!validPhone(form.phone)) err.phone = t.checkout.invalidPhone;
    if (!form.city) err.city = t.checkout.required;
    if (form.city === "other" && !form.otherCity.trim()) err.otherCity = t.checkout.required;
    if (!form.address.trim()) err.address = t.checkout.required;
    setErrors(err);
    if (Object.keys(err).length) return;

    const city = form.city === "other" ? form.otherCity : form.city;
    setSending(true);
    setFormError("");
    // Open the WhatsApp tab now (inside the click) so pop-up blockers allow it.
    const tab = window.open("", "_blank");
    const res = await placeOrder({
      lang,
      name: form.name,
      phone: form.phone,
      city,
      address: form.address,
      note: form.note,
      items: lines.map((l) => ({ slug: l.slug, variant: l.variantId, qty: l.qty })),
    });
    setSending(false);
    if (!res.ok) {
      tab?.close();
      if (res.error === "phone") setErrors({ phone: t.checkout.invalidPhone });
      else if (res.error === "unavailable") setFormError(t.checkout.unavailable);
      else setFormError(t.checkout.error);
      return;
    }
    const id = res.number;
    const totals = res.saved ? res : { subtotal, shipping, total };
    const msg = [
      t.checkout.waIntro,
      `#${id}`,
      "",
      ...lines.map((l) => `• ${l.product.name[lang]}${l.variant.label ? ` (${l.variant.label})` : ""} × ${l.qty} — ${formatPrice(l.lineTotal, lang)}`),
      "",
      `${t.cart.subtotal}: ${formatPrice(totals.subtotal, lang)}`,
      `${t.cart.shipping}: ${totals.shipping === 0 ? t.cart.free : formatPrice(totals.shipping, lang)}`,
      `${t.cart.total}: ${formatPrice(totals.total, lang)}`,
      "",
      `${t.checkout.fullName}: ${form.name}`,
      `${t.checkout.phone}: ${form.phone}`,
      `${t.checkout.city}: ${city}`,
      `${t.checkout.address}: ${form.address}`,
      form.note ? `${t.checkout.note}: ${form.note}` : "",
      `${t.checkout.payment}: ${t.checkout.cod}`,
    ]
      .filter((x, i, a) => x !== "" || a[i - 1] !== "")
      .join("\n");

    const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
    setDone({ id, wa });
    clear();
    if (tab) tab.location.href = wa;
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-soft text-2xl text-leaf">✓</div>
        <h1 className="mt-6 font-serif text-4xl">{t.checkout.successTitle}</h1>
        <p className="mt-4 leading-relaxed text-taupe">{fill(t.checkout.successText, { id: done.id })}</p>
        <a href={done.wa} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 bg-[#25D366] px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-[#1fb857]">
          <WhatsAppIcon width={18} height={18} /> {t.checkout.sendWhatsapp}
        </a>
        <div className="mt-6">
          <Link href={href("/")} className="text-xs uppercase tracking-[0.2em] underline underline-offset-8">{t.checkout.backHome}</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-28 text-center">
        <p className="font-serif text-2xl text-taupe">{t.cart.empty}</p>
        <Link href={href("/shop")} className="mt-8 inline-block bg-leaf px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream">{t.cart.continue}</Link>
      </div>
    );
  }

  const input = "w-full border border-line bg-linen px-4 py-3.5 text-sm outline-none transition-colors focus:border-leaf";
  const Field = ({ k, label, children }: { k: keyof Form; label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em]">{label}</span>
      {children}
      {errors[k] && <span className="mt-1 block text-xs text-rose">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-center font-serif text-5xl">{t.checkout.title}</h1>
      <div className="stitch mx-auto mb-12 mt-6 max-w-[200px]" />

      <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section className="space-y-5">
            <h2 className="font-serif text-2xl">{t.checkout.contact}</h2>
            {Field({ k: "name", label: t.checkout.fullName, children: <input className={input} value={form.name} onChange={set("name")} autoComplete="name" /> })}
            {Field({
              k: "phone",
              label: t.checkout.phone,
              children: <input className={input} value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder={t.checkout.phoneHint} dir="ltr" />,
            })}
            <div className="grid gap-5 sm:grid-cols-2">
              {Field({
                k: "city",
                label: t.checkout.city,
                children: (
                  <select className={input} value={form.city} onChange={set("city")}>
                    <option value="">{t.checkout.chooseCity}</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="other">{t.checkout.otherCity}</option>
                  </select>
                ),
              })}
              {form.city === "other" &&
                Field({ k: "otherCity", label: t.checkout.otherCity, children: <input className={input} value={form.otherCity} onChange={set("otherCity")} /> })}
            </div>
            {Field({ k: "address", label: t.checkout.address, children: <input className={input} value={form.address} onChange={set("address")} autoComplete="street-address" /> })}
            {Field({ k: "note", label: t.checkout.note, children: <textarea className={`${input} min-h-24`} value={form.note} onChange={set("note")} /> })}
          </section>

          <section>
            <h2 className="mb-5 font-serif text-2xl">{t.checkout.payment}</h2>
            <div className="flex items-start gap-4 border-2 border-leaf bg-leaf-soft/50 p-5">
              <CashIcon className="mt-0.5 shrink-0 text-leaf" />
              <div>
                <p className="text-sm font-semibold">{t.checkout.cod}</p>
                <p className="mt-1 text-xs text-taupe">{t.checkout.codText}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit bg-cream p-7 lg:sticky lg:top-36">
          <h2 className="mb-5 font-serif text-2xl">{t.checkout.summary}</h2>
          <ul className="space-y-4">
            {lines.map((l) => (
              <li key={l.slug + l.variantId} className="flex items-center gap-4">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden" style={{ background: l.product.tint }}>
                  <Image src={imageFor(l.product, l.variantId)} alt={l.product.name[lang]} fill sizes="120px" className="object-cover" />
                  <span className="absolute -end-0 -top-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-white">{l.qty}</span>
                </span>
                <span className="flex-1 text-sm leading-tight">
                  {l.product.name[lang]}
                  {l.variant.label && <span className="block text-xs text-taupe">{l.variant.label}</span>}
                </span>
                <span className="text-sm">{formatPrice(l.lineTotal, lang)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{formatPrice(subtotal, lang)}</dd></div>
            <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{shipping === 0 ? t.cart.free : formatPrice(shipping, lang)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>{t.cart.total}</dt><dd>{formatPrice(total, lang)}</dd></div>
          </dl>
          {formError && <p className="mt-5 border border-rose/40 bg-blush px-4 py-3 text-sm text-rose">{formError}</p>}
          <button disabled={sending} className="mt-6 w-full bg-leaf py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream hover:bg-leaf-dark disabled:opacity-60">
            {sending ? t.checkout.sending : t.checkout.place}
          </button>
        </aside>
      </form>
    </div>
  );
}
