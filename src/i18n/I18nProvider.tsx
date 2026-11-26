"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";

type Ctx = { lang: Locale; t: Dictionary; href: (path: string) => string };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ lang, dict, children }: { lang: Locale; dict: Dictionary; children: React.ReactNode }) {
  const href = (path: string) => `/${lang}${path === "/" ? "" : path}`;
  return <I18nContext.Provider value={{ lang, t: dict, href }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
