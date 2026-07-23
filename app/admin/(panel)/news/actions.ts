"use server";

import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";
import { articleSchema } from "@/lib/validators";
import type { Loc } from "@/lib/i18n";

function siteRevalidate(slug?: string) {
  for (const p of ["/", "/yangiliklar", ...(slug ? [`/yangiliklar/${slug}`] : [])]) {
    revalidatePath(p);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  }
  revalidatePath("/admin/news");
}

/** Tiptap HTML ni sanitize qiladi (XSS) */
function cleanContent(c: Loc): Loc {
  const out: Loc = {};
  for (const [k, v] of Object.entries(c)) {
    out[k as keyof Loc] = v ? DOMPurify.sanitize(v) : "";
  }
  return out;
}

/** O'qish vaqti — so'z sonidan (200 so'z/daq) */
function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function parseForm(formData: FormData) {
  const loc = (key: string) => ({
    uz: formData.get(`${key}_uz`) ?? "",
    ru: formData.get(`${key}_ru`) ?? "",
    en: formData.get(`${key}_en`) ?? "",
    ar: formData.get(`${key}_ar`) ?? "",
  });
  return articleSchema.safeParse({
    slug: formData.get("slug"),
    title: loc("title"),
    excerpt: loc("excerpt"),
    content: loc("content"),
    coverImage: formData.get("coverImage") ?? "",
    category: formData.get("category") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status") ?? "DRAFT",
    publishedAt: formData.get("publishedAt") ?? "",
  });
}

function toData(d: ReturnType<typeof articleSchema.parse>) {
  const content = cleanContent(d.content as Loc);
  return {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    content,
    coverImage: d.coverImage || null,
    category: d.category || null,
    isFeatured: d.isFeatured,
    status: d.status,
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : d.status === "PUBLISHED" ? new Date() : null,
    readingTime: readingTime(content.uz ?? ""),
  };
}

export async function createArticle(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const exists = await prisma.article.findUnique({ where: { slug: parsed.data.slug } });
    if (exists) return { ok: false, error: "Bu slug band" };
    const row = await prisma.article.create({ data: toData(parsed.data) });
    await logAction("create", "Article", row.id, { slug: row.slug });
    siteRevalidate(row.slug);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateArticle(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const dup = await prisma.article.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
    if (dup) return { ok: false, error: "Bu slug band" };
    const row = await prisma.article.update({ where: { id }, data: toData(parsed.data) });
    await logAction("update", "Article", id, { slug: row.slug });
    siteRevalidate(row.slug);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    const row = await prisma.article.delete({ where: { id } });
    await logAction("delete", "Article", id, { slug: row.slug });
    siteRevalidate(row.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
