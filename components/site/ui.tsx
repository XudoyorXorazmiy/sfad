import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export const WRAP = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "0 clamp(20px,4vw,48px)",
} as const;

export const SECTION = { padding: "clamp(72px,9vw,128px) 0" } as const;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      style={{
        font: "700 12.5px var(--font-manrope), Manrope, sans-serif",
        textTransform: "uppercase",
        letterSpacing: ".14em",
        color: "var(--sfad-gold)",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
        fontWeight: 700,
        fontSize: "clamp(1.8rem,3.4vw,2.8rem)",
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
      }}
    >
      {children}
    </h2>
  );
}

export function Sub({ children, center }: { children: React.ReactNode; center?: boolean }) {
  if (!children) return null;
  return (
    <p
      style={{
        marginTop: 16,
        fontSize: "1.05rem",
        lineHeight: 1.7,
        color: "var(--muted)",
        maxWidth: 620,
        ...(center ? { marginInline: "auto" } : {}),
      }}
    >
      {children}
    </p>
  );
}

/**
 * Ichki sahifalar hero'si — breadcrumb + H1 (aksent so'z qizil) + sub + CTA.
 * Fon: krem, o'ngda ulkan outline "SFAD".
 */
export function PageHero({
  breadcrumb,
  title,
  accent,
  sub,
  cta,
  locale,
}: {
  breadcrumb?: string;
  title: string;
  accent?: string;
  sub?: string;
  cta?: { label: string; url: string };
  locale: Locale;
}) {
  const withLocale = (u: string) =>
    !u.startsWith("/") ? u : locale === "uz" ? u : `/${locale}${u === "/" ? "" : u}`;

  // aksent so'zni qizil qilib ajratish
  let head: React.ReactNode = title;
  if (accent && title.includes(accent)) {
    const [before, ...rest] = title.split(accent);
    head = (
      <>
        {before}
        <span style={{ color: "var(--sfad-red)" }}>{accent}</span>
        {rest.join(accent)}
      </>
    );
  }

  return (
    <section
      style={{
        position: "relative",
        background: "var(--cream)",
        padding: "clamp(56px,7vw,96px) 0 clamp(40px,5vw,64px)",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          insetInlineEnd: "-2%",
          top: "18%",
          fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(6rem,16vw,15rem)",
          letterSpacing: "-0.04em",
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(200,16,46,.08)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        SFAD
      </span>
      <div style={{ ...WRAP, position: "relative" }}>
        {breadcrumb && (
          <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 18 }}>
            {breadcrumb}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.2rem,5vw,3.8rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
            maxWidth: "20ch",
          }}
        >
          {head}
        </h1>
        {sub && <Sub>{sub}</Sub>}
        {cta?.label && (
          <Link
            href={withLocale(cta.url || "/")}
            data-magnetic="1"
            data-sheen="1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 32,
              background: "var(--sfad-red)",
              color: "#fff",
              padding: "16px 28px",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              boxShadow: "0 10px 24px rgba(200,16,46,.22)",
            }}
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-reveal="1"
      style={{
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 20,
        padding: 26,
        boxShadow: "0 2px 10px rgba(29,29,29,.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
