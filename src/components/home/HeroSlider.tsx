"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** split: portrait photo on the end half, copy on a blush background (good for portrait photos) */
export type Slide = { image: string; title: string; text: string; cta: string; href: string; tone: "light" | "dark"; flip?: boolean; position?: string; split?: boolean };

/** Full-width hero carousel with left-aligned copy and line indicators. */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <section
      className="relative h-[540px] overflow-hidden bg-blush-bg sm:h-[600px] lg:h-[640px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, k) => {
        const active = k === i;
        const light = s.tone === "light";
        return (
          <div key={s.image} className={`absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!active}>
            <div className={`absolute overflow-hidden ${s.split ? "inset-y-0 end-0 w-full lg:w-[56%]" : "inset-0"}`}>
              <Image
                src={s.image}
                alt=""
                fill
                priority={k === 0}
                sizes={s.split ? "(min-width: 1024px) 56vw, 100vw" : "100vw"}
                className="object-cover transition-transform duration-[7000ms] ease-out"
                style={{ objectPosition: s.position ?? "center", transform: `scale(${s.flip ? -1 : 1}, 1) scale(${active ? 1 : 1.05})` }}
              />
            </div>
            {/* readability wash on the text side */}
            <div
              className={`absolute inset-0 ${s.split ? "lg:hidden " : ""}${
                light
                  ? "bg-gradient-to-r from-black/65 via-black/30 to-transparent rtl:bg-gradient-to-l"
                  : "bg-gradient-to-r from-white/85 via-white/45 to-transparent rtl:bg-gradient-to-l"
              }`}
            />
            <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-6 lg:px-16">
              <div className={`max-w-xl transition-all delay-200 duration-700 ${s.split ? "lg:max-w-[40%]" : ""} ${active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} ${light ? "text-white" : "text-ink"}`}>
                <h2 className="text-[38px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[52px] lg:text-[60px]">{s.title}</h2>
                <p className={`mt-4 max-w-md text-[17px] leading-relaxed sm:text-lg ${light ? "text-white/85" : "text-ink/75"}`}>{s.text}</p>
                <Link href={s.href} tabIndex={active ? 0 : -1} className="btn-primary mt-8 px-10 py-4">
                  {s.cta}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-7 flex justify-center gap-2">
        {slides.map((s, k) => (
          <button key={s.image} onClick={() => setI(k)} aria-label={`${k + 1}`} className="group py-2">
            <span className={`block h-[3px] w-10 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.08)] transition-colors ${k === i ? "bg-white" : "bg-white/45 group-hover:bg-white/70"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
