import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: { default: "SFAD Admin", template: "%s — SFAD Admin" },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar role={session.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          name={session.user.name ?? ""}
          email={session.user.email ?? ""}
          role={session.user.role}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
