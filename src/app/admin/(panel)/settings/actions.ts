"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireOwner, requireStaff } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import type { FormState } from "../../actions";

const num = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));

export async function saveShopSettings(_: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireOwner();
  const whatsapp = String(form.get("whatsapp") ?? "").replace(/\D/g, "");
  const shipping = num(form.get("shipping_fee"));
  const free = num(form.get("free_shipping_from"));
  if (!/^212[5-7]\d{8}$/.test(whatsapp)) return { error: "Numéro WhatsApp invalide : format international, ex. 212612345678." };
  if (!Number.isFinite(shipping) || shipping < 0 || !Number.isFinite(free) || free < 0) return { error: "Montants de livraison invalides." };
  const { error } = await supabase
    .from("settings")
    .update({
      whatsapp,
      email: String(form.get("email") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      instagram: String(form.get("instagram") ?? "").trim(),
      facebook: String(form.get("facebook") ?? "").trim(),
      shipping_fee: shipping,
      free_shipping_from: free,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: error.message };
  updateTag(CATALOG_TAG);
  return { ok: "Paramètres enregistrés — la boutique est à jour." };
}

export async function saveAccount(_: FormState, form: FormData): Promise<FormState> {
  const { supabase, staff } = await requireStaff();
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (name !== (staff.name ?? "")) {
    await supabase.auth.updateUser({ data: { full_name: name } });
    await supabase.rpc("set_my_name", { p_name: name });
  }
  if (password) {
    if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
    if (password !== String(form.get("confirm") ?? "")) return { error: "Les deux mots de passe ne correspondent pas." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
  }
  revalidatePath("/admin", "layout");
  return { ok: password ? "Mot de passe modifié." : "Profil enregistré." };
}
