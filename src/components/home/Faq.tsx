import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { fill } from "@/lib/format";
import { jsonLd } from "@/lib/seo";
import { StarDivider } from "@/components/moroccan/Ornaments";

/** Visible FAQ + matching FAQPage data for Google. */
export function Faq({ lang, shippingFee, freeShippingFrom }: { lang: Locale; shippingFee: number; freeShippingFrom: number }) {
  const t = getDictionary(lang).faq;
  const values = { fee: String(shippingFee), free: String(freeShippingFrom), open: site.boutique.opens, close: site.boutique.closes };
  const items = t.items.map((i) => ({ q: i.q, a: fill(i.a, values) }));
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structured)} />
      <h2 className="h-section text-center">{t.title}</h2>
      <StarDivider className="mt-5" />
      <div className="mt-10 divide-y divide-line border-y border-line">
        {items.map((i) => (
          <details key={i.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
              {i.q}
              <span className="text-xl leading-none text-copper transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-taupe">{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
