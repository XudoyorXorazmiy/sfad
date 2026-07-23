import { prisma } from "@/lib/db";
import { requireAdmin } from "@/auth";
import { UsersClient } from "./users-client";

export const metadata = { title: "Foydalanuvchilar" };

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
      <UsersClient
        selfId={session.user.id}
        items={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt.toLocaleDateString("uz-UZ"),
        }))}
      />
    </div>
  );
}
