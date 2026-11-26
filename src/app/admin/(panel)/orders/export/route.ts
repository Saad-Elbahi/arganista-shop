import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LABEL: Record<string, string> = { new: "Nouvelle", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée" };

/** CSV export (opens in Excel / Google Sheets). Staff only — enforced by RLS. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL("/admin/login", req.url));

  let q = supabase.from("orders").select("number, created_at, status, customer_name, phone, city, address, note, items, subtotal, shipping, total, staff_note").order("created_at", { ascending: false }).limit(5000);
  const status = req.nextUrl.searchParams.get("status");
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return new NextResponse("Accès refusé", { status: 403 });

  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["N°", "Date", "Statut", "Client", "Téléphone", "Ville", "Adresse", "Articles", "Sous-total", "Livraison", "Total", "Note client", "Note interne"];
  const lines = (data ?? []).map((o) =>
    [
      o.number,
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(new Date(o.created_at)),
      LABEL[o.status] ?? o.status,
      o.customer_name,
      o.phone,
      o.city,
      o.address,
      (o.items as { name: string; label: string | null; qty: number }[]).map((i) => `${i.qty} × ${i.name}${i.label ? ` (${i.label})` : ""}`).join(" | "),
      o.subtotal,
      o.shipping,
      o.total,
      o.note,
      o.staff_note,
    ]
      .map(cell)
      .join(";"),
  );
  // BOM + semicolons so Excel (French locale) opens it correctly
  const csv = "﻿" + [head.map(cell).join(";"), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="commandes-arganista-${stamp}.csv"` },
  });
}
