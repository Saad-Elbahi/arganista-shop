"use client";

import { useOptimistic, useTransition } from "react";
import { setActive } from "./actions";

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${checked ? "bg-leaf" : "bg-black/15"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-0.5 rtl:-translate-x-0.5"}`} />
    </button>
  );
}

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [value, setValue] = useOptimistic(active);
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={value}
      disabled={pending}
      label="Afficher dans la boutique"
      onChange={(v) =>
        start(async () => {
          setValue(v);
          await setActive(id, v);
        })
      }
    />
  );
}
