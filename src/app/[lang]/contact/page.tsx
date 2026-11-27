import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog } from "@/lib/catalog";
import { site as config } from "@/config/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).contact.title } : {};
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const t = d.contact;
  const { settings: site } = await getCatalog();
  const { lat, lng, mapsUrl, name } = config.boutique;
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
        <div id="boutique" className="scroll-mt-28 overflow-hidden rounded-lg border border-line bg-cream">
          <div className="p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-taupe">{t.boutiqueTitle}</p>
            <h2 className="mt-2 text-[24px] tracking-[-0.01em]">{name}</h2>
            <p className="mt-1 text-[15px]">{site.address}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-taupe">{t.boutiqueText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={directions} target="_blank" rel="noreferrer" className="btn-primary">{t.directions}</a>
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
    </>
  );
}
