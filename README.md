# Arganista — boutique en ligne

E-commerce storefront for Arganista Cosmetic (Next.js 16 + Tailwind CSS 4), in French, English and Arabic (RTL).

## Run locally

```bash
export PATH=$HOME/.local/node/bin:$PATH
npm install
npm run dev        # http://localhost:3000 → redirects to /fr, /en or /ar
```

## Where to edit

| What | File |
| --- | --- |
| WhatsApp number, email, address, delivery fee, free-delivery threshold | `src/config/site.ts` |
| Products, prices, sizes, photos, descriptions (FR/EN/AR) | `src/data/products.ts` |
| All site text in the three languages | `src/i18n/dictionaries.ts` |
| Product photos (studio shots, 1200×1500) | `public/images/catalog`, listed in `images` / `variantImages` in `src/data/products.ts`; regenerate with `scripts/product-photos` |
| Logo | `public/images/brand` |
| Section photos (hero, origins, story, pantry, boutique, newsletter) — free Unsplash licence, no credit required | `public/images/ambiance` |
| Colours & fonts | `src/app/globals.css`, `src/app/[lang]/layout.tsx` |

**Prices in `products.ts` are placeholders** — replace them with real prices before launch.

## Admin (`/admin`)

Products, photos, prices, stock, orders, team and shop settings are managed from `/admin` (Supabase). Setup steps: [ADMIN-SETUP.md](ADMIN-SETUP.md). Without Supabase configured, the shop runs on the starter catalog in `src/data/products.ts`.

## How orders work

Checkout is cash on delivery. When a customer confirms, the order is saved in Supabase through the `place_order` function (prices, stock and shipping recomputed server-side), then WhatsApp opens with a pre-filled message addressed to the number set in `/admin/settings`. Without Supabase, the order only goes out by WhatsApp.

## Pages

- `/[lang]` home · `/[lang]/shop` (filters `?c=category`, `?i=ingredient`, `?q=search`, `?s=sort`)
- `/[lang]/product/[slug]` · `/[lang]/cart` · `/[lang]/checkout`
- `/[lang]/about` · `/[lang]/contact`
