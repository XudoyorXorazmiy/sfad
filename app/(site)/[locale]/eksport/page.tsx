import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { ExportPage } from "@/components/site/pages";
import { getPageSeo } from "@/lib/site";
import { isLocale } from "@/lib/i18n";

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = await getPageSeo("/eksport", locale);
  return { title: seo?.title || "SFAD", description: seo?.description };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "uz") notFound();
  return (
    <SiteShell locale={locale}>
      <ExportPage locale={locale} />
    </SiteShell>
  );
}
