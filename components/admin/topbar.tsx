import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminTopbar({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
}) {
  const initials =
    name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/90 px-6 backdrop-blur">
      <div />
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
            render={<Link href="/" target="_blank" />}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Saytni ko'rish
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-offset-2 focus-visible:ring-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#C8102E] text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-neutral-500">{email}</div>
              <div className="mt-1 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                {role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <DropdownMenuItem
                render={<button type="submit" className="w-full cursor-pointer" />}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
