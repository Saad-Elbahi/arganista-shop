import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./env";

/** Optional server-only key: lets the owner create team accounts from /admin/team. */
const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? "";
export const canCreateAccounts = Boolean(supabaseSecret);

function assertConfigured() {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured: copy .env.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

/** Session-aware client for Server Components, Server Actions and Route Handlers (admin). */
export async function createClient() {
  const cookieStore = await cookies();
  await connection();
  assertConfigured();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component: cookies are read-only; the proxy refreshes the session.
        }
      },
    },
  });
}

/** Anonymous client without cookies: safe inside 'use cache' for public catalog reads. */
export function createPublicClient() {
  assertConfigured();
  return createPlainClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Privileged client (only when SUPABASE_SECRET_KEY is set) — used to create team accounts. */
export function createAdminClient() {
  if (!supabaseSecret) return null;
  return createPlainClient(supabaseUrl, supabaseSecret, { auth: { persistSession: false, autoRefreshToken: false } });
}
