"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, requireAdmin } from "@/auth";
import { logAction, type ActionResult } from "@/lib/admin";

const seoSchema = z.object({
  metaTitle: z.object({ uz: z.string(), ru: z.string(), en: z.string(), ar: z.string() }),
  metaDesc: z.object({ uz: z.string(), ru: z.string(), en: z.string(), ar: z.string() }),
  ogImage: z.string(),
  canonical: z.string(),
  noindex: z.boolean(),
  keywords: z.object({ uz: z.string(), ru: z.string(), en: z.string(), ar: z.string() }),
});

export async function savePageSeo(path: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireUser();
    const loc = (key: string) => ({
      uz: (formData.get(`${key}_uz`) as string) ?? "",
      ru: (formData.get(`${key}_ru`) as string) ?? "",
      en: (formData.get(`${key}_en`) as string) ?? "",
      ar: (formData.get(`${key}_ar`) as string) ?? "",
    });
    const parsed = seoSchema.safeParse({
      metaTitle: loc("metaTitle"),
      metaDesc: loc("metaDesc"),
      ogImage: formData.get("ogImage") ?? "",
      canonical: formData.get("canonical") ?? "",
      noindex: formData.get("noindex") === "on",
      keywords: loc("keywords"),
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const existing = await prisma.pageSeo.findUnique({ where: { path } });
    if (existing) {
      await prisma.seo.update({
        where: { id: existing.seoId },
        data: {
          metaTitle: parsed.data.metaTitle,
          metaDesc: parsed.data.metaDesc,
          ogImage: parsed.data.ogImage || null,
          canonical: parsed.data.canonical || null,
          noindex: parsed.data.noindex,
          keywords: parsed.data.keywords,
        },
      });
    } else {
      await prisma.pageSeo.create({
        data: {
          path,
          seo: {
            create: {
              metaTitle: parsed.data.metaTitle,
              metaDesc: parsed.data.metaDesc,
              ogImage: parsed.data.ogImage || null,
              canonical: parsed.data.canonical || null,
              noindex: parsed.data.noindex,
              keywords: parsed.data.keywords,
            },
          },
        },
      });
    }
    await logAction("update", "PageSeo", path);
    revalidatePath(path);
    for (const l of ["ru", "en", "ar"]) revalidatePath(`/${l}${path === "/" ? "" : path}`);
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

const redirectSchema = z.object({
  from: z.string().min(1).regex(/^\//, "'/' bilan boshlanishi kerak"),
  to: z.string().min(1),
  code: z.coerce.number().refine((c) => c === 301 || c === 302, "301 yoki 302"),
});

export async function createRedirect(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = redirectSchema.safeParse({
      from: formData.get("from"),
      to: formData.get("to"),
      code: formData.get("code"),
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const exists = await prisma.redirect.findUnique({ where: { from: parsed.data.from } });
    if (exists) return { ok: false, error: "Bu manzil uchun redirect bor" };
    await prisma.redirect.create({ data: parsed.data });
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.redirect.delete({ where: { id } });
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function saveSeoGlobals(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const keys = [
      "siteName", "defaultOgImage", "googleVerification", "yandexVerification",
      "googleAnalyticsId", "yandexMetrikaId", "robotsTxt",
    ];
    await prisma.$transaction(
      keys.map((key) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: (formData.get(key) as string) ?? "" },
          create: { key, value: (formData.get(key) as string) ?? "" },
        }),
      ),
    );
    await logAction("update", "Setting", "seo-globals");
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Xatolik" };
  }
}

/** SEO muammolar ro'yxati */
export async function seoAudit(): Promise<string[]> {
  await requireUser();
  const issues: string[] = [];
  const pages = await prisma.pageSeo.findMany({ include: { seo: true } });
  for (const p of pages) {
    const t = (p.seo.metaTitle as Record<string, string>)?.uz ?? "";
    const d = (p.seo.metaDesc as Record<string, string>)?.uz ?? "";
    if (!t) issues.push(`${p.path}: meta sarlavha bo'sh`);
    if (!d) issues.push(`${p.path}: meta tavsif bo'sh`);
    if (t.length > 60) issues.push(`${p.path}: meta sarlavha 60 belgidan uzun (${t.length})`);
    if (d.length > 160) issues.push(`${p.path}: meta tavsif 160 belgidan uzun (${d.length})`);
  }
  const titles = pages.map((p) => (p.seo.metaTitle as Record<string, string>)?.uz).filter(Boolean);
  const dup = titles.filter((t, i) => titles.indexOf(t) !== i);
  for (const d of [...new Set(dup)]) issues.push(`Takroriy meta sarlavha: "${d}"`);
  const noAlt = await prisma.media.count({ where: { alt: { equals: undefined } } });
  if (noAlt > 0) issues.push(`${noAlt} ta media faylda alt matn yo'q`);
  return issues;
}
