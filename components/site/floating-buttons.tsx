"use client";

import { useEffect, useState } from "react";

/** Scroll-to-top (progress halqali) + tezkor aloqa FAB */
export function FloatingButtons({
  phoneRaw,
  telegram,
}: {
  phoneRaw: string;
  telegram: string;
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setVisible(y > 600);
      setProgress(max > 0 ? y / max : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 21;
  const C = 2 * Math.PI * R;

  return (
    <>
      {/* Tezkor aloqa — chap past */}
      <div
        style={{
          position: "fixed",
          insetInlineStart: 24,
          bottom: 24,
          zIndex: 72,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          aria-label="Tezkor aloqa"
          onClick={() => setFabOpen((v) => !v)}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: 0,
            cursor: "pointer",
            background: "var(--sfad-red)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(200,16,46,.3)",
            transform: fabOpen ? "rotate(90deg)" : "none",
            transition: "transform .4s var(--ease-spring)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>

        {[
          { href: `tel:${phoneRaw}`, label: "☎", title: "Qo'ng'iroq" },
          ...(telegram ? [{ href: telegram, label: "✈", title: "Telegram" }] : []),
        ].map((b, i) => (
          <a
            key={b.title}
            href={b.href}
            target={b.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            title={b.title}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontSize: 17,
              color: "var(--ink)",
              boxShadow: "0 6px 18px rgba(29,29,29,.16)",
              opacity: fabOpen ? 1 : 0,
              transform: fabOpen ? "scale(1)" : "scale(.4)",
              pointerEvents: fabOpen ? "auto" : "none",
              transition: `opacity .3s, transform .35s var(--ease-spring) ${i * 60}ms`,
            }}
          >
            {b.label}
          </a>
        ))}
      </div>

      {/* Tepaga — o'ng past */}
      <button
        aria-label="Tepaga"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: "fixed",
          insetInlineEnd: 24,
          bottom: 24,
          zIndex: 72,
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: 0,
          cursor: "pointer",
          background: "#fff",
          boxShadow: "0 6px 20px rgba(29,29,29,.14)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(.7)",
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity .35s, transform .35s var(--ease-out)",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
        >
          <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(0,0,0,.07)" strokeWidth="2" />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke="var(--sfad-red)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        <span style={{ position: "relative", fontSize: 16, color: "var(--ink)" }}>↑</span>
      </button>
    </>
  );
}
