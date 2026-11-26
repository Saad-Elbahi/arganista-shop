import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog, getProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "./ProductDetail";

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

  return (
    <>
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section className="bg-cream py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center font-serif text-4xl">{t.product.related}</h2>
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
