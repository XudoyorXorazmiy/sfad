import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { MenuLink } from "./header";

export function SiteFooter({
  menu,
  logoWhite,
  tagline,
  rights,
  phone,
  phoneRaw,
  email,
  address,
  socials,
  locale,
}: {
  menu: MenuLink[];
  logoWhite: string;
  tagline: string;
  rights: string;
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  socials: { label: string; url: string }[];
  locale: Locale;
}) {
  const withLocale = (url: string) =>
    !url.startsWith("/") ? url : locale === "uz" ? url : `/${locale}${url === "/" ? "" : url}`;

  const linkStyle = {
    color: "rgba(255,255,255,.75)",
    textDecoration: "none",
    fontSize: 14.5,
    display: "block",
    padding: "5px 0",
  } as const;

  const headStyle = {
    font: "700 12.5px Manrope, sans-serif",
    textTransform: "uppercase" as const,
    letterSpacing: ".16em",
    color: "var(--sfad-gold)",
    marginBottom: 14,
  };

  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "rgba(255,255,255,.75)",
        padding: "clamp(60px,7vw,90px) 0 36px",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 44,
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoWhite || "/uploads/sfad-oq.png"}
              alt="SFAD"
              height={40}
              style={{ height: 40, width: "auto", marginBottom: 18 }}
            />
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, maxWidth: 280 }}>
              {tagline}
            </p>
          </div>

          <div>
            <div style={headStyle}>Bo&apos;limlar</div>
            {menu.map((m) => (
              <Link key={m.id} href={withLocale(m.url)} style={linkStyle}>
                {m.label}
              </Link>
            ))}
          </div>

          <div>
            <div style={headStyle}>Kontaktlar</div>
            {phone && (
              <a href={`tel:${phoneRaw}`} style={linkStyle}>
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} style={linkStyle}>
                {email}
              </a>
            )}
            {address && <div style={{ ...linkStyle }}>{address}</div>}
            <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...linkStyle, padding: 0, fontSize: 13.5 }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 28,
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,.5)",
          }}
        >
          {rights || `© ${new Date().getFullYear()} SFAD`}
        </div>
      </div>
    </footer>
  );
}
