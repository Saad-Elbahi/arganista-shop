"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { categories } from "@/data/products";
import { useCart } from "./cart/CartProvider";
import { Logo } from "./Logo";
import { BagIcon, CloseIcon, GlobeIcon, MenuIcon, SearchIcon } from "./icons";

function AnnouncementBar() {
  const { t } = useI18n();
  const items = [...t.announce, ...t.announce];
  return (
    <div className="overflow-hidden bg-leaf text-cream text-[11px] tracking-[0.18em] uppercase">
      <div className="marquee flex w-max gap-16 py-2.5 whitespace-nowrap">
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-16">
            {m}
            <span aria-hidden className="opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LangSwitcher() {
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
        className="flex items-center gap-1.5 p-2 text-xs uppercase tracking-wider hover:text-copper"
        aria-label={t.nav.language}
        aria-expanded={open}
      >
        <GlobeIcon width={20} height={20} />
        <span className="hidden sm:inline">{lang}</span>
      </button>
      {open && (
        <ul className="absolute end-0 top-full z-50 mt-1 min-w-36 border border-line bg-linen py-1 shadow-lg">
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={swap(l)}
                onClick={() => {
                  document.cookie = `lang=${l};path=/;max-age=31536000`;
                  setOpen(false);
                }}
                className={`block px-4 py-2 text-sm hover:bg-sand ${l === lang ? "text-copper" : ""}`}
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
    <div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`${href("/shop")}?q=${encodeURIComponent(q.trim())}`);
          onClose();
        }}
        className="bg-linen px-5 py-8 shadow-xl"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 border-b border-ink/30 pb-2">
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

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu on navigation
  useEffect(() => setMenu(false), [pathname]);

  const nav = [
    { label: t.nav.all, to: "/shop" },
    ...categories.map((c) => ({ label: t.categories[c.key], to: `/shop?c=${c.key}` })),
    { label: t.nav.about, to: "/about" },
  ];

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-40 border-b border-line bg-linen/95 backdrop-blur transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            <button className="p-2 lg:hidden" onClick={() => setMenu(true)} aria-label={t.nav.menu}>
              <MenuIcon />
            </button>
            <button className="hidden p-2 hover:text-copper lg:block" onClick={() => setSearch(true)} aria-label={t.nav.search}>
              <SearchIcon />
            </button>
          </div>
          <Link href={href("/")} aria-label="Arganista">
            <Logo className="h-12 sm:h-14" priority />
          </Link>
          <div className="flex items-center justify-end gap-1">
            <button className="p-2 hover:text-copper lg:hidden" onClick={() => setSearch(true)} aria-label={t.nav.search}>
              <SearchIcon />
            </button>
            <LangSwitcher />
            <button onClick={() => setOpen(true)} className="relative p-2 hover:text-copper" aria-label={t.nav.cart}>
              <BagIcon />
              {count > 0 && (
                <span className="absolute end-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-copper px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav className="hidden border-t border-line/70 lg:block">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-6 whitespace-nowrap px-6 py-3 text-[11px] font-medium uppercase tracking-[0.14em] xl:gap-9 xl:text-[12px]">
            {nav.map((n) => (
              <li key={n.to}>
                <Link href={href(n.to)} className="relative py-1 transition-colors hover:text-copper">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity ${menu ? "opacity-100" : "opacity-0"}`} onClick={() => setMenu(false)} />
        <aside
          className={`absolute inset-y-0 start-0 flex w-[82%] max-w-sm flex-col bg-linen transition-[transform,visibility] duration-300 ${
            menu ? "visible translate-x-0" : "invisible -translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo className="h-11" />
            <button onClick={() => setMenu(false)} aria-label={t.nav.close}>
              <CloseIcon />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {[{ label: t.nav.home, to: "/" }, ...nav, { label: t.nav.contact, to: "/contact" }].map((n) => (
              <li key={n.to} className="border-b border-line/60">
                <Link href={href(n.to)} className="block py-3.5 font-serif text-xl">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="stitch mx-5 mb-6" />
        </aside>
      </div>

      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}
