import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sahifa bloklari" };

const PAGES = [
  { key: "home", label: "Bosh sahifa", path: "/" },
  { key: "products", label: "Mahsulotlar", path: "/mahsulotlar" },
  { key: "about", label: "Fabrika haqida", path: "/fabrika" },
  { key: "export", label: "Eksport", path: "/eksport" },
  { key: "news", label: "Yangiliklar", path: "/yangiliklar" },
  { key: "contacts", label: "Kontaktlar", path: "/kontakt" },
];

export default async function PagesIndex() {
  const counts = await prisma.block.groupBy({
    by: ["page"],
    _count: { _all: true },
  });
  const map = Object.fromEntries(counts.map((c) => [c.page, c._count._all]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Sahifa bloklari</h1>
      <p className="text-sm text-neutral-500">
        Saytdagi har bir matn/rasm bloki shu yerdan tahrirlanadi.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((p) => (
          <Link key={p.key} href={`/admin/pages/${p.key}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-base">{p.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-500">
                {p.path} · {map[p.key] ?? 0} ta blok
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
