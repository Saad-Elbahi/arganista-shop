import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "owner" | "editor";
export type Staff = { userId: string; email: string; name: string | null; role: StaffRole };

/** Signed-in team member, or redirect to the login page. */
export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");

  let { data: row } = await supabase.from("staff").select("user_id, email, full_name, role").eq("user_id", data.user.id).maybeSingle();
  if (!row) {
    // First account ever: becomes the owner automatically.
    const { data: claimed } = await supabase.rpc("claim_ownership");
    if (claimed) {
      ({ data: row } = await supabase.from("staff").select("user_id, email, full_name, role").eq("user_id", data.user.id).maybeSingle());
    }
  }
  if (!row) redirect("/admin/login?e=access");

  const staff: Staff = { userId: row.user_id, email: row.email, name: row.full_name, role: row.role };
  return { supabase, user: data.user, staff };
});

export async function requireOwner() {
  const ctx = await requireStaff();
  if (ctx.staff.role !== "owner") redirect("/admin?e=owner");
  return ctx;
}
