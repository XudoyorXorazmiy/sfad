import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { Home } from "@/components/site/home";
import { getPageSeo } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/", "uz");
  return {
    title: seo?.title || "SFAD — Shirinliklar sehri",
    description: seo?.description,
    robots: seo?.noindex ? { index: false } : undefined,
  };
}

export default async function HomePage() {
  return (
    <SiteShell locale="uz">
      <Home locale="uz" />
    </SiteShell>
  );
}
