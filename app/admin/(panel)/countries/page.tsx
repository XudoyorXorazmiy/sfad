import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { CountriesClient } from "./countries-client";

export const metadata = { title: "Xarita davlatlari" };

export default async function CountriesPage() {
  const items = await prisma.exportCountry.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Eksport xaritasi davlatlari{" "}
        <span className="text-base font-normal text-neutral-400">({items.length})</span>
      </h1>
      <CountriesClient
        items={items.map((c) => ({
          id: c.id,
          isoCode: c.isoCode,
          name: c.name as Loc,
          nameUz: pick(c.name as Loc, "uz"),
          flag: c.flag,
          x: c.x,
          y: c.y,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
