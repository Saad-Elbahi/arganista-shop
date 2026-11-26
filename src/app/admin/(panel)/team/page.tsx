import type { Metadata } from "next";
import { requireOwner } from "@/lib/admin/auth";
import { canCreateAccounts } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { AddMemberForm, MemberRow } from "./TeamClient";

export const metadata: Metadata = { title: "Équipe" };
export const instant = false;

export default async function TeamPage() {
  const { supabase, staff } = await requireOwner();
  const { data } = await supabase.from("staff").select("user_id, email, full_name, role").order("created_at");

  return (
    <>
      <PageHeader title="Équipe" subtitle="Les personnes qui peuvent gérer la boutique." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="admin-card">
          <ul className="divide-y divide-line/70">
            {(data ?? []).map((m) => (
              <MemberRow key={m.user_id} userId={m.user_id} email={m.email} name={m.full_name} role={m.role} self={m.user_id === staff.userId} />
            ))}
          </ul>
          <div className="border-t border-line bg-[#fcfbf9] px-5 py-4 text-xs leading-relaxed text-taupe">
            <p><strong className="text-ink">Éditeur</strong> : ajoute et modifie les produits, gère les commandes.</p>
            <p className="mt-1"><strong className="text-ink">Propriétaire</strong> : tout, plus l’équipe, les paramètres de la boutique et la suppression des commandes.</p>
          </div>
        </section>
        <section className="admin-card h-fit p-6">
          <h2 className="mb-4 font-semibold">Ajouter un membre</h2>
          <AddMemberForm canCreate={canCreateAccounts} />
        </section>
      </div>
    </>
  );
}
