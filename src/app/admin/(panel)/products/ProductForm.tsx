"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { categories, ingredientKeys } from "@/data/products";
import { getDictionary } from "@/i18n/dictionaries";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { IMAGE_BUCKET } from "@/lib/supabase/env";
import { IconPlus, IconTrash, IconUpload } from "@/components/admin/AdminIcons";
import { deleteProduct, duplicateProduct, saveProduct, type ProductInput, type VariantInput } from "./actions";
import { Switch } from "./ActiveToggle";

const fr = getDictionary("fr");
type Lang = "fr" | "en" | "ar";
const LANGS: { key: Lang; label: string }[] = [
  { key: "fr", label: "Français" },
  { key: "en", label: "English" },
  { key: "ar", label: "العربية" },
];
const TEXT_FIELDS: { key: "name" | "tagline" | "description" | "howTo" | "keyIngredients"; label: string; rows?: number; hint?: string }[] = [
  { key: "name", label: "Nom du produit" },
  { key: "tagline", label: "Accroche", hint: "Une phrase courte sous le nom." },
  { key: "description", label: "Description", rows: 5 },
  { key: "howTo", label: "Conseils d’utilisation", rows: 3 },
  { key: "keyIngredients", label: "Ingrédients clés", rows: 2 },
];
const TINTS = ["#f1e3d6", "#e2e8df", "#f4e1de", "#ece3d4", "#e7e1e6", "#f3dcd0"];

export const emptyProduct: ProductInput = {
  slug: "",
  category: "huiles",
  ingredients: [],
  badges: [],
  active: true,
  tint: "#ece3d4",
  name: { fr: "", en: "", ar: "" },
  tagline: { fr: "", en: "", ar: "" },
  description: { fr: "", en: "", ar: "" },
  howTo: { fr: "", en: "", ar: "" },
  keyIngredients: { fr: "", en: "", ar: "" },
  variants: [{ label: "", price: 0, compareAt: null, inStock: true, imageUrl: null }],
  images: [],
};

/** Resize to max 1800px and re-encode as JPEG before upload (phone photos are often 5–10 MB). */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.86));
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="admin-card p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ProductForm({ initial, publicUrl }: { initial: ProductInput; publicUrl?: string }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [lang, setLang] = useState<Lang>("fr");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !initial.id;
  const dirty = useMemo(() => JSON.stringify(p) !== JSON.stringify(initial), [p, initial]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setSaved(false);
    setP((cur) => ({ ...cur, [k]: v }));
  };
  const setText = (field: (typeof TEXT_FIELDS)[number]["key"], value: string) => set(field, { ...p[field], [lang]: value });
  const setVariant = (i: number, patch: Partial<VariantInput>) => set("variants", p.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  const toggle = (k: "ingredients" | "badges", v: string) => set(k, p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v]);

  const missing = (l: Lang) => TEXT_FIELDS.some((f) => p[f.key].fr.trim() && !p[f.key][l].trim());
  const copyFrench = () => {
    setSaved(false);
    setP((cur) => {
      const next = { ...cur };
      for (const f of TEXT_FIELDS) next[f.key] = { ...cur[f.key], [lang]: cur[f.key][lang] || cur[f.key].fr };
      return next;
    });
  };

  async function upload(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setError("");
    setUploading((n) => n + list.length);
    const sb = createBrowserSupabase();
    const urls: string[] = [];
    for (const file of list) {
      try {
        const blob = await compress(file);
        const path = `products/${crypto.randomUUID()}.jpg`;
        const { error: e } = await sb.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (e) throw e;
        urls.push(sb.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl);
      } catch (e) {
        setError(`Échec de l’envoi de « ${file.name} » : ${(e as Error).message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (urls.length) {
      setSaved(false);
      setP((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    }
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= p.images.length || from === to) return;
    const next = [...p.images];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    set("images", next);
  };
  const removeImage = (i: number) => {
    const url = p.images[i];
    setSaved(false);
    setP((cur) => ({ ...cur, images: cur.images.filter((_, k) => k !== i), variants: cur.variants.map((v) => (v.imageUrl === url ? { ...v, imageUrl: null } : v)) }));
  };

  const save = () =>
    start(async () => {
      setError("");
      const res = await saveProduct(p);
      if (!res.ok) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSaved(true);
      // reload with the saved data (the page remounts this form with fresh values)
      router.replace(`/admin/products/${res.id}?${isNew ? "created" : "saved"}=1`, { scroll: false });
    });

  const field = TEXT_FIELDS;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="pb-24">
      {error && <p className="mb-5 rounded-lg border border-rose/30 bg-blush px-4 py-3 text-sm text-rose">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── main column */}
        <div className="space-y-6">
          <Section
            title="Contenu"
            aside={
              lang !== "fr" && (
                <button type="button" onClick={copyFrench} className="text-xs font-medium text-leaf hover:underline">
                  Remplir les champs vides avec le français
                </button>
              )
            }
          >
            <div className="mb-5 inline-flex rounded-lg bg-[#f3f0ea] p-1">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLang(l.key)}
                  className={`relative rounded-md px-4 py-1.5 text-sm font-medium transition ${lang === l.key ? "bg-white shadow-sm" : "text-taupe hover:text-ink"}`}
                >
                  {l.label}
                  {l.key !== "fr" && missing(l.key) && <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-copper" title="Traduction incomplète" />}
                </button>
              ))}
            </div>
            <div className="space-y-4" dir={dir}>
              {field.map((f) => (
                <label key={f.key} className="block">
                  <span className="admin-label">
                    {f.label} {f.key === "name" && lang === "fr" && <span className="text-rose">*</span>}
                  </span>
                  {f.rows ? (
                    <textarea rows={f.rows} value={p[f.key][lang]} onChange={(e) => setText(f.key, e.target.value)} className="admin-input resize-y leading-relaxed" placeholder={lang !== "fr" ? p[f.key].fr : ""} />
                  ) : (
                    <input value={p[f.key][lang]} onChange={(e) => setText(f.key, e.target.value)} className="admin-input" placeholder={lang !== "fr" ? p[f.key].fr : ""} />
                  )}
                  {f.hint && <span className="mt-1 block text-xs text-taupe">{f.hint}</span>}
                </label>
              ))}
            </div>
            {lang !== "fr" && <p className="mt-4 text-xs text-taupe">Un champ laissé vide affiche le texte français sur la boutique.</p>}
          </Section>

          <Section title="Photos" aside={<span className="text-xs text-taupe">La 1ʳᵉ photo est l’image principale · glissez pour réordonner</span>}>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
              }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {p.images.map((url, i) => (
                <div
                  key={url}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (dragIndex === null) return;
                    e.stopPropagation();
                    moveImage(dragIndex, i);
                    setDragIndex(null);
                  }}
                  className={`group relative aspect-[4/5] cursor-grab overflow-hidden rounded-lg border bg-[#f7f6f3] ${i === 0 ? "border-leaf ring-2 ring-leaf/20" : "border-line"} ${dragIndex === i ? "opacity-40" : ""}`}
                >
                  <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                  {i === 0 && <span className="absolute start-2 top-2 rounded bg-leaf px-1.5 py-0.5 text-[10px] font-semibold uppercase text-cream">Principale</span>}
                  <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100">
                    <span className="flex gap-1">
                      <button type="button" onClick={() => moveImage(i, i - 1)} className="rounded bg-white/95 px-2 py-1 text-xs shadow" aria-label="Avant">←</button>
                      <button type="button" onClick={() => moveImage(i, i + 1)} className="rounded bg-white/95 px-2 py-1 text-xs shadow" aria-label="Après">→</button>
                    </span>
                    <button type="button" onClick={() => removeImage(i)} className="rounded bg-white/95 p-1 text-rose shadow" aria-label="Supprimer">
                      <IconTrash width={15} height={15} />
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({ length: uploading }, (_, i) => (
                <div key={`u${i}`} className="flex aspect-[4/5] animate-pulse items-center justify-center rounded-lg border border-dashed border-line bg-[#f7f6f3] text-xs text-taupe">
                  Envoi…
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-sm text-taupe transition hover:border-leaf hover:bg-leaf-soft/40 hover:text-leaf"
              >
                <IconUpload />
                Ajouter des photos
                <span className="px-3 text-center text-[11px]">ou glissez-les ici</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
            <p className="mt-3 text-xs text-taupe">Format conseillé : portrait 4:5, fond clair, produit seul (voir PHOTO-GUIDE.md). Les photos sont redimensionnées automatiquement.</p>
          </Section>

          <Section
            title="Formats & prix"
            aside={
              <button type="button" onClick={() => set("variants", [...p.variants, { label: "", price: 0, compareAt: null, inStock: true, imageUrl: null }])} className="admin-btn py-1.5 text-xs">
                <IconPlus width={14} height={14} /> Ajouter un format
              </button>
            }
          >
            <div className="space-y-3">
              {p.variants.map((v, i) => (
                <div key={v.id ?? `n${i}`} className="grid grid-cols-2 items-end gap-3 rounded-lg border border-line bg-[#fcfbf9] p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
                  <label className="col-span-2 block sm:col-span-1">
                    <span className="admin-label">Format {p.variants.length > 1 && <span className="text-rose">*</span>}</span>
                    <input value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} placeholder={p.variants.length > 1 ? "ex. 30 ml" : "Facultatif (format unique)"} className="admin-input" />
                  </label>
                  <label className="block">
                    <span className="admin-label">Prix (DH) <span className="text-rose">*</span></span>
                    <input type="number" min={0} step="0.5" value={Number.isFinite(v.price) ? v.price : ""} onChange={(e) => setVariant(i, { price: e.target.valueAsNumber })} className="admin-input tabular-nums" />
                  </label>
                  <label className="block">
                    <span className="admin-label">Ancien prix</span>
                    <input type="number" min={0} step="0.5" value={v.compareAt ?? ""} placeholder="Promo" onChange={(e) => setVariant(i, { compareAt: e.target.value === "" ? null : e.target.valueAsNumber })} className="admin-input tabular-nums" />
                  </label>
                  <label className="flex flex-col items-start gap-2">
                    <span className="admin-label mb-0">En stock</span>
                    <Switch checked={v.inStock} onChange={(val) => setVariant(i, { inStock: val })} label="En stock" />
                  </label>
                  <button type="button" disabled={p.variants.length === 1} onClick={() => set("variants", p.variants.filter((_, k) => k !== i))} className="justify-self-end rounded-md p-2 text-taupe hover:bg-blush hover:text-rose disabled:invisible" aria-label="Supprimer le format">
                    <IconTrash width={16} height={16} />
                  </button>
                  {p.images.length > 1 && p.variants.length > 1 && (
                    <label className="col-span-2 block sm:col-span-5">
                      <span className="admin-label">Photo affichée pour ce format</span>
                      <select value={v.imageUrl ?? ""} onChange={(e) => setVariant(i, { imageUrl: e.target.value || null })} className="admin-input">
                        <option value="">Photo principale</option>
                        {p.images.map((url, k) => (
                          <option key={url} value={url}>Photo {k + 1}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {v.compareAt != null && v.compareAt > v.price && (
                    <p className="col-span-2 text-xs font-medium text-rose sm:col-span-5">Promo affichée : -{Math.round((1 - v.price / v.compareAt) * 100)}%</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── side column */}
        <div className="space-y-6">
          <Section title="Visibilité">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{p.active ? "En ligne" : "Masqué"}</p>
                <p className="text-xs text-taupe">{p.active ? "Visible dans la boutique" : "Invisible pour les clients"}</p>
              </div>
              <Switch checked={p.active} onChange={(v) => set("active", v)} label="En ligne" />
            </div>
            {publicUrl && p.active && (
              <a href={publicUrl} target="_blank" className="mt-4 block text-xs font-medium text-leaf hover:underline">
                Voir sur la boutique ↗
              </a>
            )}
          </Section>

          <Section title="Organisation">
            <label className="block">
              <span className="admin-label">Catégorie</span>
              <select value={p.category} onChange={(e) => set("category", e.target.value)} className="admin-input">
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{fr.categories[c.key]}</option>
                ))}
              </select>
            </label>
            <p className="admin-label mt-5">Ingrédients (filtre « Acheter par ingrédient »)</p>
            <div className="flex flex-wrap gap-2">
              {ingredientKeys.map((k) => (
                <button key={k} type="button" onClick={() => toggle("ingredients", k)} className={`rounded-full border px-3 py-1 text-xs transition ${p.ingredients.includes(k) ? "border-leaf bg-leaf text-cream" : "border-line hover:border-ink/30"}`}>
                  {fr.ingredients[k]}
                </button>
              ))}
            </div>
            <p className="admin-label mt-5">Étiquettes</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["best", "Best-seller"],
                ["new", "Nouveau"],
              ].map(([k, l]) => (
                <button key={k} type="button" onClick={() => toggle("badges", k)} className={`rounded-full border px-3 py-1 text-xs transition ${p.badges.includes(k) ? "border-copper bg-copper text-white" : "border-line hover:border-ink/30"}`}>
                  {l}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Référencement">
            <label className="block">
              <span className="admin-label">Lien du produit</span>
              <div className="flex items-center rounded-lg border border-line bg-white text-sm focus-within:border-leaf">
                <span className="ps-3 text-taupe">/product/</span>
                <input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder="genere-depuis-le-nom" className="min-w-0 flex-1 bg-transparent py-2.5 pe-3 outline-none" />
              </div>
              <span className="mt-1 block text-xs text-taupe">Laissé vide : créé automatiquement depuis le nom.</span>
            </label>
            <p className="admin-label mt-5">Couleur d’ambiance</p>
            <div className="flex flex-wrap gap-2">
              {TINTS.map((c) => (
                <button key={c} type="button" onClick={() => set("tint", c)} style={{ background: c }} className={`h-8 w-8 rounded-full border ${p.tint === c ? "ring-2 ring-leaf ring-offset-2" : "border-line"}`} aria-label={c} />
              ))}
            </div>
          </Section>

          {!isNew && (
            <Section title="Actions">
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => start(() => duplicateProduct(initial.id!))} className="admin-btn justify-center">Dupliquer le produit</button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Supprimer définitivement « ${initial.name.fr} » et ses photos ? Cette action est irréversible.\n\nAstuce : pour le retirer temporairement, masquez-le plutôt.`))
                      start(() => deleteProduct(initial.id!));
                  }}
                  className="admin-btn-danger justify-center"
                >
                  <IconTrash width={16} height={16} /> Supprimer
                </button>
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* sticky save bar */}
      <div className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.08] bg-white/95 backdrop-blur lg:start-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <p className="text-sm text-taupe">
            {pending ? "Enregistrement…" : uploading ? "Envoi des photos…" : saved && !dirty ? <span className="text-leaf">✓ Modifications enregistrées</span> : dirty ? "Modifications non enregistrées" : isNew ? "Nouveau produit" : "Aucune modification"}
          </p>
          <div className="flex gap-2">
            <Link href="/admin/products" className="admin-btn">Retour</Link>
            <button type="button" onClick={save} disabled={pending || uploading > 0 || (!dirty && !isNew)} className="admin-btn-primary px-6">
              {isNew ? "Créer le produit" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
