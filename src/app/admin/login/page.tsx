import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-leaf-dark lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative background */}
        <img src="/images/ambiance/courtyard.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-leaf-dark via-leaf-dark/40 to-transparent" />
        <div className="absolute bottom-12 start-12 max-w-sm text-cream">
          <p className="text-[11px] uppercase tracking-[0.3em] text-copper-soft">Espace équipe</p>
          <p className="mt-3 font-serif text-4xl leading-tight">Gérez la boutique Arganista en toute simplicité.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
