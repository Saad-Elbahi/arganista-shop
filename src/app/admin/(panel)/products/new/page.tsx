import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { PageHeader } from "@/components/admin/ui";
import { emptyProduct, ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Nouveau produit" };
export const instant = false;

export default async function NewProductPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Nouveau produit" back={{ href: "/admin/products", label: "Produits" }} />
      <ProductForm initial={emptyProduct} />
    </>
  );
}
