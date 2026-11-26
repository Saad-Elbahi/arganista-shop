"use client";

import { useActionState } from "react";
import { saveAccount, saveShopSettings } from "./actions";

type Shop = { whatsapp: string; email: string; address: string; instagram: string; facebook: string; shipping_fee: number; free_shipping_from: number };

function Notice({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <p className="mb-4 rounded-lg border border-rose/30 bg-blush px-3 py-2 text-sm text-rose">{state.error}</p>;
  if (state?.ok) return <p className="mb-4 rounded-lg border border-leaf/20 bg-leaf-soft px-3 py-2 text-sm text-leaf">{state.ok}</p>;
  return null;
}

export function ShopSettingsForm({ shop }: { shop: Shop }) {
  const [state, action, pending] = useActionState(saveShopSettings, undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="admin-label">Numéro WhatsApp qui reçoit les commandes *</span>
          <input name="whatsapp" defaultValue={shop.whatsapp} dir="ltr" className="admin-input" placeholder="212612345678" />
          <span className="mt-1 block text-xs text-taupe">Format international sans « + » ni espaces.</span>
        </label>
        <label className="block">
          <span className="admin-label">Frais de livraison (DH)</span>
          <input name="shipping_fee" type="number" min={0} step="1" defaultValue={shop.shipping_fee} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Livraison gratuite à partir de (DH)</span>
          <input name="free_shipping_from" type="number" min={0} step="1" defaultValue={shop.free_shipping_from} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">E-mail de contact</span>
          <input name="email" type="email" defaultValue={shop.email} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Adresse de la boutique</span>
          <input name="address" defaultValue={shop.address} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Instagram (lien)</span>
          <input name="instagram" defaultValue={shop.instagram} className="admin-input" placeholder="https://instagram.com/arganista" />
        </label>
        <label className="block">
          <span className="admin-label">Facebook (lien)</span>
          <input name="facebook" defaultValue={shop.facebook} className="admin-input" placeholder="https://facebook.com/arganista" />
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={pending} className="admin-btn-primary">{pending ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
    </form>
  );
}

export function AccountForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(saveAccount, undefined);
  return (
    <form action={action}>
      <Notice state={state} />
      <div className="space-y-4">
        <label className="block">
          <span className="admin-label">E-mail</span>
          <input value={email} disabled className="admin-input bg-[#f6f4f0] text-taupe" />
        </label>
        <label className="block">
          <span className="admin-label">Nom affiché</span>
          <input name="name" defaultValue={name} className="admin-input" />
        </label>
        <label className="block">
          <span className="admin-label">Nouveau mot de passe</span>
          <input name="password" type="password" minLength={8} autoComplete="new-password" className="admin-input" placeholder="Laisser vide pour ne pas changer" />
        </label>
        <label className="block">
          <span className="admin-label">Confirmer le mot de passe</span>
          <input name="confirm" type="password" autoComplete="new-password" className="admin-input" />
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={pending} className="admin-btn-primary">{pending ? "Enregistrement…" : "Mettre à jour"}</button>
      </div>
    </form>
  );
}
