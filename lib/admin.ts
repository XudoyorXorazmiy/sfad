"use server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

/** Har bir o'zgarishni audit logga yozadi */
export async function logAction(
  action: "create" | "update" | "delete",
  entity: string,
  entityId: string,
  changes?: unknown,
) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action,
      entity,
      entityId,
      changes: changes ? (changes as object) : undefined,
    },
  });
}

/** Publik sayt yo'llarini qayta generatsiya qiladi */
export async function revalidateSite(paths: string[] = ["/"]) {
  for (const p of paths) revalidatePath(p);
  // locale-prefiksli versiyalar
  for (const locale of ["ru", "en", "ar"]) {
    for (const p of paths) revalidatePath(`/${locale}${p === "/" ? "" : p}`);
  }
}

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };
