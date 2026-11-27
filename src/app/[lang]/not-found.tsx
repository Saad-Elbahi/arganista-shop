"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="px-6 py-32 text-center">
      <p className="text-6xl font-light text-leaf">404</p>
      <h1 className="mt-4 font-serif text-4xl">{t.notFound.title}</h1>
      <p className="mt-3 text-taupe">{t.notFound.text}</p>
      <Link href={href("/shop")} className="mt-8 inline-block bg-leaf px-8 py-4 text-xs uppercase tracking-[0.2em] text-cream">
        {t.nav.shop}
      </Link>
    </div>
  );
}
