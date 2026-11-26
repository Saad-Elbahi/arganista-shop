import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalog } from "@/lib/catalog";
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

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
      <div>
        <h1 className="font-serif text-5xl sm:text-6xl">{t.title}</h1>
        <p className="mt-5 max-w-md leading-relaxed text-taupe">{t.text}</p>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 bg-[#25D366] px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-[#1fb857]"
        >
          <WhatsAppIcon width={18} height={18} /> {t.whatsapp}
        </a>
        <dl className="mt-10 space-y-5 border-t border-line pt-8 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-taupe">WhatsApp</dt>
            <dd className="mt-1" dir="ltr">+{site.whatsapp}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-taupe">{t.email}</dt>
            <dd className="mt-1"><a href={`mailto:${site.email}`} className="hover:text-copper">{site.email}</a></dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-taupe">{d.product.delivery}</dt>
            <dd className="mt-1 max-w-md text-taupe">{d.product.deliveryText}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-taupe">{t.follow}</dt>
            <dd className="mt-2 flex gap-3">
              <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full border border-line p-2 hover:border-ink"><InstagramIcon width={18} height={18} /></a>
              <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-line p-2 hover:border-ink"><FacebookIcon width={18} height={18} /></a>
            </dd>
          </div>
        </dl>
      </div>
      <div className="arch relative aspect-[3/4] overflow-hidden">
        <Image src="/images/ambiance/courtyard.jpg" alt="Arganista" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
    </section>
  );
}
