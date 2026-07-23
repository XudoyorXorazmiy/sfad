"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LangTabs, LocField } from "@/components/admin/lang-tabs";
import { ImagePicker } from "@/components/admin/image-picker";
import { LOCALES, type Loc } from "@/lib/i18n";
import { saveSettings } from "./actions";

type Values = Record<string, unknown>;

const TEXT_FIELDS: { key: string; label: string; group: string }[] = [
  { key: "phone", label: "Telefon (ko'rinadigan)", group: "Kontaktlar" },
  { key: "phoneRaw", label: "Telefon (tel: uchun)", group: "Kontaktlar" },
  { key: "email", label: "Email", group: "Kontaktlar" },
  { key: "mapCoords", label: "Xarita koordinatasi (lat,lng)", group: "Kontaktlar" },
  { key: "instagram", label: "Instagram", group: "Ijtimoiy tarmoqlar" },
  { key: "facebook", label: "Facebook", group: "Ijtimoiy tarmoqlar" },
  { key: "telegram", label: "Telegram", group: "Ijtimoiy tarmoqlar" },
  { key: "linkedin", label: "LinkedIn", group: "Ijtimoiy tarmoqlar" },
  { key: "catalogPdf", label: "Katalog PDF (URL)", group: "Fayllar" },
];

const LOC_FIELDS: { key: string; label: string; group: string }[] = [
  { key: "address", label: "Manzil", group: "Kontaktlar" },
  { key: "workHours", label: "Ish vaqti", group: "Kontaktlar" },
  { key: "footerTag", label: "Footer shiori", group: "Footer" },
  { key: "footerRights", label: "Footer huquqlar qatori", group: "Footer" },
];

export function SettingsClient({ initial }: { initial: Values }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [pending, startTransition] = useTransition();

  const groups = [...new Set([...TEXT_FIELDS, ...LOC_FIELDS].map((f) => f.group))];
  const activeLocales = (values.activeLocales as string[]) ?? ["uz"];

  const save = () =>
    startTransition(async () => {
      const res = await saveSettings(
        Object.entries(values).map(([key, value]) => ({ key, value })),
      );
      if (res.ok) {
        toast.success("Sozlamalar saqlandi");
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <LangTabs>
      <div className="grid gap-5 pb-20 lg:grid-cols-2">
        {groups.map((g) => (
          <Card key={g}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{g}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEXT_FIELDS.filter((f) => f.group === g).map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    value={(values[f.key] as string) ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              {LOC_FIELDS.filter((f) => f.group === g).map((f) => {
                const loc = (values[f.key] as Loc) ?? {};
                return (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-xs">{f.label}</Label>
                    <LocField
                      render={(l) => (
                        <Input
                          value={loc[l] ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({
                              ...v,
                              [f.key]: { ...loc, [l]: e.target.value },
                            }))
                          }
                        />
                      )}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Logotiplar</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Asosiy (rangli)</Label>
              <ImagePicker
                value={(values.logoColor as string) ?? ""}
                onChange={(url) => setValues((v) => ({ ...v, logoColor: url }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Oq versiya (footer)</Label>
              <ImagePicker
                value={(values.logoWhite as string) ?? ""}
                onChange={(url) => setValues((v) => ({ ...v, logoWhite: url }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tizim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Faol tillar</Label>
              <div className="flex gap-3">
                {LOCALES.map((l) => (
                  <label key={l} className="flex items-center gap-1.5 text-sm uppercase">
                    <input
                      type="checkbox"
                      disabled={l === "uz"}
                      checked={activeLocales.includes(l)}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          activeLocales: e.target.checked
                            ? [...activeLocales, l]
                            : activeLocales.filter((x) => x !== l),
                        }))
                      }
                    />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between text-sm">
              <span>
                Texnik ishlar rejimi
                <span className="block text-xs text-neutral-400">
                  Sayt vaqtincha yopiladi (admin ochiq qoladi)
                </span>
              </span>
              <Switch
                checked={Boolean(values.maintenanceMode)}
                onCheckedChange={(v) =>
                  setValues((s) => ({ ...s, maintenanceMode: v }))
                }
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 px-6 py-3 backdrop-blur md:left-60">
        <div className="flex justify-end">
          <Button onClick={save} disabled={pending} className="bg-[#C8102E] hover:bg-[#9E0C24]">
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </Button>
        </div>
      </div>
    </LangTabs>
  );
}
