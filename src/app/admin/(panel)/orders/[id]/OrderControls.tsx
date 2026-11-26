"use client";

import { useState, useTransition } from "react";
import { ORDER_STATUS } from "@/components/admin/ui";
import { IconPrint, IconTrash } from "@/components/admin/AdminIcons";
import { deleteOrder, saveStaffNote, setOrderStatus } from "../actions";

const FLOW = ["new", "confirmed", "shipped", "delivered"];

export function StatusControl({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const next = FLOW[FLOW.indexOf(status) + 1];
  const nextLabel: Record<string, string> = { confirmed: "Confirmer la commande", shipped: "Marquer comme expédiée", delivered: "Marquer comme livrée" };
  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-1">
        {FLOW.map((s, i) => {
          const done = status !== "cancelled" && FLOW.indexOf(status) >= i;
          return (
            <li key={s} className="flex flex-1 flex-col gap-1.5">
              <span className={`h-1.5 rounded-full ${done ? "bg-leaf" : "bg-black/10"}`} />
              <span className={`text-[11px] ${done ? "font-medium text-ink" : "text-taupe"}`}>{ORDER_STATUS[s].label}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        {next && status !== "cancelled" && (
          <button disabled={pending} onClick={() => start(() => setOrderStatus(id, next))} className="admin-btn-primary">
            {pending ? "…" : nextLabel[next]}
          </button>
        )}
        <select
          value={status}
          disabled={pending}
          onChange={(e) => start(() => setOrderStatus(id, e.target.value))}
          className="admin-input w-auto py-2"
          aria-label="Changer le statut"
        >
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function StaffNote({ id, note }: { id: string; note: string }) {
  const [value, setValue] = useState(note);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();
  return (
    <div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="Ex. client rappelé, livraison prévue jeudi…"
        className="admin-input resize-y"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-taupe">{pending ? "Enregistrement…" : saved ? "Visible uniquement par l’équipe" : "Non enregistré"}</span>
        <button disabled={pending || saved} onClick={() => start(async () => { await saveStaffNote(id, value); setSaved(true); })} className="admin-btn py-1.5 text-xs">
          Enregistrer la note
        </button>
      </div>
    </div>
  );
}

export function OrderTools({ id, number, owner }: { id: string; number: string; owner: boolean }) {
  const [pending, start] = useTransition();
  return (
    <>
      <button onClick={() => window.print()} className="admin-btn">
        <IconPrint width={16} height={16} /> Imprimer
      </button>
      {owner && (
        <button
          disabled={pending}
          onClick={() => confirm(`Supprimer définitivement la commande ${number} ? Préférez « Annulée » pour garder l’historique.`) && start(() => deleteOrder(id))}
          className="admin-btn-danger"
        >
          <IconTrash width={16} height={16} />
        </button>
      )}
    </>
  );
}
