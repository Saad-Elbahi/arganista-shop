"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { IconBox, IconCog, IconDashboard, IconExternal, IconLogout, IconMenu, IconReceipt, IconUsers } from "./AdminIcons";

type Item = { href: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; badge?: number };

export function AdminNav({ role, name, email, newOrders, signOut }: { role: "owner" | "editor"; name: string | null; email: string; newOrders: number; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const items: Item[] = [
    { href: "/admin", label: "Tableau de bord", icon: IconDashboard },
    { href: "/admin/orders", label: "Commandes", icon: IconReceipt, badge: newOrders },
    { href: "/admin/products", label: "Produits", icon: IconBox },
    ...(role === "owner" ? [{ href: "/admin/team", label: "Équipe", icon: IconUsers }] : []),
    { href: "/admin/settings", label: "Paramètres", icon: IconCog },
  ];
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const nav = (
    <>
      <div className="px-3 pb-6 pt-2">
        <Logo className="h-12" />
        <p className="mt-1 ps-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-taupe">Administration</p>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active(it.href) ? "bg-leaf text-cream shadow-sm" : "text-ink/75 hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              <Icon />
              <span className="flex-1">{it.label}</span>
              {!!it.badge && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${active(it.href) ? "bg-cream text-leaf" : "bg-copper text-white"}`}>{it.badge}</span>
              )}
            </Link>
          );
        })}
        <a href="/fr" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/75 transition hover:bg-black/[0.04] hover:text-ink">
          <IconExternal />
          Voir la boutique
        </a>
      </nav>
      <div className="mt-6 border-t border-black/[0.06] pt-4">
        <div className="flex items-center gap-3 px-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper-soft text-sm font-semibold text-copper">
            {(name || email).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name || email.split("@")[0]}</p>
            <p className="text-[11px] text-taupe">{role === "owner" ? "Propriétaire" : "Éditeur"}</p>
          </div>
          <form action={signOut}>
            <button title="Se déconnecter" className="rounded-md p-2 text-taupe hover:bg-black/[0.05] hover:text-ink">
              <IconLogout />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-black/[0.06] bg-white px-3 py-5 lg:flex">{nav}</aside>

      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3 lg:hidden">
        <Logo className="h-10" />
        <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-black/[0.05]" aria-label="Menu">
          <IconMenu />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 start-0 flex w-72 flex-col bg-white px-3 py-5 shadow-xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
