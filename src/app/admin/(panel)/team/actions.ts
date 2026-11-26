"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { FormState } from "../../actions";

export async function addMember(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim() || null;
  const role = form.get("role") === "owner" ? "owner" : "editor";
  const password = String(form.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Adresse e-mail invalide." };

  const admin = createAdminClient();
  if (admin && password) {
    if (password.length < 8) return { error: "Le mot de passe provisoire doit contenir au moins 8 caractères." };
    const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
    if (error && !/already|registered|exists/i.test(error.message)) return { error: `Création du compte impossible : ${error.message}` };
  }

  const { error } = await supabase.rpc("add_staff", { p_email: email, p_role: role, p_name: name });
  if (error) {
    if (error.message.includes("user_not_found"))
      return {
        error: admin
          ? "Aucun compte avec cet e-mail : indiquez un mot de passe provisoire pour le créer."
          : "Aucun compte avec cet e-mail. Créez-le d’abord dans Supabase → Authentication → Add user, puis réessayez.",
      };
    return { error: error.message };
  }
  revalidatePath("/admin/team");
  return { ok: `${name ?? email} a été ajouté(e) à l’équipe.` };
}

export async function setRole(userId: string, role: "owner" | "editor") {
  const { supabase, staff } = await requireOwner();
  if (userId === staff.userId && role !== "owner") return; // never lock yourself out
  await supabase.from("staff").update({ role }).eq("user_id", userId);
  revalidatePath("/admin/team");
}

export async function removeMember(userId: string) {
  const { supabase, staff } = await requireOwner();
  if (userId === staff.userId) return;
  await supabase.from("staff").delete().eq("user_id", userId);
  revalidatePath("/admin/team");
}
