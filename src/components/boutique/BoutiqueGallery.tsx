"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";

/**
 * Boutique photos framed in Moorish arches, with a full-screen viewer.
 * - "dar": big arch | `aside` (info card) | four small arches — homepage
 * - "grid": a row of arches — contact page
 */
export function BoutiqueGallery({ photos, alt, layout = "dar", aside }: { photos: string[]; alt: string; layout?: "dar" | "grid"; aside?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  // photo inside a double arch: thin copper outline, then the picture
  const arch = (i: number, cls: string, sizes: string) => (
    <button key={photos[i]} onClick={() => setOpen(i)} className={`arch group block border border-copper/45 p-1.5 transition-colors hover:border-copper ${cls}`} aria-label={`${alt} — ${i + 1}`}>
      <span className="arch relative block h-full w-full overflow-hidden bg-sand">
        <Image src={photos[i]} alt={`${alt} — ${i + 1}`} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </span>
    </button>
  );

  return (
    <>
      {layout === "dar" ? (
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-[1fr_minmax(0,380px)_1fr] lg:gap-8">
          {arch(0, "aspect-[4/5] lg:aspect-auto lg:min-h-[560px]", "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw")}
          {aside}
          <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-4 lg:col-span-1 lg:grid-cols-2">
            {photos.slice(1, 5).map((_, k) => arch(k + 1, "aspect-[3/4]", "(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {photos.map((_, i) => arch(i, "aspect-[3/4]", "(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"))}
        </div>
      )}

      {open !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={close} role="dialog" aria-label={alt}>
          <button onClick={close} className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Fermer">
            <CloseIcon />
          </button>
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute start-3 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 rtl:rotate-180" aria-label="‹">‹</button>
          <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[open]} alt={`${alt} — ${open + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute end-3 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20 rtl:rotate-180" aria-label="›">›</button>
          <p className="absolute bottom-4 text-sm text-white/70">{open + 1} / {photos.length}</p>
        </div>
      )}
    </>
  );
}
