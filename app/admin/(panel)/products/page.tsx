import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "./row-actions";
import { ProductFilters } from "./filters";

export const metadata = { title: "Mahsulotlar" };

const BADGE_LABEL: Record<string, string> = {
  NEW: "YANGI", HIT: "XIT", SUGAR_FREE: "SHAKARSIZ",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; status?: string; tab?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const PER = 20;

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(sp.cat ? { category: { slug: sp.cat } } : {}),
    ...(sp.status === "DRAFT" || sp.status === "PUBLISHED"
      ? { status: sp.status as "DRAFT" | "PUBLISHED" }
      : {}),
    ...(sp.tab === "kg" ? { isPackaged: false } : sp.tab === "pack" ? { isPackaged: true } : {}),
  };

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PER,
      take: PER,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Mahsulotlar <span className="text-base font-normal text-neutral-400">({total})</span>
        </h1>
        <Button
          size="sm"
          className="bg-[#C8102E] hover:bg-[#9E0C24]"
          nativeButton={false}
          render={<Link href="/admin/products/new" />}
        >
          <Plus className="mr-1 h-4 w-4" /> Yangi mahsulot
        </Button>
      </div>

      <ProductFilters
        categories={categories.map((c) => ({
          slug: c.slug,
          name: pick(c.name as Loc, "uz"),
        }))}
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Rasm</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Massa</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="w-20 text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                  Mahsulot topilmadi
                </TableCell>
              </TableRow>
            )}
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-neutral-100">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="font-medium hover:text-[#C8102E]"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs text-neutral-400">/{p.slug}</div>
                </TableCell>
                <TableCell className="text-sm text-neutral-600">
                  {p.category ? pick(p.category.name as Loc, "uz") : "—"}
                </TableCell>
                <TableCell className="text-sm">{p.weight ?? "—"}</TableCell>
                <TableCell>
                  {p.badge ? (
                    <Badge
                      className={
                        p.badge === "NEW"
                          ? "bg-[#C8102E]"
                          : p.badge === "HIT"
                            ? "bg-[#C9A24B]"
                            : "border border-[#C9A24B] bg-transparent text-[#8F6E28]"
                      }
                    >
                      {BADGE_LABEL[p.badge]}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "PUBLISHED" ? "secondary" : "outline"}>
                    {p.status === "PUBLISHED" ? "Nashrda" : "Qoralama"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ProductRowActions id={p.id} name={p.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
            const qs = new URLSearchParams(
              Object.entries({ ...sp, page: String(n) }).filter(([, v]) => v) as [string, string][],
            );
            return (
              <Link
                key={n}
                href={`/admin/products?${qs}`}
                className={`rounded px-3 py-1.5 text-sm ${n === page ? "bg-[#C8102E] text-white" : "hover:bg-neutral-100"}`}
              >
                {n}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
