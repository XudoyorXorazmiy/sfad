import Link from "next/link";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { SubmissionsClient } from "./submissions-client";
import type { FormType } from "@/lib/generated/prisma/enums";

export const metadata = { title: "Arizalar" };

const TABS: { key: string; label: string }[] = [
  { key: "", label: "Barchasi" },
  { key: "PARTNER", label: "Hamkorlik" },
  { key: "AGENT", label: "Agent anketasi" },
  { key: "VACANCY", label: "Vakansiya" },
  { key: "CONTACT", label: "Aloqa" },
  { key: "PRODUCT_INQUIRY", label: "Mahsulot so'rovi" },
];

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = TABS.some((t) => t.key === sp.type) ? sp.type : "";

  const [items, counts] = await Promise.all([
    prisma.submission.findMany({
      where: type ? { type: type as FormType } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.submission.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.type, c._count._all]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Arizalar</h1>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/submissions?type=${t.key}` : "/admin/submissions"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              (type ?? "") === t.key
                ? "border-[#C8102E] bg-[#C8102E] text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-[#C8102E]",
            )}
          >
            {t.label}
            {t.key && countMap[t.key] ? ` (${countMap[t.key]})` : ""}
          </Link>
        ))}
      </div>

      <SubmissionsClient
        items={items.map((s) => ({
          id: s.id,
          type: s.type,
          data: s.data as Record<string, string>,
          status: s.status,
          note: s.note ?? "",
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
