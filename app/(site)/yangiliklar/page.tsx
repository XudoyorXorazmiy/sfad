import type { Metadata } from "next";
import { SiteShell } from "@/components/site/site-shell";
import { NewsPage } from "@/components/site/pages";
import { getPageSeo } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("/yangiliklar", "uz");
  return { title: seo?.title || "SFAD", description: seo?.description };
}

export default async function Page() {
  return (
    <SiteShell locale="uz">
      <NewsPage locale="uz" />
    </SiteShell>
  );
}
