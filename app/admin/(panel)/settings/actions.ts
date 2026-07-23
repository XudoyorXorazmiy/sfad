"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";

export async function saveSettings(
  entries: { key: string; value: unknown }[],
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.$transaction(
      entries.map((e) =>
        prisma.setting.upsert({
          where: { key: e.key },
          update: { value: e.value as object },
          create: { key: e.key, value: e.value as object },
        }),
      ),
    );
    await logAction("update", "Setting", entries.map((e) => e.key).join(","));
    // sozlamalar hamma sahifada ishlatiladi
    for (const p of ["/", "/mahsulotlar", "/fabrika", "/eksport", "/yangiliklar", "/kontakt"]) {
      revalidatePath(p);
      for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
    }
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
