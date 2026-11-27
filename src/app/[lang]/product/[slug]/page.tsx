import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog, getProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "./ProductDetail";
import { SITE_URL, alternates, jsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProduct(slug);
  if (!p || !hasLocale(lang)) return {};
  return {
    title: p.name[lang],
    description: p.description[lang],
    alternates: alternates(lang, `/product/${slug}`),
    openGraph: { type: "website", title: p.name[lang], description: p.tagline[lang] || p.description[lang], images: p.images.slice(0, 1) },
  };
}

export default function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-2 lg:gap-16">
      <div className="aspect-[4/5] animate-pulse bg-sand" />
      <div className="space-y-4 pt-4">
        <div className="h-3 w-24 bg-sand" />
        <div className="h-12 w-3/4 bg-sand" />
        <div className="h-6 w-1/3 bg-sand" />
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/[lang]/product/[slug]">["params"] }) {
  const { lang, slug } = await params;
  const product = await getProduct(slug);
  const { products } = await getCatalog();
  if (!product || !hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  const related = [
    ...products.filter((p) => p.slug !== slug && p.category === product.category),
    ...products.filter((p) => p.slug !== slug && p.category !== product.category && p.ingredients.some((i) => product.ingredients.includes(i))),
  ].slice(0, 4);

  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const prices = product.variants.map((v) => v.price);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[lang],
    description: product.description[lang],
    image: product.images.map(abs),
    sku: product.slug,
    brand: { "@type": "Brand", name: "Arganista" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MAD",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.inStock) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${lang}/product/${product.slug}`,
      seller: { "@id": `${SITE_URL}/#org` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="border-t border-line py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="h-section mb-10 text-center">{t.product.related}</h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
