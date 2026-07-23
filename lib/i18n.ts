export const LOCALES = ["uz", "ru", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uz";
export const RTL_LOCALES: Locale[] = ["ar"];

/** Ko'p tilli JSON maydon: { uz, ru, en, ar } */
export type Loc = Partial<Record<Locale, string>>;

/** Tilga mos qiymat, bo'sh bo'lsa UZ ga fallback */
export function pick(v: Loc | null | undefined, locale: Locale): string {
  if (!v) return "";
  return v[locale]?.trim() ? v[locale]! : (v[DEFAULT_LOCALE] ?? "");
}

export function isLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

export const LOCALE_NAMES: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
  ar: "العربية",
};
