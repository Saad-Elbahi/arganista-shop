import Link from "next/link";
import { IconChevronLeft } from "./AdminIcons";

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: React.ReactNode; back?: { href: string; label: string }; actions?: React.ReactNode }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="no-print mb-3 inline-flex items-center gap-1 text-xs font-medium text-taupe hover:text-ink">
          <IconChevronLeft width={14} height={14} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl leading-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-taupe">{subtitle}</p>}
        </div>
        {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: "default" | "accent" | "warn" }) {
  const ring = tone === "accent" ? "before:bg-leaf" : tone === "warn" ? "before:bg-copper" : "before:bg-sand";
  return (
    <div className={`admin-card relative overflow-hidden p-5 before:absolute before:inset-y-0 before:start-0 before:w-1 ${ring}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-taupe">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-taupe">{hint}</p>}
    </div>
  );
}

export const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Nouvelle", cls: "bg-copper/12 text-copper ring-copper/25" },
  confirmed: { label: "Confirmée", cls: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  shipped: { label: "Expédiée", cls: "bg-violet-50 text-violet-700 ring-violet-600/20" },
  delivered: { label: "Livrée", cls: "bg-leaf-soft text-leaf ring-leaf/25" },
  cancelled: { label: "Annulée", cls: "bg-black/[0.04] text-taupe ring-black/10" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.new;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "red" | "amber" }) {
  const cls = {
    neutral: "bg-black/[0.04] text-ink/70 ring-black/10",
    green: "bg-leaf-soft text-leaf ring-leaf/25",
    red: "bg-blush text-rose ring-rose/25",
    amber: "bg-copper/10 text-copper ring-copper/25",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${cls}`}>{children}</span>;
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="admin-card flex flex-col items-center px-6 py-16 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {text && <p className="mt-2 max-w-sm text-sm text-taupe">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const mad = (n: number) => `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(n)} DH`;
export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Casablanca" }).format(new Date(iso));
