import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { fill } from "@/lib/format";
import { BoutiqueGallery } from "./BoutiqueGallery";

const b = site.boutique;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;

function Stars() {
  return (
    <span className="flex text-[#e0a526]" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" /></svg>
      ))}
    </span>
  );
}

/** Boutique info card next to a photo mosaic — used on the homepage. */
export function BoutiqueSection({ lang, address }: { lang: Locale; address: string }) {
  const t = getDictionary(lang).contact;
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-16 lg:py-20">
      <h2 className="h-section mb-10 text-center">{t.visitTitle}</h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-8">
        <BoutiqueCard lang={lang} address={address} />
        <BoutiqueGallery photos={b.photos} alt={b.name} />
      </div>
    </section>
  );
}

export function BoutiqueCard({ lang, address }: { lang: Locale; address: string }) {
  const t = getDictionary(lang).contact;
  return (
    <div className="flex flex-col rounded-lg bg-cream p-7 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{t.boutiqueTitle}</p>
      <h3 className="mt-2 text-[24px] leading-tight tracking-[-0.01em]">{b.name}</h3>
      <a href={b.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 text-sm hover:underline">
        <Stars />
        <span className="text-ink/75">{fill(t.googleReviews, { rating: b.googleRating.toFixed(1).replace(".", ","), count: String(b.googleReviews) })}</span>
      </a>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-taupe">{t.visitText}</p>

      <dl className="mt-6 space-y-4 border-t border-ink/10 pt-6 text-[15px]">
        <div>
          <dt className="sr-only">{t.boutiqueTitle}</dt>
          <dd>{address}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.hours}</dt>
          <dd className="mt-1">{fill(t.hoursValue, { open: b.opens, close: b.closes })}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.phone}</dt>
          <dd className="mt-1" dir="ltr"><a href={`tel:+212${b.phone.slice(1)}`} className="text-leaf hover:underline">{b.phoneDisplay}</a></dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap gap-3 pt-8">
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-primary px-6">{t.directions}</a>
        <a href={`tel:+212${b.phone.slice(1)}`} className="btn-outline px-6">{t.call}</a>
      </div>
    </div>
  );
}
