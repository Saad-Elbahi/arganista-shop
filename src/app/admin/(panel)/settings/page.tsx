import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { AccountForm, ShopSettingsForm } from "./SettingsForms";

export const metadata: Metadata = { title: "Paramètres" };
export const instant = false;

export default async function SettingsPage() {
  const { supabase, staff } = await requireStaff();
  const { data: shop } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();

  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {staff.role === "owner" && shop ? (
          <section className="admin-card p-6">
            <h2 className="font-semibold">Boutique</h2>
            <p className="mb-5 mt-1 text-sm text-taupe">Coordonnées et livraison affichées aux clients.</p>
            <ShopSettingsForm shop={{ ...shop, shipping_fee: Number(shop.shipping_fee), free_shipping_from: Number(shop.free_shipping_from) }} />
          </section>
        ) : (
          <section className="admin-card p-6 text-sm text-taupe">Les paramètres de la boutique sont gérés par le propriétaire.</section>
        )}
        <section className="admin-card h-fit p-6">
          <h2 className="mb-5 font-semibold">Mon compte</h2>
          <AccountForm name={staff.name ?? ""} email={staff.email} />
        </section>
      </div>
    </>
  );
}
