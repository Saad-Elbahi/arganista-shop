import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { fill } from "@/lib/format";
import { Khatam, StarDivider } from "@/components/moroccan/Ornaments";
import { BoutiqueGallery } from "./BoutiqueGallery";

const b = site.boutique;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`;
const tel = `tel:+212${b.phone.slice(1)}`;

function Stars() {
  return (
    <span className="flex text-[#d39a2a]" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" /></svg>
      ))}
    </span>
  );
}

/** Title block: the name in Ruqaa calligraphy, the title and a star divider. */
export function DarHeading({ lang, as: H = "h2" }: { lang: Locale; as?: "h1" | "h2" }) {
  const t = getDictionary(lang).contact;
  return (
    <div className="text-center">
      <p className="font-ruqaa text-[44px] leading-none text-copper sm:text-[56px]" lang="ar" dir="rtl">{b.nameAr}</p>
      <H className="h-section mt-4">{t.visitTitle}</H>
      <StarDivider className="mt-5" />
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-taupe">{t.darTagline}</p>
    </div>
  );
}

/** Homepage section: zellige background, arch-framed photos around the info card. */
export function BoutiqueSection({ lang, address }: { lang: Locale; address: string }) {
  return (
    <section className="bg-zellige relative overflow-hidden bg-cream">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-16 lg:py-24">
        <DarHeading lang={lang} />
        <div className="mt-12">
          <BoutiqueGallery photos={b.photos} alt={`${b.name} — huile d’argan, Ourika`} aside={<BoutiqueCard lang={lang} address={address} />} />
        </div>
      </div>
    </section>
  );
}

/** Arch-topped card with the visit details. */
export function BoutiqueCard({ lang, address }: { lang: Locale; address: string }) {
  const t = getDictionary(lang).contact;
  const label = "text-[10px] font-semibold uppercase tracking-[0.2em] text-copper";
  return (
    <div className="arch flex flex-col items-center border border-copper/45 bg-linen p-1.5 shadow-[0_20px_50px_-30px_rgba(60,40,20,.45)]">
      <div className="arch flex h-full w-full flex-col items-center border border-copper/20 px-7 pb-8 pt-16 text-center">
        <Khatam size={30} className="text-copper" />
        <h3 className="mt-4 text-[26px] leading-tight tracking-[-0.01em]">{b.name}</h3>
        <a href={b.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-[13px] hover:underline">
          <Stars />
          <span className="text-ink/70">{fill(t.googleReviews, { rating: b.googleRating.toFixed(1).replace(".", ","), count: String(b.googleReviews) })}</span>
        </a>
        <p className="mt-4 text-sm leading-relaxed text-taupe">{t.visitText}</p>

        <dl className="mt-6 w-full space-y-4 border-t border-copper/20 pt-6 text-[15px]">
          <div>
            <dt className={label}>{t.boutiqueTitle}</dt>
            <dd className="mt-1">{address}</dd>
          </div>
          <div>
            <dt className={label}>{t.hours}</dt>
            <dd className="mt-1">{fill(t.hoursValue, { open: b.opens, close: b.closes })}</dd>
          </div>
          <div>
            <dt className={label}>{t.phone}</dt>
            <dd className="mt-1" dir="ltr"><a href={tel} className="text-leaf hover:underline">{b.phoneDisplay}</a></dd>
          </div>
        </dl>

        <div className="mt-auto flex flex-wrap justify-center gap-3 pt-8">
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="btn-primary px-6">{t.directions}</a>
          <a href={tel} className="btn-outline px-6">{t.call}</a>
        </div>
      </div>
    </div>
  );
}
