import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { ProductForm } from "../product-form";

export const metadata = { title: "Yangi mahsulot" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Yangi mahsulot</h1>
      <ProductForm
        initial={null}
        categories={categories.map((c) => ({
          id: c.id,
          name: pick(c.name as Loc, "uz"),
        }))}
      />
    </div>
  );
}
