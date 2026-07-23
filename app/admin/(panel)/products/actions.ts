"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";
import { productSchema } from "@/lib/validators";

function siteRevalidate() {
  for (const p of ["/", "/mahsulotlar"]) {
    revalidatePath(p);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  }
  revalidatePath("/admin/products");
}

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: {
      uz: formData.get("description_uz") ?? "",
      ru: formData.get("description_ru") ?? "",
      en: formData.get("description_en") ?? "",
      ar: formData.get("description_ar") ?? "",
    },
    image: formData.get("image"),
    gallery: (formData.get("gallery") as string ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    categoryId: (formData.get("categoryId") as string) || null,
    shelfLife: formData.get("shelfLife") ?? "",
    weight: formData.get("weight") ?? "",
    packaging: formData.get("packaging") ?? "",
    badge: (formData.get("badge") as string) || null,
    isPackaged: formData.get("isPackaged") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    status: formData.get("status") ?? "PUBLISHED",
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const exists = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (exists) return { ok: false, error: "Bu slug allaqachon band" };

    const max = await prisma.product.aggregate({ _max: { order: true } });
    const row = await prisma.product.create({
      data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
    });
    await logAction("create", "Product", row.id, { name: row.name });
    siteRevalidate();
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const dup = await prisma.product.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (dup) return { ok: false, error: "Bu slug allaqachon band" };

    const row = await prisma.product.update({ where: { id }, data: parsed.data });
    await logAction("update", "Product", id, { name: row.name });
    siteRevalidate();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    const row = await prisma.product.delete({ where: { id } });
    await logAction("delete", "Product", id, { name: row.name });
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.product.update({ where: { id }, data: { order: i } }),
      ),
    );
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function bulkProductStatus(
  ids: string[],
  status: "DRAFT" | "PUBLISHED",
): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function bulkProductDelete(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await logAction("delete", "Product", ids.join(","), { count: ids.length });
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
