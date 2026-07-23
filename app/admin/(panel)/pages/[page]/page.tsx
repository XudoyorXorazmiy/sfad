import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { BlockToggle } from "./block-toggle";

export const metadata = { title: "Sahifa bloklari" };

const PAGE_LABELS: Record<string, string> = {
  home: "Bosh sahifa",
  products: "Mahsulotlar",
  about: "Fabrika haqida",
  export: "Eksport",
  news: "Yangiliklar",
  contacts: "Kontaktlar",
};

const KEY_LABELS: Record<string, string> = {
  hero: "Hero (bosh blok)",
  about: "Kompaniya haqida",
  stats: "Statistika raqamlari",
  productsIntro: "Mahsulotlar bo'limi",
  production: "Ishlab chiqarish qadamlari",
  exportIntro: "Eksport kirish",
  certs: "Sertifikatlar",
  coop: "Hamkorlik",
  jobs: "Vakansiyalar",
  newsIntro: "Yangiliklar bo'limi",
  contact: "Aloqa bo'limi",
  ctaPanel: "CTA panel",
  controls: "Boshqaruv paneli matnlari",
  banner: "Oraliq banner",
  company: "Kompaniya bloki",
  mission: "Missiya",
  values: "Qadriyatlar",
  timeline: "Tarix lentasi",
  advantages: "Afzalliklar",
  mapIntro: "Xarita kirish",
  manager: "Menejer",
  faq: "FAQ akkordeon",
  wizard: "Agent-anketa",
  packFormats: "Qadoq formatlari",
  formLabels: "Forma matnlari",
};

export default async function PageBlocks({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!PAGE_LABELS[page]) notFound();

  const blocks = await prisma.block.findMany({
    where: { page },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <Link href="/admin/pages" className="hover:text-neutral-700">
          Sahifalar
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-900">{PAGE_LABELS[page]}</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{PAGE_LABELS[page]}</h1>

      <div className="divide-y rounded-lg border bg-white">
        {blocks.map((b) => (
          <div key={b.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <Link
                href={`/admin/pages/${page}/${b.key}`}
                className="font-medium hover:text-[#C8102E]"
              >
                {KEY_LABELS[b.key] ?? b.key}
              </Link>
              <div className="text-xs text-neutral-400">
                {b.key} · <Badge variant="outline" className="text-[10px]">{b.type}</Badge>
              </div>
            </div>
            <BlockToggle page={page} blockKey={b.key} isActive={b.isActive} />
            <Link
              href={`/admin/pages/${page}/${b.key}`}
              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
            >
              Tahrirlash
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
