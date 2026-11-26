import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { PageHeader, Pill } from "@/components/admin/ui";
import { ProductForm } from "../ProductForm";
import type { ProductInput } from "../actions";

export const metadata: Metadata = { title: "Modifier le produit" };
export const instant = false;

type T = { fr?: string; en?: string; ar?: string } | null;
const t = (v: T) => ({ fr: v?.fr ?? "", en: v?.en ?? "", ar: v?.ar ?? "" });

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { supabase } = await requireStaff();
  const { id } = await params;
  const sp = await searchParams;
  const { data: p } = await supabase.from("products").select("*, product_variants(*), product_images(*)").eq("id", id).maybeSingle();
  if (!p) notFound();

  const initial: ProductInput = {
    id: p.id,
    slug: p.slug,
    category: p.category,
    ingredients: p.ingredients ?? [],
    badges: p.badges ?? [],
    active: p.active,
    tint: p.tint,
    name: t(p.name),
    tagline: t(p.tagline),
    description: t(p.description),
    howTo: t(p.how_to),
    keyIngredients: t(p.key_ingredients),
    variants: [...(p.product_variants ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ id: v.id, code: v.code, label: v.label ?? "", price: Number(v.price), compareAt: v.compare_at == null ? null : Number(v.compare_at), inStock: v.in_stock, imageUrl: v.image_url })),
    images: [...(p.product_images ?? [])].sort((a, b) => a.position - b.position).map((i) => i.url),
  };

  return (
    <>
      <PageHeader
        title={p.name?.fr || "Produit"}
        subtitle={<span className="inline-flex items-center gap-2">{p.active ? <Pill tone="green">En ligne</Pill> : <Pill>Masqué</Pill>} Modifié le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(p.updated_at))}</span>}
        back={{ href: "/admin/products", label: "Produits" }}
      />
      {sp.created && <p className="mb-5 rounded-lg border border-leaf/20 bg-leaf-soft px-4 py-3 text-sm text-leaf">Produit créé. {p.active ? "Il est déjà visible dans la boutique." : "Activez « En ligne » pour le publier."}</p>}
      {sp.saved && <p className="mb-5 rounded-lg border border-leaf/20 bg-leaf-soft px-4 py-3 text-sm text-leaf">Modifications enregistrées — la boutique est à jour.</p>}
      <ProductForm key={p.updated_at} initial={initial} publicUrl={`/fr/product/${p.slug}`} />
    </>
  );
}
