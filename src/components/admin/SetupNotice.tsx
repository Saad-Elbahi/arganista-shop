import { Logo } from "@/components/Logo";

export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <Logo className="h-14" />
      <div className="mt-8 rounded-xl border border-line bg-white p-8 shadow-sm">
        <h1 className="font-serif text-3xl">Connecter la base de données</h1>
        <p className="mt-3 text-sm leading-relaxed text-taupe">
          L’administration a besoin d’un projet Supabase. Suivez les étapes du fichier <code className="rounded bg-sand px-1.5 py-0.5">ADMIN-SETUP.md</code> :
        </p>
        <ol className="mt-5 list-decimal space-y-2 ps-5 text-sm">
          <li>Créer un projet Supabase (gratuit).</li>
          <li>Exécuter <code className="rounded bg-sand px-1.5 py-0.5">supabase/migrations/0001_shop.sql</code> puis <code className="rounded bg-sand px-1.5 py-0.5">supabase/seed.sql</code> dans le SQL Editor.</li>
          <li>Copier <code className="rounded bg-sand px-1.5 py-0.5">.env.example</code> en <code className="rounded bg-sand px-1.5 py-0.5">.env.local</code> et y coller l’URL et la clé publique du projet.</li>
          <li>Redémarrer le serveur.</li>
        </ol>
      </div>
    </div>
  );
}
