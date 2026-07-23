"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LangTabs, LocField, useLang } from "@/components/admin/lang-tabs";
import { ImagePicker } from "@/components/admin/image-picker";
import { RichEditor } from "@/components/admin/rich-editor";
import type { Loc } from "@/lib/i18n";
import { createArticle, updateArticle } from "./actions";

export type ArticleFormData = {
  id?: string;
  slug: string;
  title: Loc;
  excerpt: Loc;
  content: Loc;
  coverImage: string;
  category: string;
  isFeatured: boolean;
  status: string;
  publishedAt: string; // yyyy-MM-dd
};

function ContentEditor({
  content,
  setContent,
}: {
  content: Loc;
  setContent: (c: Loc) => void;
}) {
  const { lang } = useLang();
  return (
    <RichEditor
      value={content[lang] ?? ""}
      onChange={(html) => setContent({ ...content, [lang]: html })}
    />
  );
}

export function ArticleForm({ initial }: { initial: ArticleFormData | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const [content, setContent] = useState<Loc>(initial?.content ?? {});

  const submit = (formData: FormData) => {
    for (const l of ["uz", "ru", "en", "ar"] as const) {
      formData.set(`content_${l}`, content[l] ?? "");
    }
    formData.set("coverImage", cover);
    startTransition(async () => {
      const res = initial?.id
        ? await updateArticle(initial.id, formData)
        : await createArticle(formData);
      if (res.ok) {
        toast.success("Saqlandi");
        router.push("/admin/news");
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <form action={submit} className="space-y-5 pb-20">
      <LangTabs>
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <Card>
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <LocField
                    render={(l) => (
                      <Input
                        name={`title_${l}`}
                        defaultValue={initial?.title?.[l] ?? ""}
                        required={l === "uz"}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qisqa tavsif (excerpt)</Label>
                  <LocField
                    render={(l) => (
                      <Textarea
                        name={`excerpt_${l}`}
                        defaultValue={initial?.excerpt?.[l] ?? ""}
                        rows={2}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matn</Label>
                  <ContentEditor content={content} setContent={setContent} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nashr</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input name="slug" defaultValue={initial?.slug ?? ""} required pattern="[a-z0-9-]+" />
                </div>
                <div className="space-y-2">
                  <Label>Holat</Label>
                  <select
                    name="status"
                    defaultValue={initial?.status ?? "DRAFT"}
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
                  >
                    <option value="DRAFT">Qoralama</option>
                    <option value="PUBLISHED">Nashrda</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nashr sanasi</Label>
                  <Input
                    type="date"
                    name="publishedAt"
                    defaultValue={initial?.publishedAt ?? ""}
                  />
                  <p className="text-xs text-neutral-400">
                    Kelajak sanasi — rejalashtirish
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Kategoriya</Label>
                  <select
                    name="category"
                    defaultValue={initial?.category ?? ""}
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm"
                  >
                    <option value="">—</option>
                    <option value="Eksport">Eksport</option>
                    <option value="Kompaniya">Kompaniya</option>
                    <option value="Yangi mahsulotlar">Yangi mahsulotlar</option>
                  </select>
                </div>
                <label className="flex items-center justify-between text-sm">
                  Featured (katta karta)
                  <Switch name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Muqova rasmi</CardTitle>
              </CardHeader>
              <CardContent>
                <ImagePicker value={cover} onChange={setCover} folder="news" />
              </CardContent>
            </Card>
          </div>
        </div>
      </LangTabs>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-6 py-3 backdrop-blur md:left-60">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/news")}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </div>
    </form>
  );
}
