import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { alternates } from "@/lib/seo";
import { getCatalog } from "@/lib/catalog";
import { site as config } from "@/config/site";
import { fill } from "@/lib/format";
import { BoutiqueGallery } from "@/components/boutique/BoutiqueGallery";
import { Khatam, StarDivider } from "@/components/moroccan/Ornaments";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).contact;
  const m = getDictionary(lang).meta;
  return { title: t.title, description: m.contactDescription, alternates: alternates(lang, "/contact") };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const t = d.contact;
  const { settings: site } = await getCatalog();
  const { lat, lng, mapsUrl, name, nameAr, phone, phoneDisplay, opens, closes, photos } = config.boutique;
  const tel = `tel:+212${phone.slice(1)}`;
  const embed = `https://www.google.com/maps?q=${lat},${lng}&z=13&hl=${lang}&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <>
      <section className="mx-auto grid max-w-[1400px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-20">
        <div>
          <h1 className="h-section">{t.title}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-taupe">{t.text}</p>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="btn-primary mt-8 bg-[#25D366] hover:bg-[#1fb857]">
            <WhatsAppIcon width={17} height={17} /> {t.whatsapp}
          </a>
          <dl className="mt-10 grid gap-6 border-t border-line pt-8 text-[15px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">WhatsApp</dt>
              <dd className="mt-1.5" dir="ltr">+{site.whatsapp}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.email}</dt>
              <dd className="mt-1.5"><a href={`mailto:${site.email}`} className="text-leaf hover:underline">{site.email}</a></dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.phone}</dt>
              <dd className="mt-1.5" dir="ltr"><a href={tel} className="text-leaf hover:underline">{phoneDisplay}</a></dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.hours}</dt>
              <dd className="mt-1.5">{fill(t.hoursValue, { open: opens, close: closes })}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{d.product.delivery}</dt>
              <dd className="mt-1.5 max-w-md text-taupe">{d.product.deliveryText}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe">{t.follow}</dt>
              <dd className="mt-2 flex gap-2">
                <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-line p-2.5 hover:border-leaf hover:text-leaf"><InstagramIcon width={17} height={17} /></a>
                <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-line p-2.5 hover:border-leaf hover:text-leaf"><FacebookIcon width={17} height={17} /></a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Boutique + map */}
        <div id="boutique" className="bg-zellige scroll-mt-28 overflow-hidden rounded-lg border border-copper/30 bg-cream">
          <div className="p-6 sm:p-8">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper"><Khatam size={16} /> {t.boutiqueTitle}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4">
              <h2 className="text-[26px] tracking-[-0.01em]">{name}</h2>
              <span className="font-ruqaa text-[28px] leading-none text-copper" lang="ar" dir="rtl">{nameAr}</span>
            </div>
            <p className="mt-1 text-[15px]">{site.address}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-taupe">{t.boutiqueText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={directions} target="_blank" rel="noreferrer" className="btn-primary">{t.directions}</a>
              <a href={tel} className="btn-outline">{t.call}</a>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-outline">{t.openMaps}</a>
            </div>
          </div>
          <iframe
            title={name}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[340px] w-full border-0 lg:h-[400px]"
          />
        </div>
      </section>

      {/* Boutique photos (from our Google Maps listing) */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-16">
        <div className="mb-10 text-center">
          <h2 className="h-section">{t.gallery}</h2>
          <StarDivider className="mt-5" />
        </div>
        <BoutiqueGallery photos={photos} alt={name} layout="grid" />
      </section>
    </>
  );
}
