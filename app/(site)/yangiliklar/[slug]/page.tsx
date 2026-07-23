import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { SiteShell } from "@/components/site/site-shell";
import { WRAP } from "@/components/site/ui";
import { getArticle } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle(slug, "uz");
  return { title: a?.title ?? "SFAD", description: a?.excerpt };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const a = await getArticle(slug, "uz");
  if (!a) notFound();
  // qoralama faqat ?preview=1 bilan ko'rinadi
  if (a.status !== "PUBLISHED" && preview !== "1") notFound();

  return (
    <SiteShell locale="uz">
      <article style={{ background: "var(--white)", padding: "clamp(48px,6vw,80px) 0" }}>
        <div style={{ ...WRAP, maxWidth: 760 }}>
          {a.status !== "PUBLISHED" && (
            <div
              style={{
                marginBottom: 20,
                borderRadius: 10,
                background: "rgba(201,162,75,.14)",
                color: "#8F6E28",
                padding: "10px 14px",
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              Qoralama — faqat ko'rib chiqish rejimida ko'rinadi
            </div>
          )}
          <span
            style={{
              borderRadius: 99,
              background: "rgba(201,162,75,.12)",
              color: "#8F6E28",
              fontSize: 12.5,
              padding: "5px 12px",
            }}
          >
            {a.publishedAt?.toLocaleDateString("uz-UZ")} · {a.readingTime} daqiqa o&apos;qish
          </span>
          <h1
            style={{
              margin: "20px 0 0",
              fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem,3.6vw,2.8rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {a.title}
          </h1>

          {a.coverImage && (
            <div
              style={{
                position: "relative",
                marginTop: 32,
                borderRadius: 24,
                overflow: "hidden",
                aspectRatio: "16/9",
              }}
            >
              <Image src={a.coverImage} alt="" fill sizes="760px" style={{ objectFit: "cover" }} unoptimized />
            </div>
          )}

          <div
            className="sfad-article"
            style={{ marginTop: 36, fontSize: 17, lineHeight: 1.8, color: "var(--ink)" }}
            dangerouslySetInnerHTML={{ __html: a.content }}
          />
        </div>
      </article>
    </SiteShell>
  );
}
