import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { ShopClient } from "./ShopClient";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const m = getDictionary(lang).meta;
  return { title: m.shopTitle, description: m.shopDescription, alternates: alternates(lang, "/shop") };
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <ShopClient />
    </Suspense>
  );
}
