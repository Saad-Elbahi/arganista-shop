import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { getDictionary } from "@/i18n/dictionaries";
import { categories } from "@/data/products";
import { Empty, mad, PageHeader, Pill } from "@/components/admin/ui";
import { IconPlus, IconSearch } from "@/components/admin/AdminIcons";
import { ActiveToggle } from "./ActiveToggle";

export const metadata: Metadata = { title: "Produits" };
export const instant = false;

type Row = {
  id: string;
  slug: string;
  category: string;
  active: boolean;
  badges: string[];
  name: { fr: string };
  updated_at: string;
  product_variants: { price: number; compare_at: number | null; in_stock: boolean; label: string | null }[];
  product_images: { url: string; position: number }[];
};

const fr = getDictionary("fr");

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { supabase } = await requireStaff();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.c === "string" ? sp.c : "";
  const status = typeof sp.s === "string" ? sp.s : "";

  let query = supabase
    .from("products")
    .select("id, slug, category, active, badges, name, updated_at, product_variants(price, compare_at, in_stock, label), product_images(url, position)")
    .order("position")
    .order("created_at");
  if (cat) query = query.eq("category", cat);
  if (status === "active") query = query.eq("active", true);
  if (status === "hidden") query = query.eq("active", false);
  if (q) query = query.or(`name->>fr.ilike.%${q.replace(/[%,()]/g, "")}%,slug.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  const { count: total } = await supabase.from("products").select("id", { count: "exact", head: true });

  return (
    <>
      <PageHeader
        title="Produits"
        subtitle={`${total ?? 0} produits au catalogue`}
        actions={
          <Link href="/admin/products/new" className="admin-btn-primary">
            <IconPlus width={16} height={16} /> Nouveau produit
          </Link>
        }
      />
      {sp.deleted && <p className="mb-4 rounded-lg border border-leaf/20 bg-leaf-soft px-4 py-3 text-sm text-leaf">Produit supprimé.</p>}

      <form className="admin-card mb-4 flex flex-wrap items-center gap-3 p-3">
        <label className="relative min-w-56 flex-1">
          <IconSearch className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-taupe" width={16} height={16} />
          <input name="q" defaultValue={q} placeholder="Rechercher un produit…" className="admin-input ps-9" />
        </label>
        <select name="c" defaultValue={cat} className="admin-input w-auto">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{fr.categories[c.key]}</option>
          ))}
        </select>
        <select name="s" defaultValue={status} className="admin-input w-auto">
          <option value="">Tous les statuts</option>
          <option value="active">En ligne</option>
          <option value="hidden">Masqués</option>
        </select>
        <button className="admin-btn">Filtrer</button>
        {(q || cat || status) && <Link href="/admin/products" className="text-sm text-taupe hover:text-ink">Effacer</Link>}
      </form>

      {rows.length === 0 ? (
        <Empty
          title={q || cat || status ? "Aucun résultat" : "Aucun produit"}
          text={q || cat || status ? "Essayez d’autres filtres." : "Ajoutez votre premier produit pour l’afficher dans la boutique."}
          action={<Link href="/admin/products/new" className="admin-btn-primary"><IconPlus width={16} height={16} /> Nouveau produit</Link>}
        />
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-[#faf8f5]">
              <tr>
                <th className="admin-th w-[46%]">Produit</th>
                <th className="admin-th">Catégorie</th>
                <th className="admin-th">Prix</th>
                <th className="admin-th">Stock</th>
                <th className="admin-th text-end">En ligne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.map((p) => {
                const img = [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url;
                const prices = p.product_variants.map((v) => Number(v.price));
                const min = Math.min(...prices), max = Math.max(...prices);
                const out = p.product_variants.filter((v) => !v.in_stock).length;
                const promo = p.product_variants.some((v) => v.compare_at && Number(v.compare_at) > Number(v.price));
                return (
                  <tr key={p.id} className={`hover:bg-[#faf8f5] ${p.active ? "" : "opacity-60"}`}>
                    <td className="admin-td">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-[#f7f6f3]">
                          {img && <Image src={img} alt="" fill sizes="48px" className="object-cover" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium hover:text-leaf">{p.name.fr}</span>
                          <span className="mt-1 flex flex-wrap gap-1">
                            {p.badges.includes("best") && <Pill tone="amber">Best-seller</Pill>}
                            {p.badges.includes("new") && <Pill tone="green">Nouveau</Pill>}
                            {promo && <Pill tone="red">Promo</Pill>}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-td text-taupe">{fr.categories[p.category as keyof typeof fr.categories] ?? p.category}</td>
                    <td className="admin-td tabular-nums">
                      {prices.length ? (min === max ? mad(min) : `${mad(min)} – ${mad(max)}`) : "—"}
                      {p.product_variants.length > 1 && <span className="block text-xs text-taupe">{p.product_variants.length} formats</span>}
                    </td>
                    <td className="admin-td">
                      {p.product_variants.length === 0 ? <Pill tone="red">Aucun format</Pill> : out === 0 ? <Pill tone="green">En stock</Pill> : out === p.product_variants.length ? <Pill tone="red">Rupture</Pill> : <Pill tone="amber">{out} en rupture</Pill>}
                    </td>
                    <td className="admin-td text-end">
                      <ActiveToggle id={p.id} active={p.active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
