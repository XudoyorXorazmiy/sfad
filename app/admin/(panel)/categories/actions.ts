"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";
import { categorySchema } from "@/lib/validators";

function siteRevalidate() {
  for (const p of ["/", "/mahsulotlar"]) {
    revalidatePath(p);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  }
  revalidatePath("/admin/categories");
}

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    slug: formData.get("slug"),
    name: {
      uz: formData.get("name_uz") ?? "",
      ru: formData.get("name_ru") ?? "",
      en: formData.get("name_en") ?? "",
      ar: formData.get("name_ar") ?? "",
    },
    description: {
      uz: formData.get("description_uz") ?? "",
      ru: formData.get("description_ru") ?? "",
      en: formData.get("description_en") ?? "",
      ar: formData.get("description_ar") ?? "",
    },
    image: formData.get("image") ?? "",
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const exists = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
    if (exists) return { ok: false, error: "Bu slug band" };
    const max = await prisma.category.aggregate({ _max: { order: true } });
    const row = await prisma.category.create({
      data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
    });
    await logAction("create", "Category", row.id, { slug: row.slug });
    siteRevalidate();
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const dup = await prisma.category.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (dup) return { ok: false, error: "Bu slug band" };
    await prisma.category.update({ where: { id }, data: parsed.data });
    await logAction("update", "Category", id);
    siteRevalidate();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

/**
 * O'chirish: ichida mahsulot bo'lsa — moveToId berilmagan bo'lsa xato,
 * berilgan bo'lsa mahsulotlar o'sha kategoriyaga ko'chiriladi.
 */
export async function deleteCategory(
  id: string,
  moveToId?: string | null,
): Promise<ActionResult & { productCount?: number }> {
  try {
    await requireUser();
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0 && moveToId === undefined) {
      return { ok: false, error: "NEEDS_MOVE", productCount: count };
    }
    if (count > 0) {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: moveToId ?? null },
      });
    }
    await prisma.category.delete({ where: { id } });
    await logAction("delete", "Category", id, { movedProducts: count });
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.$transaction(
      ids.map((id, i) => prisma.category.update({ where: { id }, data: { order: i } })),
    );
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
