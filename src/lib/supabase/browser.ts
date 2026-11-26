"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

/** Browser client sharing the admin session cookies (used for photo uploads). */
export const createBrowserSupabase = () => createBrowserClient(supabaseUrl, supabaseKey);
