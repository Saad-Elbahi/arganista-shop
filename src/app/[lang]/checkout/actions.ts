"use server";

import { supabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/server";

export type OrderInput = {
  lang: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  note: string;
  items: { slug: string; variant: string; qty: number }[];
};

export type OrderResult =
  | { ok: true; number: string; subtotal: number; shipping: number; total: number; saved: boolean }
  | { ok: false; error: "phone" | "unavailable" | "invalid" | "server"; slug?: string };

/** Records the order in the database (prices and stock are re-checked there). */
export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  if (!supabaseConfigured) {
    // No database yet: the order only goes out by WhatsApp.
    return { ok: true, number: `ARG-${Date.now().toString(36).toUpperCase().slice(-6)}`, subtotal: 0, shipping: 0, total: 0, saved: false };
  }
  const { data, error } = await createPublicClient().rpc("place_order", { payload: input });
  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("invalid_phone")) return { ok: false, error: "phone" };
    if (msg.includes("unavailable:")) return { ok: false, error: "unavailable", slug: msg.split("unavailable:")[1]?.trim() };
    if (msg.includes("invalid_")) return { ok: false, error: "invalid" };
    console.error("[place_order]", msg);
    return { ok: false, error: "server" };
  }
  const d = data as { number: string; subtotal: number; shipping: number; total: number };
  return { ok: true, number: d.number, subtotal: Number(d.subtotal), shipping: Number(d.shipping), total: Number(d.total), saved: true };
}
