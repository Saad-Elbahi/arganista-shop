import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { dateTime, Empty, mad, PageHeader, Pill, Stat, StatusBadge } from "@/components/admin/ui";
import { IconAlert, IconPlus } from "@/components/admin/AdminIcons";

export const metadata: Metadata = { title: "Tableau de bord" };
export const instant = false;

type OrderRow = { id: string; number: string; status: string; total: number; created_at: string; customer_name: string; city: string; items: { name: string; label: string | null; qty: number; total: number }[] };

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca" }).format(d);
/** Request-time clock (this page is rendered per request). */
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);

export default async function Dashboard() {
  const { supabase, staff } = await requireStaff();
  const since = daysAgo(30).toISOString();

  const [ordersRes, productsRes, stockRes] = await Promise.all([
    supabase.from("orders").select("id, number, status, total, created_at, customer_name, city, items").gte("created_at", since).order("created_at", { ascending: false }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("product_variants").select("label, product_id, products(id, name)").eq("in_stock", false).limit(8),
  ]);
  const orders = (ordersRes.data ?? []) as OrderRow[];
  const valid = orders.filter((o) => o.status !== "cancelled");
  const today = dayKey(daysAgo(0));
  const todays = valid.filter((o) => dayKey(new Date(o.created_at)) === today);
  const revenue = valid.reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "new").length;

  // last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = daysAgo(13 - i);
    const key = dayKey(d);
    const total = valid.filter((o) => dayKey(new Date(o.created_at)) === key).reduce((s, o) => s + Number(o.total), 0);
    return { key, total, label: new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: "Africa/Casablanca" }).format(d) };
  });
  const max = Math.max(1, ...days.map((d) => d.total));

  // best sellers (30 days)
  const top = new Map<string, { name: string; qty: number; total: number }>();
  for (const o of valid)
    for (const it of o.items ?? []) {
      const k = it.name;
      const cur = top.get(k) ?? { name: it.name, qty: 0, total: 0 };
      cur.qty += it.qty;
      cur.total += Number(it.total);
      top.set(k, cur);
    }
  const best = [...top.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const outOfStock = (stockRes.data ?? []) as unknown as { label: string | null; products: { id: string; name: { fr: string } } | null }[];

  const hello = staff.name?.split(" ")[0] ?? staff.email.split("@")[0];

  return (
    <>
      <PageHeader
        title={`Bonjour ${hello}`}
        subtitle="Voici l’activité de la boutique sur les 30 derniers jours."
        actions={
          <Link href="/admin/products/new" className="admin-btn-primary">
            <IconPlus width={16} height={16} /> Nouveau produit
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Commandes aujourd’hui" value={todays.length} hint={mad(todays.reduce((s, o) => s + Number(o.total), 0))} tone="accent" />
        <Stat label="À traiter" value={pending} hint={pending ? <Link href="/admin/orders?status=new" className="text-copper underline">Voir les commandes</Link> : "Tout est à jour"} tone={pending ? "warn" : "default"} />
        <Stat label="Chiffre d’affaires · 30 j" value={mad(revenue)} hint={`${valid.length} commandes`} />
        <Stat label="Panier moyen" value={mad(valid.length ? Math.round(revenue / valid.length) : 0)} hint={`${productsRes.count ?? 0} produits en ligne`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="admin-card p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Ventes · 14 derniers jours</h2>
            <span className="text-xs text-taupe">{mad(days.reduce((s, d) => s + d.total, 0))}</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="relative w-full flex-1">
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-t-md transition-colors ${d.key === today ? "bg-copper" : "bg-leaf/80 group-hover:bg-leaf"}`}
                    style={{ height: `${Math.max(d.total ? 4 : 1.5, (d.total / max) * 100)}%` }}
                  />
                  <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">{mad(d.total)}</span>
                </div>
                <span className="text-[10px] text-taupe">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card p-6">
          <h2 className="font-semibold">Meilleures ventes</h2>
          {best.length === 0 ? (
            <p className="mt-6 text-sm text-taupe">Pas encore de ventes sur la période.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {best.map((b, i) => (
                <li key={b.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sand text-[11px] font-semibold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{b.name}</span>
                  <span className="text-xs tabular-nums text-taupe">{b.qty} vendus</span>
                </li>
              ))}
            </ol>
          )}
          {outOfStock.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-rose">
                <IconAlert width={16} height={16} /> En rupture
              </h3>
              <ul className="mt-3 space-y-2">
                {outOfStock.map((v, i) => (
                  <li key={i} className="text-sm">
                    <Link href={`/admin/products/${v.products?.id}`} className="hover:underline">
                      {v.products?.name.fr} {v.label && <span className="text-taupe">· {v.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Dernières commandes</h2>
          <Link href="/admin/orders" className="text-sm text-leaf hover:underline">Tout voir</Link>
        </div>
        {orders.length === 0 ? (
          <Empty title="Aucune commande pour l’instant" text="Les commandes passées sur la boutique apparaîtront ici en temps réel." />
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-[#faf8f5]">
                <tr>
                  <th className="admin-th">Commande</th>
                  <th className="admin-th">Client</th>
                  <th className="admin-th hidden sm:table-cell">Date</th>
                  <th className="admin-th">Statut</th>
                  <th className="admin-th text-end">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="hover:bg-[#faf8f5]">
                    <td className="admin-td font-medium">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-leaf">{o.number}</Link>
                    </td>
                    <td className="admin-td">
                      {o.customer_name} <span className="text-taupe">· {o.city}</span>
                    </td>
                    <td className="admin-td hidden text-taupe sm:table-cell">{dateTime(o.created_at)}</td>
                    <td className="admin-td"><StatusBadge status={o.status} /></td>
                    <td className="admin-td text-end font-medium tabular-nums">{mad(Number(o.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {staff.role === "owner" && (
        <p className="mt-8 text-xs text-taupe">
          Astuce : ajoutez vos collaborateurs depuis <Link href="/admin/team" className="underline">Équipe</Link> — <Pill>Éditeur</Pill> gère produits et commandes.
        </p>
      )}
    </>
  );
}
