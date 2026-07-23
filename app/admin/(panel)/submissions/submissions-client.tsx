"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  exportSubmissionsCsv, setSubmissionNote, setSubmissionStatus,
} from "./actions";

type Sub = {
  id: string;
  type: string;
  data: Record<string, string>;
  status: string;
  note: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  PARTNER: "Hamkorlik", AGENT: "Agent", VACANCY: "Vakansiya",
  CONTACT: "Aloqa", PRODUCT_INQUIRY: "Mahsulot",
};
const STATUSES = [
  { key: "NEW", label: "Yangi", cls: "bg-[#C8102E] text-white" },
  { key: "IN_PROGRESS", label: "Jarayonda", cls: "bg-amber-500 text-white" },
  { key: "DONE", label: "Bajarildi", cls: "bg-emerald-600 text-white" },
  { key: "SPAM", label: "Spam", cls: "bg-neutral-400 text-white" },
];
const FIELD_LABELS: Record<string, string> = {
  name: "Ism", phone: "Telefon", email: "Email", company: "Kompaniya",
  role: "Lavozim", message: "Xabar", region: "Hudud", city: "Shahar",
  experience: "Tajriba", source: "Manba", note: "Izoh", appeal: "Murojaat",
  product: "Mahsulot", position: "Lavozim",
};

export function SubmissionsClient({ items }: { items: Sub[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState<Sub | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const csv = () =>
    startTransition(async () => {
      const text = await exportSubmissionsCsv([...checked]);
      const blob = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sfad-arizalar-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {checked.size ? `${checked.size} ta tanlandi` : `${items.length} ta ariza`}
        </span>
        <Button variant="outline" size="sm" onClick={csv} disabled={pending}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {checked.size ? "Tanlanganlarni CSV" : "Hammasini CSV"}
        </Button>
      </div>

      <div className="divide-y rounded-lg border bg-white">
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-400">Arizalar yo'q</p>
        )}
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
            <input
              type="checkbox"
              checked={checked.has(s.id)}
              onChange={(e) => {
                const next = new Set(checked);
                if (e.target.checked) next.add(s.id);
                else next.delete(s.id);
                setChecked(next);
              }}
            />
            <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setOpen(s)}>
              <Badge variant="outline">{TYPE_LABELS[s.type] ?? s.type}</Badge>
              <span className={cn("text-sm font-medium", s.status === "NEW" && "font-bold")}>
                {s.data.name ?? s.data.email ?? "—"}
              </span>
              <span className="text-sm text-neutral-500">{s.data.phone ?? ""}</span>
              <span className="ml-auto text-xs text-neutral-400">
                {new Date(s.createdAt).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </button>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                STATUSES.find((x) => x.key === s.status)?.cls,
              )}
            >
              {STATUSES.find((x) => x.key === s.status)?.label}
            </span>
          </div>
        ))}
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {TYPE_LABELS[open.type]} — {open.data.name ?? ""}
                </DialogTitle>
              </DialogHeader>
              <dl className="space-y-2 text-sm">
                {Object.entries(open.data).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
                    <dt className="text-neutral-400">{FIELD_LABELS[k] ?? k}</dt>
                    <dd className="font-medium">
                      {k === "phone" ? (
                        <a href={`tel:${v}`} className="text-[#C8102E]">{v}</a>
                      ) : k === "email" ? (
                        <a href={`mailto:${v}`} className="text-[#C8102E]">{v}</a>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st.key}
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await setSubmissionStatus(open.id, st.key as never);
                        if (res.ok) {
                          setOpen({ ...open, status: st.key });
                          router.refresh();
                        } else toast.error(res.error);
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      open.status === st.key ? st.cls : "bg-white text-neutral-600",
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
              <form
                action={(fd) =>
                  startTransition(async () => {
                    const res = await setSubmissionNote(open.id, (fd.get("note") as string) ?? "");
                    if (res.ok) { toast.success("Izoh saqlandi"); router.refresh(); }
                    else toast.error(res.error);
                  })
                }
                className="space-y-2"
              >
                <Textarea name="note" defaultValue={open.note} rows={2} placeholder="Menejer izohi…" />
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm" disabled={pending}>
                    Izohni saqlash
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
