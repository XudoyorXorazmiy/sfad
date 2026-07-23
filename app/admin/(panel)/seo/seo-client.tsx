"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LangTabs, LocField, useLang } from "@/components/admin/lang-tabs";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Loc } from "@/lib/i18n";
import { createRedirect, deleteRedirect, savePageSeo, saveSeoGlobals } from "./actions";

type PageSeoRow = {
  path: string; metaTitle: Loc; metaDesc: Loc; keywords: Loc;
  ogImage: string; canonical: string; noindex: boolean; titleUz: string;
};
type RedirectRow = { id: string; from: string; to: string; code: number };

function CharCount({ value, max }: { value: string; max: number }) {
  const ok = value.length > 0 && value.length <= max;
  return (
    <span className={`text-[11px] ${ok ? "text-emerald-600" : "text-neutral-400"}`}>
      {value.length}/{max}
    </span>
  );
}

/** Google natija + ijtimoiy karta jonli preview */
function SeoPreview({ title, desc, og }: { title: string; desc: string; og: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border p-3">
        <div className="text-[11px] text-neutral-400">sfad.uz</div>
        <div className="truncate text-[15px] text-[#1a0dab]">
          {title || "Meta sarlavha…"}
        </div>
        <div className="line-clamp-2 text-xs text-neutral-600">
          {desc || "Meta tavsif…"}
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <div className="flex h-20 items-center justify-center bg-neutral-100 text-xs text-neutral-400">
          {og ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={og} alt="" className="h-full w-full object-cover" />
          ) : (
            "OG rasm"
          )}
        </div>
        <div className="p-2">
          <div className="truncate text-xs font-semibold">{title || "Sarlavha"}</div>
          <div className="truncate text-[11px] text-neutral-500">{desc || "Tavsif"}</div>
        </div>
      </div>
    </div>
  );
}

function PageSeoForm({ row, onDone }: { row: PageSeoRow; onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState<Loc>(row.metaTitle);
  const [desc, setDesc] = useState<Loc>(row.metaDesc);
  const [og, setOg] = useState(row.ogImage);
  const { lang } = useLang();

  const submit = (fd: FormData) => {
    for (const l of ["uz", "ru", "en", "ar"] as const) {
      fd.set(`metaTitle_${l}`, title[l] ?? "");
      fd.set(`metaDesc_${l}`, desc[l] ?? "");
    }
    fd.set("ogImage", og);
    startTransition(async () => {
      const res = await savePageSeo(row.path, fd);
      if (res.ok) {
        toast.success("SEO saqlandi");
        onDone();
        router.refresh();
      } else toast.error(res.error);
    });
  };

  return (
    <form action={submit} className="grid gap-5 sm:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Meta sarlavha</Label>
            <CharCount value={title[lang] ?? ""} max={60} />
          </div>
          <LocField
            render={(l) => (
              <Input
                value={title[l] ?? ""}
                onChange={(e) => setTitle({ ...title, [l]: e.target.value })}
              />
            )}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Meta tavsif</Label>
            <CharCount value={desc[lang] ?? ""} max={160} />
          </div>
          <LocField
            render={(l) => (
              <Textarea
                rows={3}
                value={desc[l] ?? ""}
                onChange={(e) => setDesc({ ...desc, [l]: e.target.value })}
              />
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Kalit so'zlar</Label>
          <LocField
            render={(l) => (
              <Input name={`keywords_${l}`} defaultValue={row.keywords[l] ?? ""} />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Canonical URL</Label>
            <Input name="canonical" defaultValue={row.canonical} />
          </div>
          <label className="flex items-center justify-between self-end pb-1 text-sm">
            noindex
            <Switch name="noindex" defaultChecked={row.noindex} />
          </label>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">OG rasm</Label>
          <ImagePicker value={og} onChange={setOg} />
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-xs">Jonli ko'rinish</Label>
        <SeoPreview title={title[lang] ?? title.uz ?? ""} desc={desc[lang] ?? desc.uz ?? ""} og={og} />
        <Button type="submit" disabled={pending} className="w-full bg-[#C8102E] hover:bg-[#9E0C24]">
          {pending ? "…" : "Saqlash"}
        </Button>
      </div>
    </form>
  );
}

export function SeoClient({
  pages, redirects, globals, issues,
}: {
  pages: PageSeoRow[];
  redirects: RedirectRow[];
  globals: Record<string, string>;
  issues: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<PageSeoRow | null>(null);

  return (
    <Tabs defaultValue="pages">
      <TabsList>
        <TabsTrigger value="pages">Sahifalar</TabsTrigger>
        <TabsTrigger value="redirects">Redirectlar</TabsTrigger>
        <TabsTrigger value="globals">Global</TabsTrigger>
        <TabsTrigger value="audit">
          Tekshiruv {issues.length > 0 && `(${issues.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pages" className="mt-4">
        <div className="divide-y rounded-lg border bg-white">
          {pages.map((p) => (
            <div key={p.path} className="flex items-center gap-3 px-4 py-2.5">
              <code className="w-32 text-xs text-neutral-500">{p.path}</code>
              <span className="flex-1 truncate text-sm font-medium">{p.titleUz || "—"}</span>
              {p.noindex && <span className="text-xs text-red-500">noindex</span>}
              <Button variant="ghost" size="icon-sm" onClick={() => setEditing(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="redirects" className="mt-4 space-y-4">
        <form
          action={(fd) =>
            startTransition(async () => {
              const res = await createRedirect(fd);
              if (res.ok) { toast.success("Qo'shildi"); router.refresh(); }
              else toast.error(res.error);
            })
          }
          className="flex items-end gap-2 rounded-lg border bg-white p-3"
        >
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Qayerdan</Label>
            <Input name="from" placeholder="/eski-sahifa" required />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Qayerga</Label>
            <Input name="to" placeholder="/yangi-sahifa" required />
          </div>
          <div className="w-24 space-y-1">
            <Label className="text-xs">Kod</Label>
            <select name="code" defaultValue="301" className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm">
              <option value="301">301</option>
              <option value="302">302</option>
            </select>
          </div>
          <Button type="submit" size="sm" disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <div className="divide-y rounded-lg border bg-white">
          {redirects.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <code className="text-xs">{r.from}</code>
              <span className="text-neutral-400">→</span>
              <code className="flex-1 text-xs">{r.to}</code>
              <span className="text-xs text-neutral-400">{r.code}</span>
              <Button
                variant="ghost" size="icon-xs" className="text-red-500"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteRedirect(r.id);
                    if (res.ok) router.refresh();
                    else toast.error(res.error);
                  })
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="globals" className="mt-4">
        <form
          action={(fd) =>
            startTransition(async () => {
              const res = await saveSeoGlobals(fd);
              if (res.ok) { toast.success("Saqlandi"); router.refresh(); }
              else toast.error(res.error);
            })
          }
        >
          <Card>
            <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
              {[
                ["siteName", "Sayt nomi"],
                ["defaultOgImage", "Standart OG rasm URL"],
                ["googleVerification", "Google Search Console kodi"],
                ["yandexVerification", "Yandex verification kodi"],
                ["googleAnalyticsId", "Google Analytics ID"],
                ["yandexMetrikaId", "Yandex Metrika ID"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Input name={key} defaultValue={globals[key] ?? ""} />
                </div>
              ))}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">robots.txt (qo'shimcha qoidalar)</Label>
                <Textarea name="robotsTxt" rows={4} defaultValue={globals.robotsTxt ?? ""} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
                  {pending ? "…" : "Saqlash"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="audit" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SEO tekshiruvi</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-sm text-emerald-600">✓ Muammo topilmadi</p>
            ) : (
              <ul className="space-y-1.5">
                {issues.map((i, n) => (
                  <li key={n} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>SEO: {editing?.path}</DialogTitle>
          </DialogHeader>
          {editing && (
            <LangTabs>
              <PageSeoForm row={editing} onDone={() => setEditing(null)} />
            </LangTabs>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
