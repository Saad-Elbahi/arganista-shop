"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const noAccess = useSearchParams().get("e") === "access";

  return (
    <form action={action} className="w-full max-w-sm">
      <Logo className="h-16" />
      <h1 className="mt-8 font-serif text-3xl">Connexion</h1>
      <p className="mt-1 text-sm text-taupe">Accès réservé à l’équipe Arganista.</p>

      {noAccess && !state?.error && (
        <p className="mt-6 rounded-lg border border-copper/30 bg-copper-soft px-4 py-3 text-sm">
          Ce compte n’a pas encore accès à l’administration. Demandez au propriétaire de vous ajouter à l’équipe.
        </p>
      )}
      {state?.error && <p className="mt-6 rounded-lg border border-rose/30 bg-blush px-4 py-3 text-sm text-rose">{state.error}</p>}

      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-medium text-taupe">E-mail</span>
        <input name="email" type="email" autoComplete="email" required className="admin-input" />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-taupe">Mot de passe</span>
        <input name="password" type="password" autoComplete="current-password" required className="admin-input" />
      </label>
      <button disabled={pending} className="admin-btn-primary mt-6 w-full justify-center py-3">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
