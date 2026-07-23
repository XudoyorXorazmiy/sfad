import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { CategoriesClient } from "./categories-client";

export const metadata = { title: "Kategoriyalar" };

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Kategoriyalar{" "}
        <span className="text-base font-normal text-neutral-400">({cats.length})</span>
      </h1>
      <CategoriesClient
        items={cats.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name as Loc,
          description: (c.description ?? {}) as Loc,
          image: c.image ?? "",
          isActive: c.isActive,
          productCount: c._count.products,
          nameUz: pick(c.name as Loc, "uz"),
        }))}
      />
    </div>
  );
}
