import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Audit log" };

const ACTION_LABELS: Record<string, { label: string; cls: string }> = {
  create: { label: "Yaratildi", cls: "bg-emerald-100 text-emerald-700" },
  update: { label: "O'zgartirildi", cls: "bg-amber-100 text-amber-700" },
  delete: { label: "O'chirildi", cls: "bg-red-100 text-red-700" },
};

const ENTITIES = [
  "", "Product", "Category", "Article", "Block", "ExportCountry",
  "Media", "MenuItem", "Setting", "User",
];

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const entity = ENTITIES.includes(sp.entity ?? "") ? sp.entity : "";

  const logs = await prisma.auditLog.findMany({
    where: entity ? { entity } : {},
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>

      <div className="flex flex-wrap gap-1.5">
        {ENTITIES.map((e) => (
          <Link
            key={e || "all"}
            href={e ? `/admin/logs?entity=${e}` : "/admin/logs"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              (entity ?? "") === e
                ? "border-[#C8102E] bg-[#C8102E] text-white"
                : "border-neutral-200 bg-white text-neutral-600",
            )}
          >
            {e || "Barchasi"}
          </Link>
        ))}
      </div>

      <div className="divide-y rounded-lg border bg-white">
        {logs.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-400">Loglar yo'q</p>
        )}
        {logs.map((l) => {
          const a = ACTION_LABELS[l.action] ?? { label: l.action, cls: "" };
          return (
            <div key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", a.cls)}>
                {a.label}
              </span>
              <Badge variant="outline">{l.entity}</Badge>
              <span className="text-neutral-600">
                {l.changes ? JSON.stringify(l.changes).slice(0, 60) : l.entityId.slice(0, 12)}
              </span>
              <span className="ml-auto text-xs text-neutral-400">
                {l.user.name} · {l.createdAt.toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
