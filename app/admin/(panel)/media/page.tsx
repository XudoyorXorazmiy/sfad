import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { MediaClient } from "./media-client";

export const metadata = { title: "Media kutubxona" };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const items = await prisma.media.findMany({
    where: {
      ...(sp.folder ? { folder: sp.folder } : {}),
      ...(sp.q ? { filename: { contains: sp.q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Media kutubxona{" "}
        <span className="text-base font-normal text-neutral-400">({items.length})</span>
      </h1>
      <MediaClient
        items={items.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          size: m.size,
          width: m.width,
          height: m.height,
          alt: pick((m.alt ?? {}) as Loc, "uz"),
          folder: m.folder ?? "pages",
        }))}
      />
    </div>
  );
}
