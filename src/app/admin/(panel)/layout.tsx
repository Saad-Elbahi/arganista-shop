import { requireStaff } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../actions";

export const instant = false;

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { supabase, staff } = await requireStaff();
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new");

  return (
    <div className="lg:flex">
      <AdminNav role={staff.role} name={staff.name} email={staff.email} newOrders={count ?? 0} signOut={signOut} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
