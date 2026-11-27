"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { categories } from "@/data/products";
import { useCatalog } from "@/components/CatalogProvider";
import { Logo } from "./Logo";
import { ArrowIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from "./icons";

function NewsletterForm() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  if (done) return <p className="mt-4 text-sm font-medium text-leaf">{t.home.newsletterThanks}</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="mt-4 flex items-center border-b border-ink/70"
    >
      <input type="email" required placeholder={t.home.newsletterPlaceholder} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-taupe" />
      <button aria-label={t.home.newsletterCta} className="p-2 hover:text-leaf">
        <ArrowIcon width={18} height={18} />
      </button>
    </form>
  );
}

export function Footer() {
  const { t, href } = useI18n();
  const { settings: site } = useCatalog();
  const link = "text-[15px] text-leaf hover:underline underline-offset-4";
  return (
    <footer className="bg-cream text-ink">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.5fr] lg:px-10">
        <div>
          <Logo className="h-16" />
          <p className="mt-5 max-w-[260px] text-sm leading-relaxed text-ink/75">{t.footer.tagline}</p>
        </div>
        <div>
          <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">{t.footer.shop}</h3>
          <ul className="space-y-3">
            {categories.map((c) => (
              <li key={c.key}><Link href={href(`/shop?c=${c.key}`)} className={link}>{t.categories[c.key]}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">Arganista</h3>
          <ul className="space-y-3">
            <li><Link href={href("/about")} className={link}>{t.nav.about}</Link></li>
            <li><Link href={href("/contact")} className={link}>{t.nav.contact}</Link></li>
            <li><Link href={href("/shop")} className={link}>{t.nav.all}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">{t.footer.help}</h3>
          <ul className="space-y-3">
            <li><Link href={href("/contact")} className={link}>{t.footer.shipping}</Link></li>
            <li><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className={link} dir="ltr">WhatsApp</a></li>
            <li><a href={`mailto:${site.email}`} className={link}>{site.email}</a></li>
            <li><Link href={href("/contact#boutique")} className={link}>{t.contact.boutiqueTitle}</Link></li>
          </ul>
        </div>
        <div id="newsletter" className="scroll-mt-28">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]">{t.home.newsletterTitle}</h3>
          <p className="mt-3 text-sm text-ink/75">{t.home.newsletterText}</p>
          <NewsletterForm />
          <div className="mt-6 flex gap-2">
            <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-ink/15 p-2.5 hover:border-leaf hover:text-leaf"><FacebookIcon width={16} height={16} /></a>
            <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-ink/15 p-2.5 hover:border-leaf hover:text-leaf"><InstagramIcon width={16} height={16} /></a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full border border-ink/15 p-2.5 hover:border-leaf hover:text-leaf"><WhatsAppIcon width={16} height={16} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-ink/60 sm:flex-row lg:px-10">
          <p>© Arganista. {t.footer.rights}</p>
          <a href={href("/contact#boutique")} className="hover:text-leaf">{site.address} · Made in Morocco</a>
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
      className="fixed bottom-5 end-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon width={26} height={26} />
    </a>
  );
}
