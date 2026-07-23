import { prisma } from "@/lib/db";
import { pick, type Loc, type Locale } from "@/lib/i18n";

/** Sahifa bloklarini {key: data} ko'rinishida qaytaradi (faqat faol) */
export async function getBlocks(page: string): Promise<Record<string, BlockData>> {
  const rows = await prisma.block.findMany({
    where: { page, isActive: true },
    orderBy: { order: "asc" },
  });
  const out: Record<string, BlockData> = {};
  for (const r of rows) out[r.key] = (r.data ?? {}) as BlockData;
  return out;
}

export type BlockData = Record<string, unknown>;

/** Blok ichidan ko'p tilli matnni oladi: t(block, "title") */
export function t(data: BlockData | undefined, key: string, locale: Locale): string {
  if (!data) return "";
  const v = data[key];
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return pick(v as Loc, locale);
  return "";
}

/** Ichma-ich yo'l bo'yicha: tp(block, "cta.label") */
export function tp(data: BlockData | undefined, path: string, locale: Locale): string {
  if (!data) return "";
  let cur: unknown = data;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[part];
    else return "";
  }
  if (typeof cur === "string") return cur;
  if (cur && typeof cur === "object") return pick(cur as Loc, locale);
  return "";
}

/** Blok ichidagi oddiy qiymat (URL, rasm va h.k.) */
export function raw(data: BlockData | undefined, path: string): string {
  if (!data) return "";
  let cur: unknown = data;
  for (const part of path.split(".")) {
    if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[part];
    else return "";
  }
  return typeof cur === "string" ? cur : "";
}

/** Blok ichidagi massiv (items, steps…) */
export function list(data: BlockData | undefined, key = "items"): BlockData[] {
  if (!data) return [];
  const v = data[key];
  return Array.isArray(v) ? (v as BlockData[]) : [];
}

/** Sozlamalar {key: value} */
export async function getSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  const out: Record<string, unknown> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export function setting(s: Record<string, unknown>, key: string, locale?: Locale): string {
  const v = s[key];
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && locale) return pick(v as Loc, locale);
  return "";
}

/** Menyu (header/footer) */
export async function getMenu(location: "header" | "footer", locale: Locale) {
  const rows = await prisma.menuItem.findMany({
    where: { location, isActive: true },
    orderBy: { order: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    label: pick(m.label as Loc, locale),
    url: m.url,
  }));
}

/** Bosh sahifa karuseli uchun mahsulotlar */
export async function getFeaturedProducts(locale: Locale, take = 8) {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { order: "asc" },
    take,
    include: { category: true },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: pick((p.description ?? {}) as Loc, locale),
    image: p.image,
    weight: p.weight ?? "",
    shelfLife: p.shelfLife ?? "",
    badge: p.badge,
    categorySlug: p.category?.slug ?? "",
    categoryName: p.category ? pick(p.category.name as Loc, locale) : "",
  }));
}

/** Katalog uchun barcha mahsulotlar */
export async function getAllProducts(locale: Locale) {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: { category: true },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: pick((p.description ?? {}) as Loc, locale),
    image: p.image,
    weight: p.weight ?? "",
    shelfLife: p.shelfLife ?? "",
    packaging: p.packaging ?? "",
    badge: p.badge as string | null,
    isPackaged: p.isPackaged,
    cat: p.category?.slug ?? "",
  }));
}

export async function getCategories(locale: Locale) {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((c) => ({
    slug: c.slug,
    name: pick(c.name as Loc, locale),
    count: c._count.products,
  }));
}

/** Eksport xaritasi davlatlari */
export async function getExportCountries(locale: Locale) {
  const rows = await prisma.exportCountry.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return rows.map((c) => ({
    id: c.isoCode,
    name: pick(c.name as Loc, locale),
    flag: c.flag,
    x: c.x,
    y: c.y,
  }));
}

/** Nashr etilgan maqolalar */
export async function getArticles(locale: Locale, take?: number) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    ...(take ? { take } : {}),
  });
  return rows.map((a) => ({
    slug: a.slug,
    title: pick(a.title as Loc, locale),
    excerpt: pick(a.excerpt as Loc, locale),
    coverImage: a.coverImage ?? "",
    category: a.category ?? "",
    isFeatured: a.isFeatured,
    readingTime: a.readingTime ?? 3,
    publishedAt: a.publishedAt,
  }));
}

export async function getArticle(slug: string, locale: Locale) {
  const a = await prisma.article.findUnique({ where: { slug } });
  if (!a) return null;
  return {
    slug: a.slug,
    title: pick(a.title as Loc, locale),
    excerpt: pick(a.excerpt as Loc, locale),
    content: pick(a.content as Loc, locale),
    coverImage: a.coverImage ?? "",
    category: a.category ?? "",
    readingTime: a.readingTime ?? 3,
    publishedAt: a.publishedAt,
    status: a.status,
  };
}

/** Sahifa SEO meta */
export async function getPageSeo(path: string, locale: Locale) {
  const row = await prisma.pageSeo.findUnique({
    where: { path },
    include: { seo: true },
  });
  if (!row) return null;
  return {
    title: pick((row.seo.metaTitle ?? {}) as Loc, locale),
    description: pick((row.seo.metaDesc ?? {}) as Loc, locale),
    ogImage: row.seo.ogImage ?? "",
    canonical: row.seo.canonical ?? "",
    noindex: row.seo.noindex,
  };
}

/** Locale prefiksli havola: uz → /yo'l, boshqasi → /ru/yo'l */
export function href(url: string, locale: Locale): string {
  if (!url.startsWith("/")) return url;
  if (locale === "uz") return url;
  return `/${locale}${url === "/" ? "" : url}`;
}
