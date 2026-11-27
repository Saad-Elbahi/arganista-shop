import type { Locale } from "@/i18n/config";

/** Price with small superscript decimals, e.g. 243 ⁰⁰ dh — the classic beauty-retail look. */
export function Price({ amount, lang, className = "" }: { amount: number; lang: Locale; className?: string }) {
  const [int, dec] = amount.toFixed(2).split(".");
  const intFmt = new Intl.NumberFormat("fr-MA", { numberingSystem: "latn" }).format(Number(int));
  return (
    <span className={`whitespace-nowrap tabular-nums ${className}`} dir="ltr">
      {intFmt}
      <sup className="ms-px text-[0.62em] font-medium">,{dec}</sup> {lang === "ar" ? "درهم" : "dh"}
    </span>
  );
}
