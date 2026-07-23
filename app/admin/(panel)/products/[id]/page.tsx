import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { ProductForm, type ProductFormData } from "../product-form";

export const metadata = { title: "Mahsulotni tahrirlash" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!product) notFound();

  const initial: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: (product.description ?? {}) as Loc,
    image: product.image,
    gallery: product.gallery,
    categoryId: product.categoryId,
    shelfLife: product.shelfLife ?? "",
    weight: product.weight ?? "",
    packaging: product.packaging ?? "",
    badge: product.badge,
    isPackaged: product.isPackaged,
    isFeatured: product.isFeatured,
    status: product.status,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
      <ProductForm
        initial={initial}
        categories={categories.map((c) => ({
          id: c.id,
          name: pick(c.name as Loc, "uz"),
        }))}
      />
    </div>
  );
}
