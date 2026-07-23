"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  weight: string;
  shelfLife: string;
  badge: string | null;
  isPackaged: boolean;
  cat: string;
};

export type CatalogCategory = { slug: string; name: string; count: number };

const BADGE_TEXT: Record<string, string> = {
  NEW: "YANGI",
  HIT: "XIT",
  SUGAR_FREE: "SHAKARSIZ",
};

/** Filtrlanadigan mahsulot katalogi — tab + qidiruv + kategoriya chiplari */
export function ProductCatalog({
  products,
  categories,
  labels,
}: {
  products: CatalogProduct[];
  categories: CatalogCategory[];
  labels: {
    tabKg: string;
    tabPack: string;
    searchPlaceholder: string;
    countSuffix: string;
    moreLabel: string;
    allChip: string;
    emptyEmoji: string;
    emptyTitle: string;
  };
}) {
  const [tab, setTab] = useState<"kg" | "pack">("kg");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(16);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (tab === "kg" && p.isPackaged) return false;
      if (tab === "pack" && !p.isPackaged) return false;
      if (cat !== "all" && p.cat !== cat) return false;
      if (needle && !p.name.toLowerCase().includes(needle) && !p.description.toLowerCase().includes(needle))
        return false;
      return true;
    });
  }, [products, tab, cat, q]);

  const catCount = (slug: string) =>
    products.filter(
      (p) => (tab === "kg" ? !p.isPackaged : p.isPackaged) && (slug === "all" || p.cat === slug),
    ).length;

  const chip = (active: boolean): React.CSSProperties => ({
    border: `1px solid ${active ? "var(--sfad-red)" : "var(--line)"}`,
    background: active ? "var(--sfad-red)" : "var(--white)",
    color: active ? "#fff" : "var(--ink)",
    font: "500 14px var(--font-manrope), Manrope, sans-serif",
    padding: "10px 18px",
    borderRadius: 999,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all .3s var(--ease-out)",
    transform: active ? "scale(1.04)" : "none",
  });

  return (
    <>
      {/* Boshqaruv paneli */}
      <div
        style={{
          position: "sticky",
          top: 76,
          zIndex: 40,
          background: "rgba(255,255,255,.9)",
          backdropFilter: "blur(12px)",
          borderBlock: "1px solid var(--line)",
          padding: "16px 0",
          marginBottom: 40,
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 22 }}>
              {(
                [
                  ["kg", labels.tabKg],
                  ["pack", labels.tabPack],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => {
                    setTab(k);
                    setShown(16);
                  }}
                  style={{
                    border: 0,
                    background: "none",
                    cursor: "pointer",
                    font: "600 15px var(--font-manrope), Manrope, sans-serif",
                    color: tab === k ? "var(--ink)" : "var(--muted)",
                    borderBottom: `2px solid ${tab === k ? "var(--sfad-red)" : "transparent"}`,
                    padding: "6px 2px",
                    transition: "color .3s, border-color .3s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShown(16);
              }}
              placeholder={labels.searchPlaceholder}
              style={{
                flex: "1 1 220px",
                maxWidth: 320,
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "12px 16px",
                font: "400 15px var(--font-manrope), Manrope, sans-serif",
                outline: "none",
              }}
            />

            <span style={{ fontSize: 14.5, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {filtered.length} {labels.countSuffix}
            </span>
          </div>

          <div
            id="cat-chips"
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}
          >
            <button onClick={() => setCat("all")} style={chip(cat === "all")}>
              {labels.allChip} ({catCount("all")})
            </button>
            {categories.map((c) => (
              <button key={c.slug} onClick={() => setCat(c.slug)} style={chip(cat === c.slug)}>
                {c.name} ({catCount(c.slug)})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 44 }}>{labels.emptyEmoji}</div>
            <p style={{ marginTop: 14, fontSize: 17, color: "var(--muted)" }}>
              {labels.emptyTitle}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                gap: 24,
              }}
            >
              {filtered.slice(0, shown).map((p) => (
                <article
                  key={p.id}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: "0 2px 10px rgba(29,29,29,.05)",
                    transition: "transform .45s var(--ease-out), box-shadow .45s var(--ease-out)",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1/1",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "radial-gradient(circle at 50% 40%, #FBF8F2, #F0E9DE)",
                      marginBottom: 16,
                    }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 700px) 50vw, 250px"
                      style={{ objectFit: "contain", padding: 14 }}
                      unoptimized
                    />
                    {p.badge && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          insetInlineStart: 10,
                          borderRadius: 99,
                          padding: "4px 10px",
                          font: "800 10px var(--font-manrope), Manrope, sans-serif",
                          color: p.badge === "SUGAR_FREE" ? "#8F6E28" : "#fff",
                          background:
                            p.badge === "NEW"
                              ? "var(--sfad-red)"
                              : p.badge === "HIT"
                                ? "var(--sfad-gold)"
                                : "transparent",
                          border: p.badge === "SUGAR_FREE" ? "1.5px solid #C9A24B" : "0",
                        }}
                      >
                        {BADGE_TEXT[p.badge]}
                      </span>
                    )}
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontWeight: 600,
                      fontSize: 17,
                    }}
                  >
                    {p.name}
                  </h3>
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 13.5,
                      color: "var(--muted)",
                      lineHeight: 1.55,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {[p.shelfLife, p.weight].filter(Boolean).map((v) => (
                      <span
                        key={v}
                        style={{
                          borderRadius: 8,
                          background: "rgba(201,162,75,.12)",
                          color: "#8F6E28",
                          fontSize: 12,
                          padding: "4px 9px",
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            {shown < filtered.length && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button
                  onClick={() => setShown((s) => s + 12)}
                  style={{
                    border: "1.5px solid var(--ink)",
                    background: "transparent",
                    color: "var(--ink)",
                    borderRadius: 99,
                    padding: "14px 32px",
                    font: "600 15px var(--font-manrope), Manrope, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {labels.moreLabel}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
