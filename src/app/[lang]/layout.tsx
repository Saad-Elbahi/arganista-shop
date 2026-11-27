import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Aref_Ruqaa, Inter, Tajawal } from "next/font/google";
import "../globals.css";
import { hasLocale, localeDir, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { getCatalog } from "@/lib/catalog";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header, SocialRail } from "@/components/Header";
import { Footer, WhatsAppFloat } from "@/components/Footer";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });
// calligraphic Arabic for the "Dar Arganista" name
const ruqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-ruqaa" });
const arabic = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-tajawal" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: "%s · Arganista" },
    description: t.meta.description,
    icons: { icon: "/images/brand/icon.png", apple: "/images/brand/icon.png" },
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { title: t.meta.title, description: t.meta.description, images: ["/images/ambiance/hero.jpg"] },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { products, settings } = await getCatalog();

  return (
    <html lang={lang} dir={localeDir(lang)} className={`${sans.variable} ${arabic.variable} ${ruqaa.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <I18nProvider lang={lang} dict={dict}>
          <CatalogProvider products={products} settings={settings}>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppFloat />
            <SocialRail />
          </CartProvider>
          </CatalogProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
