import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { L } from "@/i18n/config";
import { products as starter, type CategoryKey, type IngredientKey, type Product } from "@/data/products";
import { site } from "@/config/site";
import { createPublicClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";

export type ShopSettings = {
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  shippingFee: number;
  freeShippingFrom: number;
};

export type Catalog = { products: Product[]; settings: ShopSettings; live: boolean };

export const CATALOG_TAG = "catalog";

const defaultSettings: ShopSettings = {
  whatsapp: site.whatsapp,
  email: site.email,
  address: site.address,
  instagram: site.instagram,
  facebook: site.facebook,
  shippingFee: site.shippingFee,
  freeShippingFrom: site.freeShippingFrom,
};

type Row = {
  id: string;
  slug: string;
  category: string;
  ingredients: string[];
  badges: string[];
  name: L;
  tagline: Partial<L>;
  description: Partial<L>;
  how_to: Partial<L>;
  key_ingredients: Partial<L>;
  tint: string;
  product_variants: { code: string; label: string | null; price: number; compare_at: number | null; in_stock: boolean; image_url: string | null; position: number }[];
  product_images: { url: string; position: number }[];
};

const full = (l: Partial<L> | null | undefined): L => ({ fr: l?.fr ?? "", en: l?.en || l?.fr || "", ar: l?.ar || l?.fr || "" });

export function rowToProduct(r: Row): Product {
  const variants = [...r.product_variants].sort((a, b) => a.position - b.position);
  const images = [...r.product_images].sort((a, b) => a.position - b.position).map((i) => i.url);
  const variantImages = Object.fromEntries(variants.filter((v) => v.image_url).map((v) => [v.code, v.image_url!]));
  return {
    id: r.id,
    slug: r.slug,
    category: r.category as CategoryKey,
    ingredients: r.ingredients as IngredientKey[],
    badges: r.badges as Product["badges"],
    name: full(r.name),
    tagline: full(r.tagline),
    description: full(r.description),
    howTo: full(r.how_to),
    keyIngredients: full(r.key_ingredients),
    tint: r.tint,
    images: images.length ? images : ["/images/brand/icon.png"],
    variantImages,
    variants: variants.map((v) => ({
      id: v.code,
      label: v.label ?? undefined,
      price: Number(v.price),
      compareAt: v.compare_at == null ? undefined : Number(v.compare_at),
      inStock: v.in_stock,
    })),
  };
}

export const PRODUCT_SELECT = "*, product_variants(*), product_images(*)";

/** Live catalog + shop settings, cached and refreshed whenever the admin saves. */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  if (!supabaseConfigured) return { products: starter, settings: defaultSettings, live: false };

  const sb = createPublicClient();
  const [prods, settings] = await Promise.all([
    sb.from("products").select(PRODUCT_SELECT).eq("active", true).order("position").order("created_at"),
    sb.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (prods.error) {
    console.error("[catalog] falling back to the starter catalog:", prods.error.message);
    return { products: starter, settings: defaultSettings, live: false };
  }
  const s = settings.data;
  return {
    products: (prods.data as Row[]).map(rowToProduct).filter((p) => p.variants.length > 0),
    settings: s
      ? {
          whatsapp: s.whatsapp,
          email: s.email,
          // "Maroc" is the database placeholder: show the real boutique address until it is edited in /admin/settings
          address: s.address && s.address !== "Maroc" ? s.address : site.address,
          instagram: s.instagram || site.instagram,
          facebook: s.facebook || site.facebook,
          shippingFee: Number(s.shipping_fee),
          freeShippingFrom: Number(s.free_shipping_from),
        }
      : defaultSettings,
    live: true,
  };
}

export async function getProduct(slug: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug);
}
