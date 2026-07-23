"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ProductFilters({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`/admin/products?${next}`);
  };

  // qidiruv debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) set("q", q || null);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
      active
        ? "border-[#C8102E] bg-[#C8102E] text-white"
        : "border-neutral-200 bg-white text-neutral-600 hover:border-[#C8102E] hover:text-[#C8102E]",
    );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidirish…"
          className="h-8 w-52 pl-8"
        />
      </div>

      <div className="flex gap-1.5">
        <button className={chip(!sp.get("tab"))} onClick={() => set("tab", null)}>
          Hammasi
        </button>
        <button className={chip(sp.get("tab") === "kg")} onClick={() => set("tab", "kg")}>
          Kilogramm
        </button>
        <button className={chip(sp.get("tab") === "pack")} onClick={() => set("tab", "pack")}>
          Qadoqlangan
        </button>
      </div>

      <div className="h-5 w-px bg-neutral-200" />

      <div className="flex flex-wrap gap-1.5">
        <button className={chip(!sp.get("cat"))} onClick={() => set("cat", null)}>
          Barcha kategoriya
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            className={chip(sp.get("cat") === c.slug)}
            onClick={() => set("cat", c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-neutral-200" />

      <div className="flex gap-1.5">
        <button className={chip(!sp.get("status"))} onClick={() => set("status", null)}>
          Barcha holat
        </button>
        <button
          className={chip(sp.get("status") === "PUBLISHED")}
          onClick={() => set("status", "PUBLISHED")}
        >
          Nashrda
        </button>
        <button
          className={chip(sp.get("status") === "DRAFT")}
          onClick={() => set("status", "DRAFT")}
        >
          Qoralama
        </button>
      </div>
    </div>
  );
}
