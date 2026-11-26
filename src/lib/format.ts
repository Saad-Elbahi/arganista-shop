import type { Locale } from "@/i18n/config";

export function formatPrice(amount: number, lang: Locale) {
  const n = new Intl.NumberFormat(lang === "ar" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(amount);
  return lang === "ar" ? `${n} درهم` : `${n} DH`;
}

export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
