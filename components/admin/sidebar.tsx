"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cookie,
  FolderTree,
  Newspaper,
  LayoutPanelTop,
  Globe2,
  Image as ImageIcon,
  Inbox,
  Search,
  Settings,
  ListTree,
  Users,
  ScrollText,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const NAV: { group: string; items: Item[] }[] = [
  {
    group: "Umumiy",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Kontent",
    items: [
      { href: "/admin/products", label: "Mahsulotlar", icon: Cookie },
      { href: "/admin/categories", label: "Kategoriyalar", icon: FolderTree },
      { href: "/admin/news", label: "Yangiliklar", icon: Newspaper },
      { href: "/admin/pages", label: "Sahifa bloklari", icon: LayoutPanelTop },
      { href: "/admin/countries", label: "Xarita davlatlari", icon: Globe2 },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    group: "Boshqaruv",
    items: [
      { href: "/admin/submissions", label: "Arizalar", icon: Inbox },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/menus", label: "Menyular", icon: ListTree },
      { href: "/admin/settings", label: "Sozlamalar", icon: Settings, adminOnly: true },
      { href: "/admin/users", label: "Foydalanuvchilar", icon: Users, adminOnly: true },
      { href: "/admin/logs", label: "Audit log", icon: ScrollText, adminOnly: true },
    ],
  },
];

export function AdminSidebar({ role }: { role: "ADMIN" | "EDITOR" }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-white md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <span className="text-xl font-extrabold tracking-tight text-[#C8102E]">
          SFAD
        </span>
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          CMS
        </span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {NAV.map((g) => {
          const items = g.items.filter((i) => !i.adminOnly || role === "ADMIN");
          if (items.length === 0) return null;
          return (
            <div key={g.group}>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {g.group}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#C8102E]/10 text-[#C8102E]"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
