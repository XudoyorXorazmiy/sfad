"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { submissionSchemas } from "@/lib/validators";
import type { FormType } from "@/lib/generated/prisma/enums";

export type FormResult = { ok: true } | { ok: false; error: string };

/** Sayt formalari → Submission. Honeypot + oddiy rate limit bilan. */
export async function submitForm(
  type: FormType,
  data: Record<string, string>,
  honeypot?: string,
): Promise<FormResult> {
  try {
    // bot tuzog'i: yashirin maydon to'ldirilgan bo'lsa — jimgina "ok"
    if (honeypot) return { ok: true };

    const schema = submissionSchemas[type];
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;

    // 1 daqiqada 5 tadan ko'p ariza — rad etiladi
    if (ip) {
      const recent = await prisma.submission.count({
        where: { ip, createdAt: { gte: new Date(Date.now() - 60_000) } },
      });
      if (recent >= 5) {
        return { ok: false, error: "Juda ko'p urinish. Biroz kuting." };
      }
    }

    await prisma.submission.create({
      data: { type, data: parsed.data, ip },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Xatolik yuz berdi. Keyinroq urinib ko'ring." };
  }
}
