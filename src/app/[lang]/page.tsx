import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { categories, type CategoryKey, type Product } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductTabs } from "@/components/home/ProductTabs";
import { RitualSplit } from "@/components/home/RitualSplit";
import { ArrowIcon, CashIcon, HandsIcon, LeafIcon, TruckIcon } from "@/components/icons";

const A = "/images/ambiance/";
const originImages = [`${A}argan.jpg`, `${A}saffron.jpg`, `${A}rose.jpg`];
// large photo shown in the "ritual" panel for each category
const ritualImages: Record<CategoryKey, string> = {
  huiles: `${A}argan.jpg`,
  serums: `${A}hero.jpg`,
  visage: `${A}rose.jpg`,
  hammam: `${A}riad.jpg`,
  cheveux: `${A}courtyard.jpg`,
  terroir: `${A}oil-pour.jpg`,
};

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { products, settings } = await getCatalog();
  const h = (p: string) => `/${lang}${p}`;
  const inCat = (c: CategoryKey) => products.filter((p) => p.category === c);
  const photo = (slug: string) => products.find((p) => p.slug === slug)?.images[0] ?? products[0]?.images[0] ?? "/images/brand/icon.png";

  const best = products.filter((p) => p.badges?.includes("best"));
  const bestSellers: Product[] = [...best, ...products.filter((p) => !best.includes(p) && p.category !== "terroir")];
  const newIn = [...products.filter((p) => p.badges?.includes("new")), ...products.filter((p) => !p.badges?.includes("new"))];
  const perkIcons = [CashIcon, TruckIcon, LeafIcon, HandsIcon];

  return (
    <>
      {/* PROMO BANNER */}
      <div className="mx-auto max-w-[1400px] px-3 pt-3 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 rounded-lg bg-leaf-dark px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#d9b98f]">{t.home.promoEyebrow}</p>
            <p className="mt-1 text-2xl font-semibold uppercase tracking-[0.02em] sm:text-[28px]">{t.home.promoTitle}</p>
            <p className="mt-1 text-sm text-white/80">{t.home.promoText}</p>
          </div>
          <Link href={h("/shop")} className="inline-flex w-fit items-center justify-center rounded-full bg-[#d9b98f] px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-leaf-dark transition hover:bg-white">
            {t.home.promoCta}
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="mt-3">
        <HeroSlider
          slides={[
            { image: `${A}hero.jpg`, ...t.home.slides[0], href: h("/shop"), tone: "dark", flip: true, split: true, position: "center 35%" },
            { image: `${A}argan.jpg`, ...t.home.slides[1], href: h("/shop?c=huiles"), tone: "light" },
            { image: `${A}oil-pour.jpg`, ...t.home.slides[2], href: h("/shop?c=terroir"), tone: "light", flip: true },
          ]}
        />
      </div>

      {/* INTRO + CATEGORY BUBBLES */}
      <section className="mx-auto max-w-[1400px] px-6 pb-4 pt-16 text-center lg:px-16">
        <h1 className="text-[22px] font-normal tracking-[-0.01em] sm:text-[26px]">{t.home.introTitle}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-taupe">{t.home.introText}</p>
        <ul className="no-scrollbar -mx-6 mt-12 flex snap-x gap-6 overflow-x-auto px-6 sm:gap-10 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0">
          {categories.map((c) => (
            <li key={c.key} className="shrink-0 snap-start">
              <Link href={h(`/shop?c=${c.key}`)} className="group flex w-[112px] flex-col items-center gap-4 sm:w-[136px]">
                <span className="relative block h-[112px] w-[112px] overflow-hidden rounded-full bg-[#f7f6f3] ring-1 ring-black/5 transition group-hover:ring-2 group-hover:ring-leaf sm:h-[136px] sm:w-[136px]">
                  <Image src={photo(c.slug)} alt="" fill sizes="136px" className="scale-[1.35] object-cover transition-transform duration-500 group-hover:scale-[1.45]" />
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">{t.categories[c.key]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* TABBED PRODUCTS 1 */}
      <ProductTabs
        viewAll={t.home.viewAll}
        tabs={[
          { label: t.home.bestSellers, products: bestSellers, href: h("/shop") },
          { label: t.home.newIn, products: newIn, href: h("/shop") },
          { label: t.categories.huiles, products: inCat("huiles"), href: h("/shop?c=huiles") },
        ]}
      />

      {/* RITUAL SPLIT */}
      <RitualSplit
        title={t.home.ritualTitle}
        cta={t.home.viewAll}
        items={categories.map((c) => ({ label: t.categories[c.key], href: h(`/shop?c=${c.key}`), image: ritualImages[c.key] }))}
      />

      {/* REASSURANCE */}
      <section className="mx-auto max-w-[1400px] px-6 py-14 lg:px-16">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 text-center lg:grid-cols-4">
          {t.perks.map((p, i) => {
            const Icon = perkIcons[i];
            return (
              <li key={p.title} className="flex flex-col items-center">
                <Icon width={26} height={26} className="text-ink" />
                <p className="mt-3 text-[16px]">{p.title}</p>
                <p className="mt-1 max-w-[220px] text-sm text-taupe">{p.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* TABBED PRODUCTS 2 */}
      <ProductTabs
        viewAll={t.home.viewAll}
        tabs={[
          { label: t.categories.visage, products: inCat("visage"), href: h("/shop?c=visage") },
          { label: t.categories.hammam, products: inCat("hammam"), href: h("/shop?c=hammam") },
          { label: t.categories.serums, products: inCat("serums"), href: h("/shop?c=serums") },
          { label: t.categories.terroir, products: inCat("terroir"), href: h("/shop?c=terroir") },
        ].filter((tb) => tb.products.length > 0)}
      />

      {/* BEAUTY ADVICE (WhatsApp) */}
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-[460px]">
          <Image src={`${A}amber.jpg`} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-blush-bg px-8 py-14 lg:px-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-taupe">{t.home.consultEyebrow}</p>
          <h2 className="mt-3 text-[30px] font-normal uppercase leading-tight tracking-[0.01em] sm:text-[40px]">{t.home.consultTitle}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/75">{t.home.consultText}</p>
          <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t.home.consultWa)}`} target="_blank" rel="noreferrer" className="btn-primary mt-8 w-fit px-10">
            {t.home.consultCta}
          </a>
        </div>
      </section>

      {/* ORIGINS — journal-style cards */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="h-section">{t.home.originsTitle}</h2>
          <Link href={h("/about")} className="hidden items-center gap-2 text-sm underline-offset-4 hover:underline sm:flex">
            {t.home.storyCta} <ArrowIcon width={15} height={15} />
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {t.home.origins.map((o, i) => (
            <article key={o.title} className="group text-center">
              <Link href={h("/about")} className="relative block aspect-[4/3] overflow-hidden rounded-sm">
                <Image src={originImages[i]} alt={o.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <h3 className="mt-5 text-[19px]">{o.title}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-taupe">{o.place}</p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-taupe">{o.text}</p>
              <Link href={h("/about")} className="mt-4 inline-flex items-center gap-3 text-sm">
                <span className="h-px w-6 bg-ink" /> {t.home.originsMore}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
