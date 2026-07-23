"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Copy, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { checkMediaUsage, deleteMedia, updateMediaAlt } from "./actions";

type Item = {
  id: string; url: string; filename: string; mimeType: string; size: number;
  width: number | null; height: number | null; alt: string; folder: string;
};

const FOLDERS = [
  { key: "", label: "Barchasi" },
  { key: "products", label: "Mahsulotlar" },
  { key: "news", label: "Yangiliklar" },
  { key: "pages", label: "Sahifalar" },
];

export function MediaClient({ items }: { items: Item[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Item | null>(null);
  const [usage, setUsage] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const folder = sp.get("folder") ?? "";

  const upload = async (files: FileList | File[]) => {
    setUploading(true);
    let okCount = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder || "pages");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) okCount++;
      else toast.error(`${file.name}: ${json.error}`);
    }
    setUploading(false);
    if (okCount) {
      toast.success(`${okCount} ta fayl yuklandi`);
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                const next = new URLSearchParams(sp.toString());
                if (f.key) next.set("folder", f.key);
                else next.delete("folder");
                router.replace(`/admin/media?${next}`);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                folder === f.key
                  ? "border-[#C8102E] bg-[#C8102E] text-white"
                  : "border-neutral-200 bg-white text-neutral-600",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="ml-auto bg-[#C8102E] hover:bg-[#9E0C24]"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          {uploading ? "Yuklanmoqda…" : "Fayl yuklash"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        className={cn(
          "grid grid-cols-3 gap-3 rounded-lg border-2 border-dashed p-4 transition-colors sm:grid-cols-4 lg:grid-cols-6",
          dragOver ? "border-[#C8102E] bg-red-50" : "border-transparent",
        )}
      >
        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-neutral-400">
            Fayllar yo'q — bu yerga sudrab tashlang yoki «Fayl yuklash»
          </div>
        )}
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => { setSelected(m); setUsage(null); }}
            className="group overflow-hidden rounded-lg border bg-white text-left"
          >
            <div className="relative aspect-square bg-neutral-50">
              {m.mimeType.startsWith("image/") ? (
                <Image
                  src={m.url}
                  alt={m.alt}
                  fill
                  sizes="150px"
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FileText className="h-8 w-8 text-neutral-300" />
                </div>
              )}
            </div>
            <div className="truncate border-t px-2 py-1.5 text-[11px] text-neutral-500">
              {m.filename}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate text-base">{selected.filename}</DialogTitle>
                <DialogDescription>
                  {selected.mimeType} · {(selected.size / 1024).toFixed(0)} KB
                  {selected.width ? ` · ${selected.width}×${selected.height}` : ""}
                </DialogDescription>
              </DialogHeader>
              {selected.mimeType.startsWith("image/") && (
                <div className="relative mx-auto h-44 w-full bg-neutral-50">
                  <Image src={selected.url} alt="" fill sizes="400px" className="object-contain" unoptimized />
                </div>
              )}
              <form
                action={(fd) =>
                  startTransition(async () => {
                    const res = await updateMediaAlt(selected.id, (fd.get("alt") as string) ?? "");
                    if (res.ok) { toast.success("Alt saqlandi"); router.refresh(); }
                    else toast.error(res.error);
                  })
                }
                className="flex items-end gap-2"
              >
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="alt">Alt matn</Label>
                  <Input id="alt" name="alt" defaultValue={selected.alt} />
                </div>
                <Button type="submit" variant="outline" size="sm" disabled={pending}>
                  Saqlash
                </Button>
              </form>
              {usage && usage.length > 0 && (
                <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                  <b>Ishlatilmoqda:</b>
                  <ul className="mt-1 list-inside list-disc">
                    {usage.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              )}
              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selected.url.startsWith("http")
                        ? selected.url
                        : window.location.origin + selected.url,
                    );
                    toast.success("URL nusxalandi");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> URL nusxalash
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const u = await checkMediaUsage(selected.url);
                      if (u.length > 0 && usage === null) {
                        setUsage(u);
                        toast.warning("Fayl ishlatilmoqda! O'chirish uchun yana bosing.");
                        return;
                      }
                      const res = await deleteMedia(selected.id);
                      if (res.ok) {
                        toast.success("O'chirildi");
                        setSelected(null);
                        router.refresh();
                      } else toast.error(res.error);
                    })
                  }
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> O'chirish
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
