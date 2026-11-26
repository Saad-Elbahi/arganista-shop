import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { dateTime, Empty, mad, ORDER_STATUS, PageHeader, StatusBadge } from "@/components/admin/ui";
import { IconDownload, IconSearch } from "@/components/admin/AdminIcons";

export const metadata: Metadata = { title: "Commandes" };
export const instant = false;

const PAGE = 25;
type Row = { id: string; number: string; status: string; total: number; created_at: string; customer_name: string; phone: string; city: string; items: { qty: number }[] };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { supabase } = await requireStaff();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in ORDER_STATUS ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase
    .from("orders")
    .select("id, number, status, total, created_at, customer_name, phone, city, items", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (status) query = query.eq("status", status);
  if (q) {
    const s = q.replace(/[%,()]/g, "");
    query = query.or(`number.ilike.%${s}%,customer_name.ilike.%${s}%,phone.ilike.%${s.replace(/\s/g, "")}%,city.ilike.%${s}%`);
  }
  const [{ data, count }, counts] = await Promise.all([
    query,
    Promise.all(Object.keys(ORDER_STATUS).map(async (k) => [k, (await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", k)).count ?? 0] as const)),
  ]);
  const rows = (data ?? []) as Row[];
  const byStatus = Object.fromEntries(counts);
  const all = counts.reduce((s, [, n]) => s + n, 0);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const qs = (patch: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    const merged = { status, q, page: undefined as number | undefined, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && u.set(k, String(v)));
    const s = u.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <PageHeader
        title="Commandes"
        subtitle={`${all} commandes au total`}
        actions={
          <a href={`/admin/orders/export${status ? `?status=${status}` : ""}`} className="admin-btn">
            <IconDownload width={16} height={16} /> Exporter (Excel/CSV)
          </a>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[["", "Toutes", all] as const, ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label, byStatus[k] ?? 0] as const)].map(([k, label, n]) => (
          <Link
            key={k || "all"}
            href={qs({ status: k })}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${status === k ? "bg-ink text-white" : "text-ink/70 hover:bg-black/[0.05]"}`}
          >
            {label}
            <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${status === k ? "bg-white/20" : "bg-black/[0.06]"}`}>{n}</span>
          </Link>
        ))}
      </div>

      <form className="admin-card mb-4 flex items-center gap-3 p-3">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="relative flex-1">
          <IconSearch className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-taupe" width={16} height={16} />
          <input name="q" defaultValue={q} placeholder="N° de commande, nom, téléphone ou ville…" className="admin-input ps-9" />
        </label>
        <button className="admin-btn">Rechercher</button>
      </form>

      {rows.length === 0 ? (
        <Empty title={q || status ? "Aucune commande trouvée" : "Aucune commande pour l’instant"} text={q || status ? "Modifiez la recherche ou le filtre." : "Les commandes passées sur la boutique apparaîtront ici."} />
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-[#faf8f5]">
              <tr>
                <th className="admin-th">Commande</th>
                <th className="admin-th">Date</th>
                <th className="admin-th">Client</th>
                <th className="admin-th">Ville</th>
                <th className="admin-th">Articles</th>
                <th className="admin-th">Statut</th>
                <th className="admin-th text-end">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {rows.map((o) => (
                <tr key={o.id} className={`hover:bg-[#faf8f5] ${o.status === "new" ? "bg-copper/[0.03]" : ""}`}>
                  <td className="admin-td font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-leaf">
                      {o.status === "new" && <span className="me-2 inline-block h-2 w-2 rounded-full bg-copper" />}
                      {o.number}
                    </Link>
                  </td>
                  <td className="admin-td text-taupe">{dateTime(o.created_at)}</td>
                  <td className="admin-td">
                    <Link href={`/admin/orders/${o.id}`} className="block">
                      {o.customer_name}
                      <span className="block text-xs text-taupe" dir="ltr">{o.phone}</span>
                    </Link>
                  </td>
                  <td className="admin-td">{o.city}</td>
                  <td className="admin-td tabular-nums text-taupe">{(o.items ?? []).reduce((s, i) => s + i.qty, 0)}</td>
                  <td className="admin-td"><StatusBadge status={o.status} /></td>
                  <td className="admin-td text-end font-medium tabular-nums">{mad(Number(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-taupe">Page {page} sur {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={qs({ page: page - 1 })} className="admin-btn">Précédent</Link>}
            {page < pages && <Link href={qs({ page: page + 1 })} className="admin-btn">Suivant</Link>}
          </div>
        </div>
      )}
    </>
  );
}
