import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { mad, PageHeader, StatusBadge } from "@/components/admin/ui";
import { IconPhone } from "@/components/admin/AdminIcons";
import { WhatsAppIcon } from "@/components/icons";
import { OrderTools, StaffNote, StatusControl } from "./OrderControls";

export const metadata: Metadata = { title: "Commande" };
export const instant = false;

type Item = { slug: string; name: string; label: string | null; price: number; qty: number; total: number };

/** 06xxxxxxxx → 2126xxxxxxxx for wa.me links */
const intl = (phone: string) => phone.replace(/^\+/, "").replace(/^00/, "").replace(/^0/, "212");

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { supabase, staff } = await requireStaff();
  const { id } = await params;
  const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();
  const items = o.items as Item[];
  const created = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(o.created_at));
  const waText = encodeURIComponent(
    `Bonjour ${o.customer_name}, ici Arganista 🌿\nNous avons bien reçu votre commande ${o.number} (${mad(Number(o.total))}).\nPouvez-vous nous confirmer l’adresse de livraison : ${o.address}, ${o.city} ?\nMerci !`,
  );

  return (
    <>
      <PageHeader
        title={`Commande ${o.number}`}
        subtitle={<span className="inline-flex flex-wrap items-center gap-2"><StatusBadge status={o.status} /> {created}</span>}
        back={{ href: "/admin/orders", label: "Commandes" }}
        actions={<OrderTools id={o.id} number={o.number} owner={staff.role === "owner"} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="admin-card no-print p-6">
            <h2 className="mb-4 font-semibold">Suivi</h2>
            <StatusControl id={o.id} status={o.status} />
          </section>

          <section className="admin-card overflow-hidden">
            <h2 className="px-6 pt-6 font-semibold">Articles</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="border-y border-line bg-[#faf8f5]">
                <tr>
                  <th className="admin-th ps-6">Produit</th>
                  <th className="admin-th text-end">Prix</th>
                  <th className="admin-th text-end">Qté</th>
                  <th className="admin-th pe-6 text-end">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="admin-td ps-6">
                      {it.name}
                      {it.label && <span className="block text-xs text-taupe">{it.label}</span>}
                    </td>
                    <td className="admin-td text-end tabular-nums">{mad(Number(it.price))}</td>
                    <td className="admin-td text-end tabular-nums">{it.qty}</td>
                    <td className="admin-td pe-6 text-end font-medium tabular-nums">{mad(Number(it.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="space-y-2 border-t border-line bg-[#fcfbf9] px-6 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-taupe">Sous-total</dt><dd className="tabular-nums">{mad(Number(o.subtotal))}</dd></div>
              <div className="flex justify-between"><dt className="text-taupe">Livraison</dt><dd className="tabular-nums">{Number(o.shipping) === 0 ? "Gratuite" : mad(Number(o.shipping))}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total à encaisser</dt><dd className="tabular-nums">{mad(Number(o.total))}</dd></div>
            </dl>
          </section>

          <section className="admin-card no-print p-6">
            <h2 className="mb-3 font-semibold">Note interne</h2>
            <StaffNote id={o.id} note={o.staff_note ?? ""} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="admin-card p-6">
            <h2 className="mb-4 font-semibold">Client</h2>
            <p className="font-medium">{o.customer_name}</p>
            <p className="mt-1 text-sm" dir="ltr">{o.phone}</p>
            <div className="no-print mt-4 flex flex-col gap-2">
              <a href={`https://wa.me/${intl(o.phone)}?text=${waText}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1fb857]">
                <WhatsAppIcon width={16} height={16} /> Écrire sur WhatsApp
              </a>
              <a href={`tel:${o.phone}`} className="admin-btn justify-center">
                <IconPhone width={16} height={16} /> Appeler
              </a>
            </div>
          </section>
          <section className="admin-card p-6">
            <h2 className="mb-3 font-semibold">Livraison</h2>
            <p className="text-sm leading-relaxed">{o.address}<br /><span className="font-medium">{o.city}</span></p>
            <p className="mt-3 text-xs text-taupe">Paiement à la livraison · langue du client : {String(o.lang).toUpperCase()}</p>
          </section>
          {o.note && (
            <section className="admin-card border-copper/30 bg-copper-soft/40 p-6">
              <h2 className="mb-2 font-semibold">Note du client</h2>
              <p className="text-sm leading-relaxed">{o.note}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
