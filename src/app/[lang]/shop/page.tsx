import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { ShopClient } from "./ShopClient";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).shop.title } : {};
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <ShopClient />
    </Suspense>
  );
}
