"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MediaItem = { id: string; url: string; filename: string; mimeType: string };

/**
 * Rasm tanlash: media kutubxonadan tanlash yoki yangi yuklash.
 * value/onChange — tanlangan URL.
 */
export function ImagePicker({
  value,
  onChange,
  folder = "pages",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.ok) {
      onChange(json.media.url);
      setOpen(false);
      toast.success("Yuklandi");
    } else toast.error(json.error);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-lg border bg-neutral-50">
          <Image src={value} alt="" fill sizes="128px" className="object-contain" unoptimized />
        </div>
      ) : (
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed">
          <ImageIcon className="h-8 w-8 text-neutral-300" />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(true)}>
          Kutubxonadan
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1 h-3.5 w-3.5" />
          {uploading ? "…" : "Yuklash"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="yoki URL kiriting…"
        className="text-xs"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media kutubxona</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-5">
            {loading && <p className="col-span-full py-8 text-center text-sm text-neutral-400">Yuklanmoqda…</p>}
            {!loading && items.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-neutral-400">Kutubxona bo'sh</p>
            )}
            {items
              .filter((m) => m.mimeType.startsWith("image/"))
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.url); setOpen(false); }}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border bg-neutral-50 hover:ring-2 hover:ring-[#C8102E]",
                    value === m.url && "ring-2 ring-[#C8102E]",
                  )}
                >
                  <Image src={m.url} alt={m.filename} fill sizes="120px" className="object-contain p-1" unoptimized />
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
