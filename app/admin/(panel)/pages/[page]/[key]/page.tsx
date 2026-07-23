import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { BlockEditor } from "./block-editor";

export const metadata = { title: "Blokni tahrirlash" };

export default async function BlockEditPage({
  params,
}: {
  params: Promise<{ page: string; key: string }>;
}) {
  const { page, key } = await params;
  const block = await prisma.block.findUnique({
    where: { page_key: { page, key } },
  });
  if (!block) notFound();

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/admin/pages" className="hover:text-neutral-700">Sahifalar</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/admin/pages/${page}`} className="hover:text-neutral-700">{page}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-900">{key}</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        Blok: {key} <span className="text-sm font-normal text-neutral-400">({block.type})</span>
      </h1>
      <BlockEditor
        page={page}
        blockKey={key}
        initialData={block.data as Record<string, never>}
      />
    </div>
  );
}
