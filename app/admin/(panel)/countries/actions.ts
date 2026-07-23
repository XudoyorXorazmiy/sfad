"use server";

import { readFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";
import { countrySchema } from "@/lib/validators";

function siteRevalidate() {
  for (const p of ["/", "/eksport"]) {
    revalidatePath(p);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  }
  revalidatePath("/admin/countries");
}

/** world.svg ichida path#ISO mavjudligini tekshiradi */
export async function checkIsoInSvg(iso: string): Promise<boolean> {
  try {
    const svg = await readFile(
      path.join(process.cwd(), "public", "world.svg"),
      "utf8",
    );
    return new RegExp(`id="${iso.toUpperCase()}"`).test(svg);
  } catch {
    return false;
  }
}

function parseForm(formData: FormData) {
  return countrySchema.safeParse({
    isoCode: formData.get("isoCode"),
    name: {
      uz: formData.get("name_uz") ?? "",
      ru: formData.get("name_ru") ?? "",
      en: formData.get("name_en") ?? "",
      ar: formData.get("name_ar") ?? "",
    },
    flag: formData.get("flag"),
    x: formData.get("x"),
    y: formData.get("y"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createCountry(formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const exists = await prisma.exportCountry.findUnique({
      where: { isoCode: parsed.data.isoCode },
    });
    if (exists) return { ok: false, error: "Bu ISO kod allaqachon bor" };
    if (!(await checkIsoInSvg(parsed.data.isoCode))) {
      return { ok: false, error: `world.svg ichida path#${parsed.data.isoCode} topilmadi` };
    }
    const max = await prisma.exportCountry.aggregate({ _max: { order: true } });
    const row = await prisma.exportCountry.create({
      data: { ...parsed.data, order: (max._max.order ?? 0) + 1 },
    });
    await logAction("create", "ExportCountry", row.id, { iso: row.isoCode });
    siteRevalidate();
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateCountry(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = parseForm(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    await prisma.exportCountry.update({ where: { id }, data: parsed.data });
    await logAction("update", "ExportCountry", id);
    siteRevalidate();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteCountry(id: string): Promise<ActionResult> {
  try {
    await requireUser();
    const row = await prisma.exportCountry.delete({ where: { id } });
    await logAction("delete", "ExportCountry", id, { iso: row.isoCode });
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function reorderCountries(ids: string[]): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.exportCountry.update({ where: { id }, data: { order: i } }),
      ),
    );
    siteRevalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
