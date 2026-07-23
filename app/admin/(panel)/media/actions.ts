"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.media.update({
      where: { id },
      data: { alt: { uz: alt } },
    });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

/** O'chirishdan oldin qayerda ishlatilayotganini tekshiradi */
export async function checkMediaUsage(url: string): Promise<string[]> {
  const usage: string[] = [];
  const [prodImg, prodGal, artCover, catImg] = await Promise.all([
    prisma.product.findMany({ where: { image: url }, select: { name: true } }),
    prisma.product.findMany({ where: { gallery: { has: url } }, select: { name: true } }),
    prisma.article.findMany({ where: { coverImage: url }, select: { slug: true } }),
    prisma.category.findMany({ where: { image: url }, select: { slug: true } }),
  ]);
  prodImg.forEach((p) => usage.push(`Mahsulot: ${p.name}`));
  prodGal.forEach((p) => usage.push(`Mahsulot galereyasi: ${p.name}`));
  artCover.forEach((a) => usage.push(`Maqola: ${a.slug}`));
  catImg.forEach((c) => usage.push(`Kategoriya: ${c.slug}`));
  // Block data ichida qidirish
  const blocks = await prisma.block.findMany({ select: { page: true, key: true, data: true } });
  for (const b of blocks) {
    if (JSON.stringify(b.data).includes(url)) usage.push(`Blok: ${b.page}/${b.key}`);
  }
  return usage;
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    const row = await prisma.media.delete({ where: { id } });
    await logAction("delete", "Media", id, { filename: row.filename });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
