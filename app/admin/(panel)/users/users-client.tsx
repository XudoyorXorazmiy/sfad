"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { createUser, deleteUser, updateUser } from "./actions";

type U = {
  id: string; email: string; name: string; role: string;
  isActive: boolean; createdAt: string;
};

export function UsersClient({ items, selfId }: { items: U[]; selfId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<U | null | "new">(null);

  const submit = (fd: FormData) => {
    startTransition(async () => {
      const res =
        editing === "new"
          ? await createUser(fd)
          : await updateUser((editing as U).id, fd);
      if (res.ok) {
        toast.success("Saqlandi");
        setEditing(null);
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" className="bg-[#C8102E] hover:bg-[#9E0C24]" onClick={() => setEditing("new")}>
          <Plus className="mr-1 h-4 w-4" /> Foydalanuvchi qo'shish
        </Button>
      </div>

      <div className="divide-y rounded-lg border bg-white">
        {items.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1">
              <span className="text-sm font-medium">{u.name}</span>
              <span className="ml-2 text-xs text-neutral-400">{u.email}</span>
            </div>
            <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
            {!u.isActive && <Badge variant="outline">Bloklangan</Badge>}
            <span className="text-xs text-neutral-400">{u.createdAt}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(u)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {u.id !== selfId && (
              <Button
                variant="ghost" size="icon-sm" className="text-red-600"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteUser(u.id);
                    if (res.ok) { toast.success("O'chirildi"); router.refresh(); }
                    else toast.error(res.error);
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Yangi foydalanuvchi" : "Tahrirlash"}
            </DialogTitle>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Ism</Label>
              <Input name="name" defaultValue={editing !== "new" ? editing?.name : ""} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue={editing !== "new" ? editing?.email : ""} required />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                name="role"
                defaultValue={editing !== "new" ? editing?.role : "EDITOR"}
                className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
              >
                <option value="EDITOR">EDITOR — kontent</option>
                <option value="ADMIN">ADMIN — to'liq huquq</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>
                Parol{editing !== "new" && (
                  <span className="text-neutral-400"> (bo'sh — o'zgarmaydi)</span>
                )}
              </Label>
              <Input name="password" type="password" minLength={editing === "new" ? 8 : 0} required={editing === "new"} />
            </div>
            {editing !== "new" && (
              <label className="flex items-center justify-between text-sm">
                Faol
                <Switch name="isActive" defaultChecked={editing?.isActive} />
              </label>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
                {pending ? "…" : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
