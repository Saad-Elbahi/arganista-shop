"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { categories } from "@/data/products";
import { useCatalog } from "./CatalogProvider";
import { useCart } from "./cart/CartProvider";
import { Logo } from "./Logo";
import { ArrowIcon, BagIcon, CloseIcon, FacebookIcon, GlobeIcon, InstagramIcon, MenuIcon, SearchIcon, WhatsAppIcon } from "./icons";

/** Black bar with one message at a time, gently cycling. */
function AnnouncementBar() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % t.announce.length), 4500);
    return () => clearInterval(id);
  }, [t.announce.length]);
  return (
    <div className="bg-[#0b0b0b] text-[13px] tracking-[0.04em] text-[#f7eedd]">
      <div className="relative mx-auto h-9 max-w-7xl overflow-hidden px-4">
        {t.announce.map((m, k) => (
          <p
            key={m}
            className={`absolute inset-0 flex items-center justify-center px-4 text-center transition-all duration-500 ${k === i ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            aria-hidden={k !== i}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}

function LangSwitcher({ compact = false, up = false }: { compact?: boolean; up?: boolean }) {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const swap = (l: Locale) => {
    const parts = pathname.split("/");
    parts[1] = l;
    return parts.join("/") || `/${l}`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-2 text-[12px] font-medium uppercase tracking-[0.12em] hover:text-leaf"
        aria-label={t.nav.language}
        aria-expanded={open}
      >
        <GlobeIcon width={18} height={18} />
        {!compact && <span className="hidden sm:inline">{localeLabels[lang]}</span>}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`hidden transition sm:block ${open ? "rotate-180" : ""}`}><path d="m2 3.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
      </button>
      {open && (
        <ul className={`absolute z-50 min-w-40 ${up ? "bottom-full end-0 mb-1" : "start-0 top-full mt-1"} overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg`}>
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={swap(l)}
                onClick={() => {
                  document.cookie = `lang=${l};path=/;max-age=31536000`;
                  setOpen(false);
                }}
                className={`block px-4 py-2.5 text-sm hover:bg-blush-bg ${l === lang ? "font-semibold text-leaf" : ""}`}
              >
                {localeLabels[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t, href } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`${href("/shop")}?q=${encodeURIComponent(q.trim())}`);
          onClose();
        }}
        className="bg-white px-5 py-8 shadow-xl"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 border-b border-ink pb-2">
          <SearchIcon className="text-taupe" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            className="flex-1 bg-transparent py-2 text-lg outline-none placeholder:text-taupe"
          />
          <button type="button" onClick={onClose} aria-label={t.nav.close}>
            <CloseIcon />
          </button>
        </div>
      </form>
    </div>
  );
}

export function Header() {
  const { t, href } = useI18n();
  const { count, setOpen } = useCart();
  const { settings } = useCatalog();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu on navigation
  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-40 bg-blush-bg/95 backdrop-blur transition-shadow ${scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06),0_8px_24px_-16px_rgba(0,0,0,0.25)]" : ""}`}>
        <div className="mx-auto grid h-[72px] max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-3">
            <button className="p-2 hover:text-leaf" onClick={() => setMenu(true)} aria-label={t.nav.menu} aria-expanded={menu}>
              <MenuIcon />
            </button>
            <LangSwitcher />
          </div>
          <Link href={href("/")} aria-label="Arganista">
            <Logo className="h-11 sm:h-[52px]" priority />
          </Link>
          <div className="flex items-center justify-end gap-0.5 sm:gap-2">
            <button className="p-2 hover:text-leaf" onClick={() => setSearch(true)} aria-label={t.nav.search}>
              <SearchIcon width={20} height={20} />
            </button>
            <button onClick={() => setOpen(true)} className="relative p-2 hover:text-leaf" aria-label={t.nav.cart}>
              <BagIcon width={20} height={20} />
              {count > 0 && (
                <span className="absolute end-0 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-leaf px-1 text-[10px] font-semibold text-white">{count}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out menu (all screen sizes) */}
      <div className={`fixed inset-0 z-50 ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${menu ? "opacity-100" : "opacity-0"}`} onClick={() => setMenu(false)} />
        <aside
          className={`absolute inset-y-0 start-0 flex w-[88%] max-w-[420px] flex-col bg-white transition-[transform,visibility] duration-300 ${
            menu ? "visible translate-x-0" : "invisible -translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Logo className="h-11" />
            <button onClick={() => setMenu(false)} className="rounded-full p-2 hover:bg-blush-bg" aria-label={t.nav.close}>
              <CloseIcon />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            <Link href={href("/shop")} className="flex items-center justify-between border-b border-line py-4 text-[17px] font-medium">
              {t.nav.all}
              <ArrowIcon width={16} height={16} className="text-taupe" />
            </Link>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{t.nav.shop}</p>
            <ul className="mt-2">
              {categories.map((c) => (
                <li key={c.key}>
                  <Link href={href(`/shop?c=${c.key}`)} className="flex items-center justify-between py-3 text-[17px] hover:text-leaf">
                    {t.categories[c.key]}
                    <ArrowIcon width={15} height={15} className="text-taupe" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-4">
              <Link href={href("/about")} className="block py-3 text-[15px] hover:text-leaf">{t.nav.about}</Link>
              <Link href={href("/contact")} className="block py-3 text-[15px] hover:text-leaf">{t.nav.contact}</Link>
            </div>
          </nav>
          <div className="flex items-center justify-between border-t border-line px-6 py-4">
            <div className="flex gap-1">
              <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full p-2 hover:bg-blush-bg"><InstagramIcon width={18} height={18} /></a>
              <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full p-2 hover:bg-blush-bg"><FacebookIcon width={18} height={18} /></a>
              <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-full p-2 hover:bg-blush-bg"><WhatsAppIcon width={18} height={18} /></a>
            </div>
            <LangSwitcher up />
          </div>
        </aside>
      </div>

      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

/** Vertical social bar pinned to the side (desktop), like modern beauty stores. */
export function SocialRail() {
  const { t } = useI18n();
  const { settings } = useCatalog();
  return (
    <div className="fixed start-2 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full bg-white/90 px-1.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur lg:flex">
      <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-ink hover:text-leaf"><FacebookIcon width={16} height={16} /></a>
      <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-ink hover:text-leaf"><InstagramIcon width={16} height={16} /></a>
      <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-ink hover:text-leaf"><WhatsAppIcon width={16} height={16} /></a>
      <a href="#newsletter" className="mt-1 border-t border-line pt-3 text-[10px] font-medium uppercase tracking-[0.18em] [writing-mode:vertical-rl] rotate-180 hover:text-leaf">
        {t.footer.joinUs}
      </a>
    </div>
  );
}
