"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { categories } from "@/data/products";
import { useCatalog } from "@/components/CatalogProvider";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "./icons";

export function Newsletter() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <Image src="/images/ambiance/amber.jpg" alt="" fill sizes="100vw" className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10 rtl:bg-gradient-to-l" />
      <div className="relative mx-auto max-w-2xl px-6 py-24 text-center">
        <h2 className="font-serif text-4xl sm:text-5xl">{t.home.newsletterTitle}</h2>
        <p className="mt-3 text-sm text-cream/80">{t.home.newsletterText}</p>
        {done ? (
          <p className="mt-8 font-serif text-2xl text-copper-soft">{t.home.newsletterThanks}</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="mx-auto mt-8 flex max-w-md border-b border-cream/60"
          >
            <input type="email" required placeholder={t.home.newsletterPlaceholder} className="flex-1 bg-transparent px-1 py-3 text-sm text-cream outline-none placeholder:text-cream/60" />
            <button className="px-2 text-xs font-medium uppercase tracking-[0.2em] hover:text-copper-soft">{t.home.newsletterCta}</button>
          </form>
        )}
      </div>
    </section>
  );
}

export function Footer() {
  const { t, href } = useI18n();
  const { settings: site } = useCatalog();
  return (
    <footer className="bg-leaf-dark text-cream/85">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light className="h-20" />
          <p className="max-w-xs text-sm leading-relaxed text-cream/70">{t.footer.tagline}</p>
          <div className="flex gap-3 pt-2">
            <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-cream/30 p-2 hover:bg-cream/10">
              <InstagramIcon width={18} height={18} />
            </a>
            <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-cream/30 p-2 hover:bg-cream/10">
              <FacebookIcon width={18} height={18} />
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full border border-cream/30 p-2 hover:bg-cream/10">
              <WhatsAppIcon width={18} height={18} />
            </a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cream">{t.footer.shop}</h3>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.key}>
                <Link href={href(`/shop?c=${c.key}`)} className="hover:text-white">
                  {t.categories[c.key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cream">{t.footer.help}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href={href("/about")} className="hover:text-white">{t.nav.about}</Link></li>
            <li><Link href={href("/contact")} className="hover:text-white">{t.nav.contact}</Link></li>
            <li><Link href={href("/contact")} className="hover:text-white">{t.footer.shipping}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-cream">{t.nav.contact}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><a href={`https://wa.me/${site.whatsapp}`} className="hover:text-white" dir="ltr">+{site.whatsapp}</a></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            <li>{site.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-cream/60 sm:flex-row">
          <p>© Arganista. {t.footer.rights}</p>
          <p className="tracking-[0.15em] uppercase">Made in Morocco</p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const { t } = useI18n();
  const { settings: site } = useCatalog();
  return (
    <a
      href={`https://wa.me/${site.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t.contact.whatsapp}
      className="fixed bottom-5 end-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon width={28} height={28} />
    </a>
  );
}
