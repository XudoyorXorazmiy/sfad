"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";

const PAGE_PATHS: Record<string, string> = {
  home: "/",
  products: "/mahsulotlar",
  about: "/fabrika",
  export: "/eksport",
  news: "/yangiliklar",
  contacts: "/kontakt",
};

function siteRevalidate(page: string) {
  const p = PAGE_PATHS[page] ?? "/";
  revalidatePath(p);
  for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${p === "/" ? "" : p}`);
  revalidatePath(`/admin/pages/${page}`);
}

export async function updateBlockData(
  page: string,
  key: string,
  data: unknown,
): Promise<ActionResult> {
  try {
    await requireUser();
    if (typeof data !== "object" || data === null) {
      return { ok: false, error: "Noto'g'ri ma'lumot" };
    }
    const row = await prisma.block.update({
      where: { page_key: { page, key } },
      data: { data: data as object },
    });
    await logAction("update", "Block", row.id, { page, key });
    siteRevalidate(page);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function toggleBlock(
  page: string,
  key: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.block.update({
      where: { page_key: { page, key } },
      data: { isActive },
    });
    siteRevalidate(page);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
