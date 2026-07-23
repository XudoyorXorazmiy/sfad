"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LangTabs, LocField } from "@/components/admin/lang-tabs";
import { ImagePicker } from "@/components/admin/image-picker";
import { LOCALES } from "@/lib/i18n";
import { updateBlockData } from "../../actions";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type JsonObj = { [k: string]: Json };

const FIELD_LABELS: Record<string, string> = {
  kicker: "Kicker (ustki yozuv)", title: "Sarlavha", sub: "Sub-matn", text: "Matn",
  eyebrow: "Eyebrow", label: "Yorliq", url: "Havola (URL)", value: "Qiymat",
  image: "Rasm", photo: "Foto", poster: "Poster", videoUrl: "Video URL",
  items: "Elementlar", steps: "Qadamlar", cta: "CTA tugma", cta1: "CTA 1",
  cta2: "CTA 2", btn: "Tugma", name: "Nom", role: "Lavozim", year: "Yil",
  num: "Raqam", icon: "Ikonka", q: "Savol", a: "Javob", accent: "Aksent so'z",
  breadcrumb: "Breadcrumb", success: "Muvaffaqiyat matni", flag: "Bayroq",
  watchLabel: "Video tugma yozuvi", allLabel: "«Hammasi» yozuvi",
  moreLabel: "«Yana» yozuvi", addrLabel: "Manzil yozuvi", highlightWords: "Ajratiladigan so'zlar",
};

function isLoc(v: Json): v is JsonObj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length > 0 && keys.every((k) => (LOCALES as readonly string[]).includes(k));
}

function isImageKey(k: string) {
  return /image|photo|poster|ogimage|cover/i.test(k);
}

/** Massivga yangi element: birinchi element strukturasi bo'shatiladi */
function blankOf(v: Json): Json {
  if (typeof v === "string") return "";
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return [];
  if (typeof v === "object" && v !== null) {
    const o: JsonObj = {};
    for (const [k, val] of Object.entries(v)) o[k] = blankOf(val);
    return o;
  }
  return null;
}

function Field({
  k, value, onChange, depth,
}: {
  k: string; value: Json; onChange: (v: Json) => void; depth: number;
}) {
  const label = FIELD_LABELS[k] ?? k;

  if (isLoc(value)) {
    const loc = value as JsonObj;
    const anyLong = Object.values(loc).some((s) => typeof s === "string" && s.length > 70);
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <LocField
          render={(l) =>
            anyLong ? (
              <Textarea
                value={(loc[l] as string) ?? ""}
                rows={3}
                onChange={(e) => onChange({ ...loc, [l]: e.target.value })}
                placeholder={l !== "uz" ? "Bo'sh — UZ ishlatiladi" : undefined}
              />
            ) : (
              <Input
                value={(loc[l] as string) ?? ""}
                onChange={(e) => onChange({ ...loc, [l]: e.target.value })}
                placeholder={l !== "uz" ? "Bo'sh — UZ ishlatiladi" : undefined}
              />
            )
          }
        />
      </div>
    );
  }

  if (typeof value === "string") {
    if (isImageKey(k)) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{label}</Label>
          <ImagePicker value={value} onChange={(url) => onChange(url)} />
        </div>
      );
    }
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        {value.length > 80 ? (
          <Textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between text-sm">
        {label}
        <Switch checked={value} onCheckedChange={(v) => onChange(v)} />
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    );
  }

  if (Array.isArray(value)) {
    // oddiy string massiv (masalan highlightWords)
    if (value.every((x) => typeof x === "string")) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{label} (vergul bilan)</Label>
          <Input
            value={(value as string[]).join(", ")}
            onChange={(e) =>
              onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
            }
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">{label}</Label>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onChange([...value, blankOf(value[0] ?? {})])}
          >
            <Plus className="mr-1 h-3 w-3" /> Qo'shish
          </Button>
        </div>
        {value.map((item, i) => (
          <Card key={i} className="border-dashed">
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">
                  #{i + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button" variant="ghost" size="icon-xs" disabled={i === 0}
                    onClick={() => {
                      const next = [...value];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      onChange(next);
                    }}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="icon-xs" disabled={i === value.length - 1}
                    onClick={() => {
                      const next = [...value];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      onChange(next);
                    }}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="icon-xs" className="text-red-500"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Field
                k={`${i}`}
                value={item}
                depth={depth + 1}
                onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as JsonObj;
    return (
      <div className={depth > 0 ? "space-y-3" : "space-y-4"}>
        {depth > 0 && !/^\d+$/.test(k) && (
          <Label className="text-xs font-semibold text-neutral-500">{label}</Label>
        )}
        {Object.entries(obj).map(([ck, cv]) => (
          <Field
            key={ck}
            k={ck}
            value={cv}
            depth={depth + 1}
            onChange={(v) => onChange({ ...obj, [ck]: v })}
          />
        ))}
      </div>
    );
  }

  return null;
}

export function BlockEditor({
  page, blockKey, initialData,
}: {
  page: string; blockKey: string; initialData: JsonObj;
}) {
  const router = useRouter();
  const [data, setData] = useState<JsonObj>(initialData);
  const [pending, startTransition] = useTransition();

  return (
    <LangTabs>
      <Card>
        <CardContent className="space-y-4 pt-5">
          {Object.entries(data).map(([k, v]) => (
            <Field
              key={k}
              k={k}
              value={v}
              depth={0}
              onChange={(nv) => setData((d) => ({ ...d, [k]: nv }))}
            />
          ))}
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-6 py-3 backdrop-blur md:left-60">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/pages/${page}`)}
          >
            Bekor qilish
          </Button>
          <Button
            disabled={pending}
            className="bg-[#C8102E] hover:bg-[#9E0C24]"
            onClick={() =>
              startTransition(async () => {
                const res = await updateBlockData(page, blockKey, data);
                if (res.ok) {
                  toast.success("Saqlandi — sayt yangilandi");
                  router.refresh();
                } else toast.error(res.error);
              })
            }
          >
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </div>
    </LangTabs>
  );
}
