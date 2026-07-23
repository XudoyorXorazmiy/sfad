"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";
import { locRequired } from "@/lib/validators";
import { z } from "zod";

const menuSchema = z.object({
  location: z.enum(["header", "footer"]),
  label: locRequired,
  url: z.string().min(1, "URL majburiy"),
  isActive: z.boolean().default(true),
});

function siteRevalidate() {
  for (const p of ["/", "/mahsulotlar", "/fabrika", "/eksport", "/yangiliklar", "/kontakt"]) {
    revalidatePath(p);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  }
  revalidatePath("/admin/menus");
}

function parseForm(formData: FormData) {
  return menuSchema.safeParse({
    location: formData.get("location"),
    label: {
      uz: formData.get("label_uz") ?? "",
      ru: formData.get("label_ru") ?? "",
      en: formData.get("label_en") ?? "",
      ar: formData.get("label_ar") ?? "",
    },
    url: formData.get("url"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createMenuItem(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const max = await prisma.menuItem.aggregate({
      where: { location: parsed.data.location },
      _max: { order: true },
    });
    const row = await prisma.menuItem.create({
      data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
    });
    await logAction("create", "MenuItem", row.id);
    siteRevalidate();
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    await prisma.menuItem.update({ where: { id }, data: parsed.data });
    await logAction("update", "MenuItem", id);
    siteRevalidate();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.menuItem.delete({ where: { id } });
    await logAction("delete", "MenuItem", id);
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function reorderMenuItems(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.$transaction(
      ids.map((id, i) => prisma.menuItem.update({ where: { id }, data: { order: i } })),
    );
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
