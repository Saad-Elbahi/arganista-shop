"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Item = { label: string; href: string; image: string };

/** Cream panel listing categories; hovering one swaps the large photo on the side. */
export function RitualSplit({ title, items, cta }: { title: string; items: Item[]; cta: string }) {
  const [i, setI] = useState(0);
  return (
    <section className="pb-4 pt-4">
      <h2 className="h-section mx-auto mb-10 max-w-[1400px] px-6 text-center lg:px-16">{title}</h2>
      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-cream px-8 py-14 lg:px-20">
          <ul className="space-y-1">
            {items.map((it, k) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onMouseEnter={() => setI(k)}
                  onFocus={() => setI(k)}
                  className={`block py-1 text-[28px] leading-tight tracking-[-0.01em] transition-colors sm:text-[34px] ${k === i ? "text-ink" : "text-ink/30 hover:text-ink/60"}`}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={items[i].href} className="btn-primary mt-12 w-fit px-12">
            {cta}
          </Link>
        </div>
        <div className="relative min-h-[380px] overflow-hidden bg-blush-bg lg:min-h-[560px]">
          {items.map((it, k) => (
            <Image
              key={it.image + k}
              src={it.image}
              alt={it.label}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-700 ${k === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
