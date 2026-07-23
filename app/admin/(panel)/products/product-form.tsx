"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LangTabs, LocField } from "@/components/admin/lang-tabs";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Loc } from "@/lib/i18n";
import { createProduct, updateProduct } from "./actions";

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: Loc;
  image: string;
  gallery: string[];
  categoryId: string | null;
  shelfLife: string;
  weight: string;
  packaging: string;
  badge: string | null;
  isPackaged: boolean;
  isFeatured: boolean;
  status: string;
};

function slugify(s: string) {
  const t: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh",
    щ: "sch", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => t[c] ?? c)
    .join("")
    .replace(/['ʼ`’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormData | null;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [image, setImage] = useState(initial?.image ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  // saqlanmagan o'zgarishda ogohlantirish
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const res = initial?.id
        ? await updateProduct(initial.id, formData)
        : await createProduct(formData);
      if (res.ok) {
        toast.success("Saqlandi");
        setDirty(false);
        router.push("/admin/products");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <form
      ref={formRef}
      action={submit}
      onChange={() => setDirty(true)}
      className="space-y-5 pb-20"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Chap ustun */}
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom <span className="text-neutral-400">(brend, tarjimasiz)</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={initial?.name ?? ""}
                    required
                    onChange={(e) => {
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    required
                  />
                </div>
              </div>

              <LangTabs>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <LocField
                    render={(l) => (
                      <Textarea
                        name={`description_${l}`}
                        defaultValue={initial?.description?.[l] ?? ""}
                        rows={3}
                        placeholder={l === "uz" ? "Mahsulot tavsifi…" : `Tavsif (${l.toUpperCase()}) — bo'sh bo'lsa UZ ishlatiladi`}
                      />
                    )}
                  />
                </div>
              </LangTabs>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="weight">Massa</Label>
                  <Input id="weight" name="weight" defaultValue={initial?.weight ?? ""} placeholder="3 kg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shelfLife">Saqlash muddati</Label>
                  <Input id="shelfLife" name="shelfLife" defaultValue={initial?.shelfLife ?? "12 oy"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packaging">Qadoqlash</Label>
                  <Input id="packaging" name="packaging" defaultValue={initial?.packaging ?? ""} placeholder="Vaznda / Karobka" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Galereya (har qatorda bitta URL)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="gallery"
                defaultValue={(initial?.gallery ?? []).join("\n")}
                rows={3}
                placeholder="https://…"
              />
            </CardContent>
          </Card>
        </div>

        {/* O'ng panel */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Holat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Nashr holati</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={initial?.status ?? "PUBLISHED"}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
                >
                  <option value="PUBLISHED">Nashrda</option>
                  <option value="DRAFT">Qoralama</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategoriya</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={initial?.categoryId ?? ""}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
                >
                  <option value="">— Tanlanmagan —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <select
                  id="badge"
                  name="badge"
                  defaultValue={initial?.badge ?? ""}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
                >
                  <option value="">Yo'q</option>
                  <option value="NEW">YANGI</option>
                  <option value="HIT">XIT</option>
                  <option value="SUGAR_FREE">SHAKARSIZ</option>
                </select>
              </div>
              <label className="flex items-center justify-between text-sm">
                Qadoqlangan (dona)
                <Switch name="isPackaged" defaultChecked={initial?.isPackaged ?? false} />
              </label>
              <label className="flex items-center justify-between text-sm">
                Bosh sahifada ko'rsatish
                <Switch name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Asosiy rasm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ImagePicker
                value={image}
                onChange={(url) => {
                  setImage(url);
                  setDirty(true);
                }}
                folder="products"
              />
              <input type="hidden" name="image" value={image} required />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Yopishgan pastki panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-6 py-3 backdrop-blur md:left-60">
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <span className="mr-auto text-xs text-amber-600">
              Saqlanmagan o'zgarishlar bor
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-[#C8102E] hover:bg-[#9E0C24]"
          >
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </div>
    </form>
  );
}
