"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LangTabs, LocField } from "@/components/admin/lang-tabs";
import type { Loc } from "@/lib/i18n";
import {
  createMenuItem, deleteMenuItem, reorderMenuItems, updateMenuItem,
} from "./actions";

type Item = {
  id: string; location: string; label: Loc; labelUz: string;
  url: string; isActive: boolean;
};

export function MenusClient({
  location, title, items,
}: {
  location: "header" | "footer"; title: string; items: Item[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Item | null | "new">(null);
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [dragId, setDragId] = useState<string | null>(null);

  const sorted = order
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as Item[];

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    next.splice(next.indexOf(targetId), 0, ...next.splice(next.indexOf(dragId), 1));
    setOrder(next);
    setDragId(null);
    startTransition(async () => {
      const res = await reorderMenuItems(next);
      if (!res.ok) toast.error(res.error);
    });
  };

  const submit = (fd: FormData) => {
    fd.set("location", location);
    startTransition(async () => {
      const res =
        editing === "new"
          ? await createMenuItem(fd)
          : await updateMenuItem((editing as Item).id, fd);
      if (res.ok) {
        toast.success("Saqlandi");
        setEditing(null);
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button size="xs" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="mr-1 h-3 w-3" /> Qo'shish
        </Button>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {sorted.map((m) => (
          <div
            key={m.id}
            draggable
            onDragStart={() => setDragId(m.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(m.id)}
            className="flex items-center gap-2.5 px-4 py-2"
          >
            <GripVertical className="h-3.5 w-3.5 cursor-grab text-neutral-300" />
            <div className="flex-1">
              <span className="text-sm font-medium">{m.labelUz}</span>
              <span className="ml-2 text-xs text-neutral-400">{m.url}</span>
            </div>
            {!m.isActive && <Badge variant="outline">Nofaol</Badge>}
            <Button variant="ghost" size="icon-xs" onClick={() => setEditing(m)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost" size="icon-xs" className="text-red-500"
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteMenuItem(m.id);
                  if (res.ok) { toast.success("O'chirildi"); router.refresh(); }
                  else toast.error(res.error);
                })
              }
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Menyu elementi qo'shish" : "Tahrirlash"}
            </DialogTitle>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <LangTabs>
              <div className="space-y-2">
                <Label>Yorliq</Label>
                <LocField
                  render={(l) => (
                    <Input
                      name={`label_${l}`}
                      defaultValue={editing !== "new" ? editing?.label?.[l] ?? "" : ""}
                      required={l === "uz"}
                    />
                  )}
                />
              </div>
            </LangTabs>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                name="url"
                defaultValue={editing !== "new" ? editing?.url : ""}
                required
                placeholder="/mahsulotlar yoki https://…"
              />
            </div>
            <label className="flex items-center justify-between text-sm">
              Faol
              <Switch name="isActive" defaultChecked={editing !== "new" ? editing?.isActive : true} />
            </label>
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
    </Card>
  );
}
