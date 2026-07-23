import Link from "next/link";
import { Cookie, Newspaper, Inbox, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard" };

const TYPE_LABELS: Record<string, string> = {
  PARTNER: "Hamkorlik",
  AGENT: "Agent anketasi",
  VACANCY: "Vakansiya",
  CONTACT: "Aloqa",
  PRODUCT_INQUIRY: "Mahsulot so'rovi",
};

export default async function DashboardPage() {
  const [products, articles, newSubs, lastSubs] = await Promise.all([
    prisma.product.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.submission.count({ where: { status: "NEW" } }),
    prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Jami mahsulot", value: products, icon: Cookie, href: "/admin/products" },
    { label: "Nashr etilgan maqola", value: articles, icon: Newspaper, href: "/admin/news" },
    { label: "Yangi arizalar", value: newSubs, icon: Inbox, href: "/admin/submissions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[#C8102E] hover:bg-[#9E0C24]"
            nativeButton={false}
            render={<Link href="/admin/products/new" />}
          >
            <Plus className="mr-1 h-4 w-4" /> Mahsulot qo'shish
          </Button>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/news/new" />}
          >
            <Plus className="mr-1 h-4 w-4" /> Maqola yozish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">
                  {s.label}
                </CardTitle>
                <s.icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Oxirgi arizalar</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/admin/submissions" />}
          >
            Barchasini ko'rish →
          </Button>
        </CardHeader>
        <CardContent>
          {lastSubs.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Hozircha arizalar yo'q
            </p>
          ) : (
            <ul className="divide-y">
              {lastSubs.map((s) => {
                const d = s.data as Record<string, string>;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <Badge variant={s.status === "NEW" ? "default" : "secondary"}>
                      {TYPE_LABELS[s.type] ?? s.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {d.name ?? d.email ?? "—"}
                    </span>
                    <span className="text-sm text-neutral-500">{d.phone ?? ""}</span>
                    <span className="ml-auto text-xs text-neutral-400">
                      {s.createdAt.toLocaleDateString("uz-UZ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
