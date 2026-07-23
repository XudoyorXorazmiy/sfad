"use client";

import { useEffect, useRef, useState } from "react";

export type Country = {
  id: string;
  name: string;
  flag: string;
  x: number;
  y: number;
};

const RED = "#C8102E";
const GOLD = "#C9A24B";
// world.svg o'lchamlari
const VB = { x: 150, y: 235, w: 762, h: 250 };

/**
 * Interaktiv eksport xaritasi — world.svg ni yuklab, davlatlarni belgilaydi,
 * Toshkentdan har davlatga navbatma-navbat yo'nalish chizadi.
 * Davlatlar bazadan (ExportCountry) keladi.
 */
export function WorldMap({
  countries,
  hub = { x: 669.3, y: 335.6 },
}: {
  countries: Country[];
  hub?: { x: number; y: number };
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  // SVG ni bir marta yuklab, DOM ga joylash
  useEffect(() => {
    let cancelled = false;
    const mount = mountRef.current;
    if (!mount || mount.dataset.built === "1") return;

    (async () => {
      try {
        const text = await (await fetch("/world.svg")).text();
        if (cancelled || !mountRef.current) return;
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("viewBox", `${VB.x} ${VB.y} ${VB.w} ${VB.h}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("style", "width:100%;height:auto;display:block");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        const partnerIds = new Set(countries.map((c) => c.id));
        svg.querySelectorAll("path").forEach((el, i) => {
          const base = i % 2 ? "#FBFCFE" : "#F2F5FB";
          (el as SVGPathElement).style.fill = base;
          (el as SVGPathElement).style.stroke = "rgba(200,16,46,.22)";
          (el as SVGPathElement).style.strokeWidth = "0.5";
          (el as SVGPathElement).dataset.base = base;
          if (partnerIds.has(el.id)) el.classList.add("sfad-partner");
        });
        const uz = svg.getElementById("UZ") as SVGPathElement | null;
        if (uz) {
          uz.style.fill = RED;
          uz.dataset.base = RED;
        }

        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(svg);
        mountRef.current.dataset.built = "1";
        setReady(true);
      } catch {
        /* xarita yuklanmasa — chiplar baribir ko'rinadi */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [countries]);

  // Faol davlatni belgilash + yo'nalish chizig'i
  useEffect(() => {
    if (!ready || countries.length === 0) return;
    const svg = mountRef.current?.querySelector("svg");
    if (!svg) return;

    svg.querySelectorAll(".sfad-partner").forEach((el) => {
      const p = el as SVGPathElement;
      p.style.fill = p.dataset.base ?? "#F2F5FB";
    });
    const cur = countries[active];
    const el = svg.getElementById(cur.id) as SVGPathElement | null;
    if (el) el.style.fill = GOLD;

    const NS = "http://www.w3.org/2000/svg";
    svg.querySelector("#sfad-overlay")?.remove();
    const g = document.createElementNS(NS, "g");
    g.id = "sfad-overlay";

    const dx = cur.x - hub.x;
    const dy = cur.y - hub.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const cx = (hub.x + cur.x) / 2 - dy * 0.15;
    const cy = (hub.y + cur.y) / 2 - dx * 0.15 - dr * 0.15;
    const arc = document.createElementNS(NS, "path");
    arc.setAttribute("d", `M ${hub.x} ${hub.y} Q ${cx} ${cy} ${cur.x} ${cur.y}`);
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "#3A3F52");
    arc.setAttribute("stroke-width", "1.1");
    arc.setAttribute("stroke-dasharray", "4 6");
    arc.setAttribute("stroke-linecap", "round");
    arc.style.animation = "dashFlow 1s linear infinite";
    g.appendChild(arc);

    const hubG = document.createElementNS(NS, "g");
    hubG.setAttribute("transform", `translate(${hub.x},${hub.y})`);
    hubG.innerHTML = `
      <circle r="5" fill="none" stroke="${RED}" stroke-width="1"
        style="animation:pulseRing 2.4s ease-out infinite;transform-origin:center;transform-box:fill-box"></circle>
      <circle r="2.5" fill="#fff" stroke="${RED}" stroke-width="1.4"></circle>
      <text y="-8" text-anchor="middle"
        style="font:700 7px Manrope,sans-serif;fill:${RED};paint-order:stroke;stroke:#fff;stroke-width:2.2px;stroke-linejoin:round">Toshkent</text>`;
    g.appendChild(hubG);

    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", String(cur.x));
    dot.setAttribute("cy", String(cur.y));
    dot.setAttribute("r", "2.6");
    dot.setAttribute("fill", RED);
    g.appendChild(dot);

    svg.appendChild(g);
  }, [active, ready, countries, hub]);

  // Avto-aylanish
  useEffect(() => {
    if (countries.length === 0) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % countries.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [countries.length]);

  return (
    <div>
      <div
        ref={mountRef}
        data-reveal="1"
        style={{ position: "relative", width: "100%", minHeight: 220 }}
      >
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>…</div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginTop: 28,
        }}
      >
        {countries.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(i)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${i === active ? "var(--sfad-red)" : "var(--line)"}`,
              background: i === active ? "var(--sfad-red)" : "var(--white)",
              color: i === active ? "#fff" : "var(--ink)",
              font: "500 14px var(--font-manrope), Manrope, sans-serif",
              padding: "10px 18px",
              borderRadius: 999,
              cursor: "pointer",
              transition: "all .3s var(--ease-out)",
            }}
          >
            <span>{c.flag}</span>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
