"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth, requireAdmin } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";

const userSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  name: z.string().min(1, "Ism majburiy"),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: z.string(),
  isActive: z.boolean(),
});

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = userSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
      password: formData.get("password"),
      isActive: true,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    if (parsed.data.password.length < 8) {
      return { ok: false, error: "Parol kamida 8 belgi" };
    }
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) return { ok: false, error: "Bu email band" };
    const row = await prisma.user.create({
      data: {
        ...parsed.data,
        password: await bcrypt.hash(parsed.data.password, 12),
      },
    });
    await logAction("create", "User", row.id, { email: row.email });
    revalidatePath("/admin/users");
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateUser(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = userSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
      password: formData.get("password") ?? "",
      isActive: formData.get("isActive") === "on",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    if (session.user.id === id && parsed.data.role !== "ADMIN") {
      return { ok: false, error: "O'z rolingizni pasaytira olmaysiz" };
    }
    const data: Record<string, unknown> = {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
    };
    if (parsed.data.password) {
      if (parsed.data.password.length < 8) {
        return { ok: false, error: "Parol kamida 8 belgi" };
      }
      data.password = await bcrypt.hash(parsed.data.password, 12);
    }
    await prisma.user.update({ where: { id }, data });
    await logAction("update", "User", id);
    revalidatePath("/admin/users");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    if (session.user.id === id) {
      return { ok: false, error: "O'zingizni o'chira olmaysiz" };
    }
    await prisma.auditLog.deleteMany({ where: { userId: id } });
    const row = await prisma.user.delete({ where: { id } });
    const s = await auth();
    if (s?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: s.user.id,
          action: "delete",
          entity: "User",
          entityId: id,
          changes: { email: row.email },
        },
      });
    }
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}
