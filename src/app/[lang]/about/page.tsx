import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).about.title } : {};
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).about;
  const { products } = await getCatalog();
  const photo = (slug: string) => products.find((p) => p.slug === slug)?.images[0] ?? "/images/brand/icon.png";

  return (
    <>
      <section className="bg-cream px-6 py-20 text-center">
        <h1 className="font-serif text-5xl sm:text-6xl">{t.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl italic leading-snug text-taupe">{t.lead}</p>
        <div className="stitch mx-auto mt-10 max-w-[200px]" />
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="arch relative aspect-[3/4] overflow-hidden">
          <Image src="/images/ambiance/argan.jpg" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-5 leading-relaxed text-taupe">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p className="font-serif text-2xl italic text-leaf">{t.p3}</p>
        </div>
      </section>

      <section className="bg-leaf-dark py-20 text-cream">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center font-serif text-4xl">{t.valuesTitle}</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {t.values.map((v) => (
              <div key={v.title} className="border-t border-cream/25 pt-6 text-center">
                <h3 className="font-serif text-3xl italic">{v.title}</h3>
                <p className="mt-3 text-sm text-cream/75">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        <div className="relative aspect-square">
          <Image src="/images/ambiance/riad.jpg" alt="" fill sizes="25vw" className="object-cover" />
        </div>
        {["serum-anti-age-argan-figue-vitamine-e", "huile-pepins-figue-de-barbarie-bio", "pate-ghassouline-rose"].map((slug) => (
          <div key={slug} className="relative aspect-square overflow-hidden">
            <Image src={photo(slug)} alt="" fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </section>
    </>
  );
}
