"use client";

import { useActionState, useTransition } from "react";
import { Pill } from "@/components/admin/ui";
import { IconTrash } from "@/components/admin/AdminIcons";
import { addMember, removeMember, setRole } from "./actions";

export function AddMemberForm({ canCreate }: { canCreate: boolean }) {
  const [state, action, pending] = useActionState(addMember, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose">{state.error}</p>}
      {state?.ok && <p className="rounded-lg border border-leaf/20 bg-leaf-soft px-3 py-2 text-sm text-leaf">{state.ok}</p>}
      <label className="block">
        <span className="admin-label">Nom</span>
        <input name="name" className="admin-input" placeholder="ex. Fatima" />
      </label>
      <label className="block">
        <span className="admin-label">E-mail *</span>
        <input name="email" type="email" required className="admin-input" placeholder="prenom@exemple.com" />
      </label>
      {canCreate && (
        <label className="block">
          <span className="admin-label">Mot de passe provisoire</span>
          <input name="password" type="text" minLength={8} autoComplete="off" className="admin-input" placeholder="8 caractères minimum" />
          <span className="mt-1 block text-xs text-taupe">Crée le compte s’il n’existe pas. Communiquez-le en privé ; la personne pourra le changer dans Paramètres.</span>
        </label>
      )}
      <label className="block">
        <span className="admin-label">Rôle</span>
        <select name="role" defaultValue="editor" className="admin-input">
          <option value="editor">Éditeur — produits et commandes</option>
          <option value="owner">Propriétaire — accès complet</option>
        </select>
      </label>
      <button disabled={pending} className="admin-btn-primary w-full justify-center">{pending ? "Ajout…" : "Ajouter à l’équipe"}</button>
    </form>
  );
}

export function MemberRow({ userId, email, name, role, self }: { userId: string; email: string; name: string | null; role: "owner" | "editor"; self: boolean }) {
  const [pending, start] = useTransition();
  return (
    <li className={`flex flex-wrap items-center gap-3 px-5 py-4 ${pending ? "opacity-60" : ""}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper-soft font-semibold text-copper">{(name || email).slice(0, 1).toUpperCase()}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {name || email.split("@")[0]} {self && <Pill>Vous</Pill>}
        </p>
        <p className="truncate text-xs text-taupe">{email}</p>
      </div>
      <select
        value={role}
        disabled={self || pending}
        onChange={(e) => start(() => setRole(userId, e.target.value as "owner" | "editor"))}
        className="admin-input w-auto py-1.5"
        aria-label="Rôle"
      >
        <option value="editor">Éditeur</option>
        <option value="owner">Propriétaire</option>
      </select>
      {!self && (
        <button
          disabled={pending}
          onClick={() => confirm(`Retirer ${name || email} de l’équipe ? Son compte ne pourra plus accéder à l’administration.`) && start(() => removeMember(userId))}
          className="rounded-md p-2 text-taupe hover:bg-blush hover:text-rose"
          aria-label="Retirer"
        >
          <IconTrash width={16} height={16} />
        </button>
      )}
    </li>
  );
}
