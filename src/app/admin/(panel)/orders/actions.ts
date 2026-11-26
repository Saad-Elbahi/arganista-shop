"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner, requireStaff } from "@/lib/admin/auth";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export async function setOrderStatus(id: string, status: string) {
  if (!STATUSES.includes(status as never)) return;
  const { supabase } = await requireStaff();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function saveStaffNote(id: string, note: string) {
  const { supabase } = await requireStaff();
  await supabase.from("orders").update({ staff_note: note.trim() || null }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrder(id: string) {
  const { supabase } = await requireOwner();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/admin", "layout");
  redirect("/admin/orders");
}
