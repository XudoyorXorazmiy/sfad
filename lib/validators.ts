import { z } from "zod";

/** {uz,ru,en,ar} — faqat UZ majburiy bo'lishi mumkin */
export const locSchema = z.object({
  uz: z.string(),
  ru: z.string().optional().default(""),
  en: z.string().optional().default(""),
  ar: z.string().optional().default(""),
});
export const locRequired = locSchema.refine((v) => v.uz.trim().length > 0, {
  message: "O'zbekcha qiymat majburiy",
});

export const slugSchema = z
  .string()
  .min(1, "Slug majburiy")
  .regex(/^[a-z0-9-]+$/, "Faqat kichik lotin harf, raqam va '-'");

export const productSchema = z.object({
  name: z.string().min(1, "Nom majburiy"),
  slug: slugSchema,
  description: locSchema,
  image: z.string().min(1, "Rasm majburiy"),
  gallery: z.array(z.string()).default([]),
  categoryId: z.string().nullable().default(null),
  shelfLife: z.string().default(""),
  weight: z.string().default(""),
  packaging: z.string().default(""),
  badge: z.enum(["NEW", "HIT", "SUGAR_FREE"]).nullable().default(null),
  isPackaged: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  slug: slugSchema,
  name: locRequired,
  description: locSchema.optional(),
  image: z.string().default(""),
  isActive: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const articleSchema = z.object({
  slug: slugSchema,
  title: locRequired,
  excerpt: locSchema,
  content: locSchema,
  coverImage: z.string().default(""),
  category: z.string().default(""),
  isFeatured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().default(""),
});
export type ArticleInput = z.infer<typeof articleSchema>;

export const countrySchema = z.object({
  isoCode: z
    .string()
    .length(2, "ISO kod 2 harf")
    .transform((s) => s.toUpperCase()),
  name: locRequired,
  flag: z.string().min(1, "Bayroq emoji majburiy"),
  x: z.coerce.number(),
  y: z.coerce.number(),
  isActive: z.boolean().default(true),
});
export type CountryInput = z.infer<typeof countrySchema>;

/** Sayt formalari */
export const submissionSchemas = {
  CONTACT: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    message: z.string().default(""),
  }),
  PARTNER: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    company: z.string().default(""),
    role: z.string().default(""),
    message: z.string().default(""),
  }),
  AGENT: z.object({
    name: z.string().min(1),
    appeal: z.string().default(""),
    phone: z.string().min(5),
    email: z.string().email(),
    region: z.string().min(1),
    city: z.string().default(""),
    experience: z.string().default(""),
    source: z.string().default(""),
    note: z.string().default(""),
  }),
  VACANCY: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    position: z.string().default(""),
    message: z.string().default(""),
  }),
  PRODUCT_INQUIRY: z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    product: z.string().default(""),
    note: z.string().default(""),
  }),
};
