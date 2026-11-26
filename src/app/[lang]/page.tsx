import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { categories, type IngredientKey } from "@/data/products";
import { getCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Newsletter } from "@/components/Footer";
import { ArrowIcon, CashIcon, HandsIcon, LeafIcon, TruckIcon } from "@/components/icons";

const originImages = ["/images/ambiance/argan.jpg", "/images/ambiance/saffron.jpg", "/images/ambiance/rose.jpg"];
// product whose packshot illustrates each ingredient
const ingredientProducts: Record<IngredientKey, string> = {
  argan: "huile-argan-cosmetique-bio",
  rose: "serum-anti-rides-rose",
  figue: "huile-pepins-figue-de-barbarie-bio",
  oranger: "shampoing-argan-fleur-oranger",
  ghassoul: "pate-ghassouline-rose",
  aloe: "gel-nettoyant-visage-aloe-rose",
};
const P = "/images/catalog/";

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
      {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-copper">{eyebrow}</p>}
      <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{title}</h2>
      {action}
    </div>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const { products } = await getCatalog();
  const photo = (slug: string) => products.find((p) => p.slug === slug)?.images[0] ?? products[0]?.images[0] ?? "/images/brand/icon.png";
  const h = (p: string) => `/${lang}${p}`;

  const best = products.filter((p) => p.badges?.includes("best"));
  const bestFour = [...best, ...products.filter((p) => !best.includes(p) && p.category !== "terroir")].slice(0, 4);
  const newIn = products.filter((p) => p.badges?.includes("new") || p.category === "hammam").slice(0, 4);
  const perkIcons = [CashIcon, TruckIcon, LeafIcon, HandsIcon];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-16">
          <div className="order-2 text-center lg:order-1 lg:text-start">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-copper">{t.hero.eyebrow}</p>
            <h1 className="mt-5 font-serif text-5xl italic leading-[1.05] text-ink sm:text-6xl lg:text-7xl xl:text-8xl">{t.hero.title}</h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-taupe lg:mx-0">{t.hero.text}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href={h("/shop")} className="group inline-flex items-center gap-3 bg-leaf px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream transition-colors hover:bg-leaf-dark">
                {t.hero.cta}
                <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link href={h("/about")} className="inline-flex items-center border border-ink/30 px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:border-ink hover:bg-ink hover:text-cream">
                {t.hero.cta2}
              </Link>
            </div>
            <div className="stitch mx-auto mt-12 max-w-xs lg:mx-0" />
          </div>
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <div className="arch relative aspect-[4/5] overflow-hidden border-[10px] border-linen shadow-[0_30px_60px_-30px_rgba(47,79,62,.45)]">
              <Image src="/images/ambiance/hero.jpg" alt="Arganista" fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover object-[60%_center]" />
            </div>
            <div className="arch absolute -bottom-6 -start-4 hidden aspect-[3/4] w-36 overflow-hidden border-[6px] border-linen shadow-xl sm:block lg:-start-12 lg:w-44">
              <Image src={`${P}figue-15ml.jpg`} alt="" fill sizes="180px" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className="border-y border-line bg-linen">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {t.perks.map((p, i) => {
            const Icon = perkIcons[i];
            return (
              <li key={p.title} className="flex flex-col items-center gap-2 border-line px-4 py-7 text-center sm:flex-row sm:text-start [&:not(:last-child)]:border-e">
                <Icon className="shrink-0 text-copper" width={28} height={28} />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em]">{p.title}</p>
                  <p className="mt-0.5 text-xs text-taupe">{p.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle title={t.home.shopByCategory} />
        <ul className="no-scrollbar -mx-6 flex snap-x gap-5 overflow-x-auto px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {categories.map((c) => (
            <li key={c.key} className="w-40 shrink-0 snap-start lg:w-auto">
              <Link href={h(`/shop?c=${c.key}`)} className="group block text-center">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                  <Image src={photo(c.slug)} alt={t.categories[c.key]} fill sizes="(min-width: 1024px) 16vw, 160px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-4 font-serif text-xl transition-colors group-hover:text-copper">{t.categories[c.key]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            eyebrow="Arganista"
            title={t.home.bestSellers}
            action={
              <Link href={h("/shop")} className="text-xs uppercase tracking-[0.2em] underline underline-offset-8 hover:text-copper">
                {t.home.viewAll}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {bestFour.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* ORIGINS — echoes the three arches on the boutique signage */}
      <section className="relative overflow-hidden bg-leaf-dark py-24 text-cream">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-copper-soft/80">{t.home.originsEyebrow}</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{t.home.originsTitle}</h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {t.home.origins.map((o, i) => (
              <div key={o.title} className="text-center">
                <div className="arch relative mx-auto aspect-[3/5] w-full max-w-[280px] overflow-hidden border border-cream/25 p-2">
                  <div className="arch relative h-full w-full overflow-hidden">
                    <Image src={originImages[i]} alt={o.title} fill sizes="280px" className="object-cover" />
                  </div>
                </div>
                <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-cream/60">{o.place}</p>
                <h3 className="mt-1 font-serif text-3xl italic">{o.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-cream/75">{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image src="/images/ambiance/riad.jpg" alt="Arganista" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-copper">{t.home.storyEyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{t.home.storyTitle}</h2>
          <p className="mt-6 leading-relaxed text-taupe">{t.home.storyText}</p>
          <Link href={h("/about")} className="mt-8 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] underline underline-offset-8 hover:text-copper">
            {t.home.storyCta}
            <ArrowIcon width={16} height={16} />
          </Link>
          <div className="stitch mt-12 max-w-xs" />
        </div>
      </section>

      {/* SHOP BY INGREDIENT */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle title={t.home.ingredientTitle} />
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {(Object.keys(ingredientProducts) as IngredientKey[]).map((k) => (
              <li key={k}>
                <Link href={h(`/shop?i=${k}`)} className="group flex flex-col items-center gap-3 text-center">
                  <span className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-full border border-line bg-linen">
                    <Image src={photo(ingredientProducts[k])} alt={t.ingredients[k]} fill sizes="140px" className="scale-125 object-cover transition-transform duration-700 group-hover:scale-[1.35]" />
                  </span>
                  <span className="text-sm font-medium group-hover:text-copper">{t.ingredients[k]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NEW IN */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle title={t.home.newIn} />
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {newIn.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* TERROIR */}
      <section className="grid bg-copper-soft lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <Image src="/images/ambiance/oil-pour.jpg" alt={t.home.terroirTitle} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 lg:px-20">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-copper">{t.home.terroirEyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-5xl">{t.home.terroirTitle}</h2>
          <p className="mt-5 max-w-md leading-relaxed text-taupe">{t.home.terroirText}</p>
          <Link href={h("/shop?c=terroir")} className="mt-8 inline-flex w-fit items-center gap-3 bg-copper px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-[#8d5533]">
            {t.home.terroirCta}
            <ArrowIcon width={16} height={16} />
          </Link>
        </div>
      </section>

      {/* BOUTIQUE */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-copper">{t.home.boutiqueEyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{t.home.boutiqueTitle}</h2>
          <p className="mt-6 leading-relaxed text-taupe">{t.home.boutiqueText}</p>
          <Link href={h("/contact")} className="mt-8 inline-flex items-center border border-ink/30 px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] hover:border-ink hover:bg-ink hover:text-cream">
            {t.home.boutiqueCta}
          </Link>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden lg:order-2">
          <Image src="/images/ambiance/courtyard.jpg" alt="Arganista" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <Newsletter />
    </>
  );
}
