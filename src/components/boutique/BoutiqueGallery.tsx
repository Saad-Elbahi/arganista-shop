"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";

/** Photo mosaic (one large + four small) or grid, with a full-screen viewer. */
export function BoutiqueGallery({ photos, alt, layout = "mosaic" }: { photos: string[]; alt: string; layout?: "mosaic" | "grid" }) {
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

  const tile = (src: string, i: number, cls: string, sizes: string) => (
    <button key={src} onClick={() => setOpen(i)} className={`group relative overflow-hidden rounded-sm bg-sand ${cls}`} aria-label={`${alt} — ${i + 1}`}>
      <Image src={src} alt={`${alt} — ${i + 1}`} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-105" />
    </button>
  );

  return (
    <>
      {layout === "mosaic" ? (
        <div className="grid h-full grid-cols-2 gap-2 sm:grid-cols-4 sm:grid-rows-2 lg:min-h-[540px]">
          {tile(photos[0], 0, "col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto", "(min-width: 1024px) 30vw, 100vw")}
          {photos.slice(1, 5).map((p, k) => tile(p, k + 1, "aspect-square sm:aspect-auto", "(min-width: 1024px) 15vw, 50vw"))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {photos.map((p, i) => tile(p, i, "aspect-[4/3]", "(min-width: 768px) 33vw, 50vw"))}
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
