# Studio product photos

Turns phone photos into single-product studio shots on seamless white (1200×1500).

1. Mask the products (macOS 14+, Apple Vision):
   - whole group, cropped: `swift scripts/product-photos/cutout.swift photo.jpg scripts/product-photos/cut/name`
   - full-size mask for isolating one item: `swift scripts/product-photos/cutout.swift photo.jpg scripts/product-photos/full/pN full`
2. Add a job in `studio.js`: either `group: 'name_all'`, or `src: N` plus a traced outline
   (`dropper(...)` / `pump(...)`, pixel coordinates in the original photo).
3. `node scripts/product-photos/studio.js` → `public/images/catalog/<out>.jpg`

Best results come from photos of one product on a plain surface in soft daylight.
