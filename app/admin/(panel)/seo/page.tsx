import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { SeoClient } from "./seo-client";
import { seoAudit } from "./actions";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  const [pages, redirects, settings, issues] = await Promise.all([
    prisma.pageSeo.findMany({ include: { seo: true }, orderBy: { path: "asc" } }),
    prisma.redirect.findMany({ orderBy: { from: "asc" } }),
    prisma.setting.findMany({
      where: {
        key: {
          in: [
            "siteName", "defaultOgImage", "googleVerification", "yandexVerification",
            "googleAnalyticsId", "yandexMetrikaId", "robotsTxt",
          ],
        },
      },
    }),
    seoAudit(),
  ]);

  const globals: Record<string, string> = {};
  for (const s of settings) globals[s.key] = (s.value as string) ?? "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
      <SeoClient
        pages={pages.map((p) => ({
          path: p.path,
          metaTitle: (p.seo.metaTitle ?? {}) as Loc,
          metaDesc: (p.seo.metaDesc ?? {}) as Loc,
          keywords: (p.seo.keywords ?? {}) as Loc,
          ogImage: p.seo.ogImage ?? "",
          canonical: p.seo.canonical ?? "",
          noindex: p.seo.noindex,
          titleUz: pick((p.seo.metaTitle ?? {}) as Loc, "uz"),
        }))}
        redirects={redirects.map((r) => ({
          id: r.id, from: r.from, to: r.to, code: r.code,
        }))}
        globals={globals}
        issues={issues}
      />
    </div>
  );
}
