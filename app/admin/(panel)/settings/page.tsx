import { prisma } from "@/lib/db";
import { requireAdmin } from "@/auth";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Sozlamalar" };

export default async function SettingsPage() {
  await requireAdmin();
  const rows = await prisma.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.value;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
      <SettingsClient initial={map} />
    </div>
  );
}
