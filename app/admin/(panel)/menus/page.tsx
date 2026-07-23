import { prisma } from "@/lib/db";
import { pick, type Loc } from "@/lib/i18n";
import { MenusClient } from "./menus-client";

export const metadata = { title: "Menyular" };

export default async function MenusPage() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ location: "asc" }, { order: "asc" }],
  });

  const mapped = items.map((m) => ({
    id: m.id,
    location: m.location,
    label: m.label as Loc,
    labelUz: pick(m.label as Loc, "uz"),
    url: m.url,
    isActive: m.isActive,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Menyular</h1>
      <div className="grid gap-5 lg:grid-cols-2">
        <MenusClient location="header" title="Header menyu" items={mapped.filter((m) => m.location === "header")} />
        <MenusClient location="footer" title="Footer menyu" items={mapped.filter((m) => m.location === "footer")} />
      </div>
    </div>
  );
}
