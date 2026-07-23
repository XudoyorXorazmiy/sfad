"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LangTabs, LocField } from "@/components/admin/lang-tabs";
import type { Loc } from "@/lib/i18n";
import {
  createCategory, deleteCategory, reorderCategories, updateCategory,
} from "./actions";

type Cat = {
  id: string; slug: string; name: Loc; description: Loc; image: string;
  isActive: boolean; productCount: number; nameUz: string;
};

export function CategoriesClient({ items }: { items: Cat[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Cat | null | "new">(null);
  const [deleting, setDeleting] = useState<Cat | null>(null);
  const [moveTo, setMoveTo] = useState<string>("");
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [dragId, setDragId] = useState<string | null>(null);

  const sorted = order
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as Cat[];

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setOrder(next);
    setDragId(null);
    startTransition(async () => {
      const res = await reorderCategories(next);
      if (res.ok) toast.success("Tartib saqlandi");
      else toast.error(res.error);
    });
  };

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const res =
        editing === "new"
          ? await createCategory(formData)
          : await updateCategory((editing as Cat).id, formData);
      if (res.ok) {
        toast.success("Saqlandi");
        setEditing(null);
        router.refresh();
      } else toast.error(res.error);
    });
  };

  const doDelete = (cat: Cat, move?: string | null) => {
    startTransition(async () => {
      const res = await deleteCategory(cat.id, move);
      if (res.ok) {
        toast.success("O'chirildi");
        setDeleting(null);
        router.refresh();
      } else if (res.error !== "NEEDS_MOVE") {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="bg-[#C8102E] hover:bg-[#9E0C24]"
          onClick={() => setEditing("new")}
        >
          <Plus className="mr-1 h-4 w-4" /> Yangi kategoriya
        </Button>
      </div>

      <div className="divide-y rounded-lg border bg-white">
        {sorted.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => setDragId(c.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(c.id)}
            className="flex items-center gap-3 px-4 py-3"
          >
            <GripVertical className="h-4 w-4 cursor-grab text-neutral-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.nameUz}</span>
                {!c.isActive && <Badge variant="outline">Nofaol</Badge>}
              </div>
              <div className="text-xs text-neutral-400">
                /{c.slug} · {c.productCount} ta mahsulot
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(c)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-red-600"
              onClick={() => {
                setMoveTo("");
                setDeleting(c);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Tahrir / yangi dialog */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Yangi kategoriya" : "Kategoriyani tahrirlash"}
            </DialogTitle>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <LangTabs>
              <div className="space-y-2">
                <Label>Nomi</Label>
                <LocField
                  render={(l) => (
                    <Input
                      name={`name_${l}`}
                      defaultValue={editing !== "new" ? editing?.name?.[l] ?? "" : ""}
                      required={l === "uz"}
                    />
                  )}
                />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Tavsif</Label>
                <LocField
                  render={(l) => (
                    <Input
                      name={`description_${l}`}
                      defaultValue={editing !== "new" ? editing?.description?.[l] ?? "" : ""}
                    />
                  )}
                />
              </div>
            </LangTabs>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  name="slug"
                  defaultValue={editing !== "new" ? editing?.slug : ""}
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <div className="space-y-2">
                <Label>Rasm URL</Label>
                <Input
                  name="image"
                  defaultValue={editing !== "new" ? editing?.image : ""}
                />
              </div>
            </div>
            <label className="flex items-center justify-between text-sm">
              Faol
              <Switch
                name="isActive"
                defaultChecked={editing !== "new" ? editing?.isActive : true}
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
                {pending ? "Saqlanmoqda…" : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* O'chirish dialogi */}
      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategoriyani o'chirish</DialogTitle>
            <DialogDescription>
              {deleting && deleting.productCount > 0
                ? `«${deleting.nameUz}» ichida ${deleting.productCount} ta mahsulot bor. Ularni qayerga ko'chiramiz?`
                : `«${deleting?.nameUz}» o'chiriladi.`}
            </DialogDescription>
          </DialogHeader>
          {deleting && deleting.productCount > 0 && (
            <select
              value={moveTo}
              onChange={(e) => setMoveTo(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
            >
              <option value="">— Kategoriyasiz qoldirish —</option>
              {items
                .filter((i) => i.id !== deleting.id)
                .map((i) => (
                  <option key={i.id} value={i.id}>{i.nameUz}</option>
                ))}
            </select>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => deleting && doDelete(deleting, moveTo || null)}
            >
              {pending ? "O'chirilmoqda…" : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
