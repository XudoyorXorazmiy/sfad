"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  createCountry, deleteCountry, reorderCountries, updateCountry,
} from "./actions";

type Country = {
  id: string; isoCode: string; name: Loc; nameUz: string;
  flag: string; x: number; y: number; isActive: boolean;
};

// world.svg o'lchamlari (preview foizlari uchun)
const SVG_W = 1009.7;
const SVG_H = 666;

export function CountriesClient({ items }: { items: Country[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Country | null | "new">(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 500, y: 300 });
  const [order, setOrder] = useState(items.map((i) => i.id));
  const [dragId, setDragId] = useState<string | null>(null);

  const sorted = order
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as Country[];

  const openEdit = (c: Country | "new") => {
    setEditing(c);
    setPos(c === "new" ? { x: 500, y: 300 } : { x: c.x, y: c.y });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...order];
    next.splice(next.indexOf(targetId), 0, ...next.splice(next.indexOf(dragId), 1));
    setOrder(next);
    setDragId(null);
    startTransition(async () => {
      const res = await reorderCountries(next);
      if (res.ok) toast.success("Tartib saqlandi");
      else toast.error(res.error);
    });
  };

  const submit = (formData: FormData) => {
    formData.set("x", String(pos.x));
    formData.set("y", String(pos.y));
    startTransition(async () => {
      const res =
        editing === "new"
          ? await createCountry(formData)
          : await updateCountry((editing as Country).id, formData);
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
        <Button size="sm" className="bg-[#C8102E] hover:bg-[#9E0C24]" onClick={() => openEdit("new")}>
          <Plus className="mr-1 h-4 w-4" /> Davlat qo'shish
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
            className="flex items-center gap-3 px-4 py-2.5"
          >
            <GripVertical className="h-4 w-4 cursor-grab text-neutral-300" />
            <span className="text-lg">{c.flag}</span>
            <div className="flex-1">
              <span className="font-medium">{c.nameUz}</span>
              <span className="ml-2 text-xs text-neutral-400">
                {c.isoCode} · x:{c.x.toFixed(1)} y:{c.y.toFixed(1)}
              </span>
            </div>
            {!c.isActive && <Badge variant="outline">Nofaol</Badge>}
            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon-sm" className="text-red-600"
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteCountry(c.id);
                  if (res.ok) { toast.success("O'chirildi"); router.refresh(); }
                  else toast.error(res.error);
                })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing === "new" ? "Davlat qo'shish" : "Davlatni tahrirlash"}
            </DialogTitle>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <LangTabs>
                  <div className="space-y-2">
                    <Label>Davlat nomi</Label>
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
                </LangTabs>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ISO kod</Label>
                    <Input
                      name="isoCode"
                      defaultValue={editing !== "new" ? editing?.isoCode : ""}
                      maxLength={2}
                      required
                      className="uppercase"
                      placeholder="KZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bayroq emoji</Label>
                    <Input
                      name="flag"
                      defaultValue={editing !== "new" ? editing?.flag : ""}
                      required
                      placeholder="🇰🇿"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>X koordinata</Label>
                    <Input
                      type="number" step="0.1" value={pos.x}
                      onChange={(e) => setPos((p) => ({ ...p, x: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y koordinata</Label>
                    <Input
                      type="number" step="0.1" value={pos.y}
                      onChange={(e) => setPos((p) => ({ ...p, y: Number(e.target.value) }))}
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
              </div>

              {/* Jonli mini-xarita: bosilgan joy koordinataga aylanadi */}
              <div className="space-y-1.5">
                <Label className="text-xs">Oldindan ko'rish (bosing)</Label>
                <div
                  className="relative cursor-crosshair overflow-hidden rounded-md border bg-[#F2F5FB]"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setPos({
                      x: Number((((e.clientX - r.left) / r.width) * SVG_W).toFixed(1)),
                      y: Number((((e.clientY - r.top) / r.height) * SVG_H).toFixed(1)),
                    });
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/world.svg" alt="Xarita" className="block w-full" />
                  <span
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#C8102E] shadow"
                    style={{
                      left: `${(pos.x / SVG_W) * 100}%`,
                      top: `${(pos.y / SVG_H) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
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
