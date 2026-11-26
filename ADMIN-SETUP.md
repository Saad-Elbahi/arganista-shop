# Mise en service de l’administration (≈ 10 minutes)

L’espace d’administration (`/admin`) permet à l’équipe de gérer **produits, photos, prix, stock, commandes, équipe et paramètres** sans toucher au code. Il fonctionne avec **Supabase** (base de données + stockage des photos, offre gratuite suffisante).

## 1. Créer le projet Supabase
1. Allez sur supabase.com → **New project**.
2. Nom : `arganista` · Région : **West EU (Paris)** (la plus proche du Maroc) · notez le mot de passe de la base.

## 2. Créer les tables
Dans Supabase → **SQL Editor** → *New query* :
1. Collez tout le contenu de `supabase/migrations/0001_shop.sql` → **Run**.
2. Nouvelle requête : collez `supabase/seed.sql` → **Run** (importe les 12 produits actuels avec leurs photos et prix).

## 3. Sécuriser les comptes
1. **Authentication → Sign In / Providers → Email** : désactivez **Allow new users to sign up** (seule l’équipe a un compte).
2. **Authentication → Users → Add user → Create new user** : votre e-mail + un mot de passe, cochez **Auto Confirm User**.

> Le **premier compte qui se connecte** à `/admin` devient automatiquement **Propriétaire**.

## 4. Relier le site
1. Supabase → **Project Settings → API Keys** (et **Data API** pour l’URL).
2. Dans le dossier `arganista-shop`, copiez `.env.example` en `.env.local` et remplissez :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
3. *(Facultatif, recommandé)* `SUPABASE_SECRET_KEY=sb_secret_...` : permet de **créer les comptes de l’équipe directement depuis `/admin/team`**. Cette clé est secrète : ne la partagez jamais et ne la mettez jamais dans le code.
4. Redémarrez le serveur, ouvrez `/admin` et connectez-vous.

## 5. Ajouter votre collaborateur
`/admin/team` → **Ajouter un membre** : nom, e-mail, rôle **Éditeur**.
- Avec la clé secrète : saisissez un mot de passe provisoire, le compte est créé immédiatement.
- Sans la clé : créez d’abord l’utilisateur dans Supabase (étape 3.2), puis ajoutez-le ici.

| Rôle | Peut faire |
| --- | --- |
| **Éditeur** | Ajouter / modifier / masquer des produits, photos, prix, stock · gérer les commandes |
| **Propriétaire** | Tout + équipe, paramètres de la boutique (WhatsApp, livraison), suppression de commandes |

## Ce que fait l’administration
- **Tableau de bord** : commandes du jour, à traiter, chiffre d’affaires 30 j, panier moyen, ventes 14 j, meilleures ventes, ruptures.
- **Produits** : textes FR / EN / AR, photos (glisser-déposer, réduites automatiquement, réordonnables), formats & prix, prix barré (promo), stock par format, catégories, ingrédients, badges *Best-seller* / *Nouveau*, mise en ligne / masquage, duplication.
- **Commandes** : chaque commande de la boutique est enregistrée (prix recalculés côté serveur), statuts *Nouvelle → Confirmée → Expédiée → Livrée / Annulée*, recherche, note interne, message WhatsApp au client, impression, **export Excel (CSV)**.
- **Paramètres** : numéro WhatsApp des commandes, frais et seuil de livraison gratuite, contacts, réseaux sociaux, mot de passe personnel.

Toute modification enregistrée apparaît **immédiatement** sur la boutique.

## Mise en ligne (Vercel)
Ajoutez les mêmes variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, et éventuellement `SUPABASE_SECRET_KEY`) dans Vercel → Project → Settings → Environment Variables.

## Sécurité
- Accès protégé par mot de passe ; chaque table est protégée par des règles **RLS** (seule l’équipe peut lire les commandes et modifier le catalogue).
- Les clients ne peuvent créer une commande qu’au travers d’une fonction qui **recalcule les prix et vérifie le stock** : impossible de modifier un prix depuis le navigateur.
