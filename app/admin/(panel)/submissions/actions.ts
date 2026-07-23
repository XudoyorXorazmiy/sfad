"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";
import type { ActionResult } from "@/lib/admin";
import type { SubStatus } from "@/lib/generated/prisma/enums";

export async function setSubmissionStatus(
  id: string,
  status: SubStatus,
): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.submission.update({ where: { id }, data: { status } });
    revalidatePath("/admin/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function setSubmissionNote(id: string, note: string): Promise<ActionResult> {
  try {
    await requireUser();
    await prisma.submission.update({ where: { id }, data: { note } });
    revalidatePath("/admin/submissions");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

/** Tanlangan arizalarni CSV matnga aylantiradi */
export async function exportSubmissionsCsv(ids: string[]): Promise<string> {
  await requireUser();
  const rows = await prisma.submission.findMany({
    where: ids.length ? { id: { in: ids } } : {},
    orderBy: { createdAt: "desc" },
  });
  const keys = new Set<string>();
  for (const r of rows) {
    Object.keys(r.data as Record<string, unknown>).forEach((k) => keys.add(k));
  }
  const cols = ["sana", "turi", "holat", ...keys, "izoh"];
  const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.join(",")];
  for (const r of rows) {
    const d = r.data as Record<string, unknown>;
    lines.push(
      [
        r.createdAt.toISOString().slice(0, 16).replace("T", " "),
        r.type,
        r.status,
        ...[...keys].map((k) => d[k]),
        r.note,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}
