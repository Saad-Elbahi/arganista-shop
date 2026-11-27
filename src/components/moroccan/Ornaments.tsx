/** Small Moroccan ornaments: the 8-point star (khatam) and a star divider. */

export function Khatam({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <rect x="5" y="5" width="14" height="14" />
        <rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="2.4" />
      </g>
    </svg>
  );
}

export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-copper ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-copper/60 rtl:bg-gradient-to-l" />
      <span className="size-1.5 rotate-45 bg-copper/60" />
      <Khatam size={20} />
      <span className="size-1.5 rotate-45 bg-copper/60" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-copper/60 rtl:bg-gradient-to-r" />
    </div>
  );
}
