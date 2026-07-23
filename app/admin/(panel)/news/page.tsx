import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArticleRowActions } from "./row-actions";

export const metadata = { title: "Yangiliklar" };

export default async function NewsPage() {
  const items = await prisma.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Yangiliklar{" "}
          <span className="text-base font-normal text-neutral-400">({items.length})</span>
        </h1>
        <Button
          size="sm"
          className="bg-[#C8102E] hover:bg-[#9E0C24]"
          nativeButton={false}
          render={<Link href="/admin/news/new" />}
        >
          <Plus className="mr-1 h-4 w-4" /> Yangi maqola
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="w-20 text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Link href={`/admin/news/${a.id}`} className="font-medium hover:text-[#C8102E]">
                    {pick(a.title as Loc, "uz")}
                  </Link>
                  <div className="text-xs text-neutral-400">
                    /{a.slug}
                    {a.isFeatured && " · ⭐ featured"}
                    {a.readingTime ? ` · ${a.readingTime} daqiqa` : ""}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{a.category ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {a.publishedAt ? a.publishedAt.toLocaleDateString("uz-UZ") : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === "PUBLISHED" ? "secondary" : "outline"}>
                    {a.status === "PUBLISHED" ? "Nashrda" : "Qoralama"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ArticleRowActions id={a.id} title={pick(a.title as Loc, "uz")} slug={a.slug} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
