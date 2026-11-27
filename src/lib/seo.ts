import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

/** Public address of the shop (used for canonical links, sitemap and structured data). */
export const SITE_URL = "https://arganista.ma";

/** Canonical URL + hreflang links for a page that exists in every language. */
export function alternates(lang: Locale, path = ""): Metadata["alternates"] {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/fr${path}`,
    },
  };
}

/** Renders a schema.org object for Google rich results. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
