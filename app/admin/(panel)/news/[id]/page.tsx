import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Loc } from "@/lib/i18n";
import { ArticleForm, type ArticleFormData } from "../article-form";

export const metadata = { title: "Maqolani tahrirlash" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();

  const initial: ArticleFormData = {
    id: a.id,
    slug: a.slug,
    title: a.title as Loc,
    excerpt: a.excerpt as Loc,
    content: a.content as Loc,
    coverImage: a.coverImage ?? "",
    category: a.category ?? "",
    isFeatured: a.isFeatured,
    status: a.status,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString().slice(0, 10) : "",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Maqolani tahrirlash</h1>
      <ArticleForm initial={initial} />
    </div>
  );
}
