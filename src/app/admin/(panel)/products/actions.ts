"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { IMAGE_BUCKET } from "@/lib/supabase/env";
import { categoryKeys, ingredientKeys } from "@/data/products";

type Text = { fr: string; en: string; ar: string };
export type VariantInput = { id?: string; code?: string; label: string; price: number; compareAt: number | null; inStock: boolean; imageUrl: string | null };
export type ProductInput = {
  id?: string;
  slug: string;
  category: string;
  ingredients: string[];
  badges: string[];
  active: boolean;
  tint: string;
  name: Text;
  tagline: Text;
  description: Text;
  howTo: Text;
  keyIngredients: Text;
  variants: VariantInput[];
  images: string[];
};
export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

const clean = (t: Text): Text => ({ fr: t.fr.trim(), en: t.en.trim(), ar: t.ar.trim() });
const slugify = async (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const storagePath = (url: string) => {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
};

export async function saveProduct(input: ProductInput): Promise<SaveResult> {
  const { supabase } = await requireStaff();

  // ── validation
  const slug = await slugify(input.slug || input.name.fr);
  if (!input.name.fr.trim()) return { ok: false, error: "Le nom en français est obligatoire." };
  if (!slug) return { ok: false, error: "Le lien du produit (slug) est invalide." };
  if (!categoryKeys.includes(input.category as never)) return { ok: false, error: "Choisissez une catégorie." };
  if (input.variants.length === 0) return { ok: false, error: "Ajoutez au moins un format avec un prix." };
  for (const v of input.variants) {
    if (!Number.isFinite(v.price) || v.price < 0) return { ok: false, error: "Chaque format doit avoir un prix valide." };
    if (v.compareAt != null && (!Number.isFinite(v.compareAt) || v.compareAt < 0)) return { ok: false, error: "Ancien prix invalide." };
  }
  if (input.variants.length > 1 && input.variants.some((v) => !v.label.trim())) return { ok: false, error: "Donnez un nom à chaque format (ex. 30 ml)." };

  // stable codes: keep existing ones, derive new ones from the label
  const used = new Set<string>();
  const variants: (VariantInput & { code: string })[] = [];
  for (const v of input.variants) {
    let code = v.code || (await slugify(v.label)) || "std";
    while (used.has(code)) code = `${code}-2`;
    used.add(code);
    variants.push({ ...v, code });
  }

  const row = {
    slug,
    category: input.category,
    ingredients: input.ingredients.filter((i) => ingredientKeys.includes(i as never)),
    badges: input.badges.filter((b) => b === "best" || b === "new"),
    active: input.active,
    tint: /^#[0-9a-f]{6}$/i.test(input.tint) ? input.tint : "#ece3d4",
    name: clean(input.name),
    tagline: clean(input.tagline),
    description: clean(input.description),
    how_to: clean(input.howTo),
    key_ingredients: clean(input.keyIngredients),
  };

  // ── product row
  let id = input.id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { ok: false, error: error.code === "23505" ? "Ce lien (slug) est déjà utilisé par un autre produit." : error.message };
  } else {
    const { data: last } = await supabase.from("products").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase.from("products").insert({ ...row, position: (last?.position ?? 0) + 1 }).select("id").single();
    if (error) return { ok: false, error: error.code === "23505" ? "Ce lien (slug) est déjà utilisé par un autre produit." : error.message };
    id = data.id as string;
  }

  // ── variants
  const { data: existingV } = await supabase.from("product_variants").select("id").eq("product_id", id);
  const keepV = new Set(variants.filter((v) => v.id).map((v) => v.id));
  const dropV = (existingV ?? []).map((v) => v.id).filter((vid) => !keepV.has(vid));
  if (dropV.length) await supabase.from("product_variants").delete().in("id", dropV);
  for (const [position, v] of variants.entries()) {
    const vr = { product_id: id, code: v.code, label: v.label.trim() || null, price: v.price, compare_at: v.compareAt, in_stock: v.inStock, image_url: v.imageUrl, position };
    const { error } = v.id ? await supabase.from("product_variants").update(vr).eq("id", v.id) : await supabase.from("product_variants").insert(vr);
    if (error) return { ok: false, error: `Format « ${v.label || "unique"} » : ${error.message}` };
  }

  // ── images (order = position)
  const { data: existingI } = await supabase.from("product_images").select("id, url").eq("product_id", id);
  const removed = (existingI ?? []).filter((i) => !input.images.includes(i.url));
  if (removed.length) {
    await supabase.from("product_images").delete().in("id", removed.map((i) => i.id));
    const paths = removed.map((i) => storagePath(i.url)).filter(Boolean) as string[];
    if (paths.length) {
      const { data: elsewhere } = await supabase.from("product_images").select("url").neq("product_id", id);
      const inUse = new Set((elsewhere ?? []).map((i) => storagePath(i.url)));
      const orphan = paths.filter((p) => !inUse.has(p) && !variants.some((v) => v.imageUrl && storagePath(v.imageUrl) === p));
      if (orphan.length) await supabase.storage.from(IMAGE_BUCKET).remove(orphan);
    }
  }
  for (const [position, url] of input.images.entries()) {
    const found = (existingI ?? []).find((i) => i.url === url);
    if (found) await supabase.from("product_images").update({ position }).eq("id", found.id);
    else await supabase.from("product_images").insert({ product_id: id, url, position });
  }

  updateTag(CATALOG_TAG);
  return { ok: true, id };
}

export async function setActive(id: string, active: boolean) {
  const { supabase } = await requireStaff();
  await supabase.from("products").update({ active }).eq("id", id);
  updateTag(CATALOG_TAG);
}

export async function duplicateProduct(id: string) {
  const { supabase } = await requireStaff();
  const { data: p } = await supabase.from("products").select("*, product_variants(*), product_images(*)").eq("id", id).single();
  if (!p) return;
  const { id: _, created_at, updated_at, product_variants, product_images, ...rest } = p;
  void _; void created_at; void updated_at;
  const { data: copy } = await supabase
    .from("products")
    .insert({ ...rest, slug: `${p.slug}-copie-${Date.now().toString(36).slice(-4)}`, active: false, name: { ...p.name, fr: `${p.name.fr} (copie)` } })
    .select("id")
    .single();
  if (!copy) return;
  const reparent = (rows: Record<string, unknown>[] = []) =>
    rows.map((row) => {
      const next: Record<string, unknown> = { ...row, product_id: copy.id };
      delete next.id;
      return next;
    });
  if (product_variants?.length) await supabase.from("product_variants").insert(reparent(product_variants));
  if (product_images?.length) await supabase.from("product_images").insert(reparent(product_images));
  updateTag(CATALOG_TAG);
  redirect(`/admin/products/${copy.id}`);
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireStaff();
  const { data: imgs } = await supabase.from("product_images").select("url").eq("product_id", id);
  const { data: vimgs } = await supabase.from("product_variants").select("image_url").eq("product_id", id);
  await supabase.from("products").delete().eq("id", id);
  const paths = [...(imgs ?? []).map((i) => i.url), ...(vimgs ?? []).map((v) => v.image_url ?? "")].map(storagePath).filter(Boolean) as string[];
  // a duplicated product may share photos: only delete files no other product uses
  if (paths.length) {
    const { data: still } = await supabase.from("product_images").select("url");
    const inUse = new Set((still ?? []).map((i) => storagePath(i.url)));
    const orphan = [...new Set(paths)].filter((p) => !inUse.has(p));
    if (orphan.length) await supabase.storage.from(IMAGE_BUCKET).remove(orphan);
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/products?deleted=1");
}
