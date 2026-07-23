"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n";

export type MenuLink = { id: string; label: string; url: string };

export function SiteHeader({
  menu,
  logo,
  phone,
  phoneRaw,
  catalogLabel,
  locale,
}: {
  menu: MenuLink[];
  logo: string;
  phone: string;
  phoneRaw: string;
  catalogLabel: string;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const withLocale = (url: string) => {
    if (!url.startsWith("/")) return url;
    return locale === "uz" ? url : `/${locale}${url === "/" ? "" : url}`;
  };

  // Til almashtirish: joriy yo'lni saqlab, prefiksni almashtiradi
  const localeHref = (l: Locale) => {
    let base = pathname;
    for (const x of LOCALES) {
      if (x !== "uz" && (base === `/${x}` || base.startsWith(`/${x}/`))) {
        base = base.slice(x.length + 1) || "/";
        break;
      }
    }
    return l === "uz" ? base : `/${l}${base === "/" ? "" : base}`;
  };

  const isActive = (url: string) => {
    const full = withLocale(url).split("#")[0];
    return full !== "/" && pathname.startsWith(full);
  };

  return (
    <>
      <header
        id="site-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 70,
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          borderBottom: "1px solid var(--line)",
          transition: "transform .45s var(--ease-out), height .3s var(--ease-out)",
        }}
      >
        <div
          className="sfad-header-inner"
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 28,
            padding: "0 28px",
            height: 76,
            transition: "height .3s var(--ease-out)",
          }}
        >
          <Link
            href={withLocale("/")}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo || "/uploads/sfad-rang.png"}
              alt="SFAD"
              height={44}
              style={{ display: "block", height: 44, width: "auto" }}
            />
          </Link>

          <nav
            id="header-nav"
            style={{
              display: "flex",
              gap: 26,
              fontSize: 14.5,
              fontWeight: 600,
              marginInlineStart: 8,
            }}
          >
            {menu.map((m) => (
              <Link
                key={m.id}
                href={withLocale(m.url)}
                style={{
                  color: isActive(m.url) ? "var(--sfad-red)" : "var(--ink)",
                  textDecoration: "none",
                  transition: "color .3s",
                }}
              >
                {m.label}
              </Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          <div
            id="lang-switch"
            style={{
              display: "flex",
              gap: 2,
              border: "1px solid var(--line)",
              borderRadius: 99,
              padding: 3,
            }}
          >
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={localeHref(l)}
                style={{
                  font: "600 12px Manrope, sans-serif",
                  padding: "6px 10px",
                  borderRadius: 99,
                  textDecoration: "none",
                  background: l === locale ? "var(--ink)" : "none",
                  color: l === locale ? "#fff" : "var(--ink)",
                }}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>

          <a
            href={`tel:${phoneRaw}`}
            className="sfad-header-phone"
            style={{
              fontSize: 14,
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            {phone}
          </a>

          <Link
            href={withLocale("/mahsulotlar")}
            data-magnetic="1"
            data-sheen="1"
            className="sfad-header-cta"
            style={{
              background: "var(--sfad-red)",
              color: "#fff",
              padding: "11px 22px",
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 10px 24px rgba(200,16,46,.22)",
              willChange: "transform",
            }}
          >
            {catalogLabel || "Katalog"}
          </Link>

          <button
            id="burger"
            aria-label="Menyu"
            onClick={() => setOpen(true)}
            style={{
              border: 0,
              background: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: 8,
            }}
          >
            <span style={{ display: "block", width: 24, height: 2, background: "var(--ink)" }} />
            <span style={{ display: "block", width: 16, height: 2, background: "var(--ink)" }} />
          </button>
        </div>
        <div
          id="header-progress"
          style={{
            position: "absolute",
            left: 0,
            bottom: -1,
            height: 2,
            width: "100%",
            background: "var(--sfad-red)",
            transform: "scaleX(0)",
            transformOrigin: "left",
          }}
        />
      </header>

      {/* Burger overlay menyu */}
      <div
        id="menu-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          background: "rgba(250,247,242,0.94)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .5s var(--ease-out)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(28px,10vw,140px)",
        }}
      >
        <button
          aria-label="Yopish"
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 26,
            insetInlineEnd: 32,
            border: 0,
            background: "none",
            cursor: "pointer",
            font: "300 40px Manrope, sans-serif",
            color: "var(--ink)",
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <div id="overlay-links" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {menu.map((m) => (
            <Link
              key={m.id}
              href={withLocale(m.url)}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "Unbounded, sans-serif",
                fontSize: "clamp(1.6rem,4.5vw,3.2rem)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
