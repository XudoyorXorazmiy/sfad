import Link from "next/link";
import Image from "next/image";
import {
  getBlocks, getFeaturedProducts, getExportCountries, getArticles,
  t, tp, raw, list, href,
} from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { WorldMap } from "./world-map";

const WRAP = { maxWidth: 1240, margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" } as const;
const SECTION = { padding: "clamp(72px,9vw,128px) 0" } as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
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

function H2({ children }: { children: React.ReactNode }) {
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

function Sub({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      style={{
        marginTop: 16,
        fontSize: "1.05rem",
        lineHeight: 1.7,
        color: "var(--muted)",
        maxWidth: 620,
      }}
    >
      {children}
    </p>
  );
}

export async function Home({ locale }: { locale: Locale }) {
  const [b, products, countries, articles] = await Promise.all([
    getBlocks("home"),
    getFeaturedProducts(locale),
    getExportCountries(locale),
    getArticles(locale, 3),
  ]);

  const hero = b.hero;
  const about = b.about;
  const stats = b.stats;
  const prodIntro = b.productsIntro;
  const exportIntro = b.exportIntro;
  const certs = b.certs;
  const newsIntro = b.newsIntro;

  return (
    <>
      {/* ─── HERO ─── */}
      {hero && (
        <section
          id="hero"
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(180deg,var(--white),var(--cream))",
            overflow: "hidden",
          }}
        >
          {[
            { top: "18%", left: "12%", s: 8, o: 0.4, d: "7s" },
            { top: "64%", left: "8%", s: 5, o: 0.5, d: "9s" },
            { top: "30%", left: "82%", s: 10, o: 0.3, d: "8s" },
            { top: "72%", left: "76%", s: 6, o: 0.45, d: "10s" },
            { top: "12%", left: "60%", s: 7, o: 0.35, d: "8.5s" },
          ].map((p, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: p.top,
                left: p.left,
                width: p.s,
                height: p.s,
                borderRadius: "50%",
                background: "var(--sfad-gold)",
                opacity: p.o,
                filter: "blur(1px)",
                animation: `floatUp ${p.d} ease-in-out ${i * 0.6}s infinite`,
              }}
            />
          ))}

          <div style={{ ...WRAP, padding: "120px clamp(20px,4vw,48px)", width: "100%", position: "relative" }}>
            <div style={{ overflow: "hidden", marginBottom: 26 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 18px 9px 15px",
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,.6)",
                  backdropFilter: "blur(6px)",
                  borderRadius: 99,
                  animation: "maskUp .9s var(--ease-out) .15s both",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sfad-gold)" }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: ".04em", whiteSpace: "nowrap" }}>
                  {t(hero, "kicker", locale)}
                </span>
              </span>
            </div>

            <h1
              style={{
                margin: 0,
                maxWidth: "18ch",
                fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.9rem,4.2vw,3.6rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
              }}
            >
              <span style={{ display: "block", overflow: "hidden", paddingBottom: ".1em" }}>
                <span style={{ display: "block", animation: "maskUp 1s var(--ease-out) .3s both" }}>
                  {t(hero, "title", locale)}
                </span>
              </span>
            </h1>

            <div style={{ overflow: "hidden", maxWidth: 520, marginTop: 26 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.7,
                  color: "var(--muted)",
                  animation: "maskUp 1s var(--ease-out) .6s both",
                }}
              >
                {t(hero, "sub", locale)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
                marginTop: 42,
                animation: "fadeIn 1s var(--ease-out) .85s both",
              }}
            >
              <Link
                href={href(raw(hero, "cta1.url") || "/mahsulotlar", locale)}
                data-magnetic="1"
                data-sheen="1"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 11,
                  background: "var(--sfad-red)",
                  color: "#fff",
                  padding: "17px 32px",
                  borderRadius: 99,
                  fontSize: 15,
                  fontWeight: 700,
                  boxShadow: "0 16px 40px rgba(200,16,46,.25)",
                }}
              >
                {tp(hero, "cta1.label", locale)}
              </Link>
              <Link
                href={href(raw(hero, "cta2.url") || "/eksport", locale)}
                data-magnetic="1"
                style={{
                  background: "rgba(29,29,29,.06)",
                  color: "var(--ink)",
                  padding: "17px 34px",
                  borderRadius: 99,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {tp(hero, "cta2.label", locale)}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── KOMPANIYA ─── */}
      {about && (
        <section id="about" style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                gap: "clamp(32px,5vw,64px)",
                alignItems: "center",
              }}
            >
              <div data-reveal="1">
                <Eyebrow>{t(about, "eyebrow", locale)}</Eyebrow>
                <H2>{t(about, "title", locale)}</H2>
                <Sub>{t(about, "text", locale)}</Sub>
                {tp(about, "btn.label", locale) && (
                  <Link
                    href={href(raw(about, "btn.url") || "/fabrika", locale)}
                    style={{
                      display: "inline-block",
                      marginTop: 28,
                      color: "var(--sfad-red)",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {tp(about, "btn.label", locale)} →
                  </Link>
                )}
              </div>
              {raw(about, "image") && (
                <div
                  data-reveal="1"
                  style={{ borderRadius: 24, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}
                >
                  <Image
                    src={raw(about, "image")}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 45vw"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── STATISTIKA ─── */}
      {stats && list(stats).length > 0 && (
        <section style={{ background: "var(--cream)", padding: "clamp(40px,5vw,64px) 0" }}>
          <div style={WRAP}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 1,
                background: "var(--line)",
                borderBlock: "1px solid var(--line)",
              }}
            >
              {list(stats).map((item, i) => {
                const value = String(item.value ?? "");
                const num = parseInt(value.replace(/\D/g, ""), 10) || 0;
                const suffix = value.replace(/[0-9]/g, "");
                return (
                  <div
                    key={i}
                    data-reveal="1"
                    style={{ background: "var(--cream)", padding: "28px 20px", textAlign: "center" }}
                  >
                    <div
                      data-counter={num}
                      data-suffix={suffix}
                      style={{
                        fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(1.8rem,3vw,2.6rem)",
                        color: "var(--sfad-red)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      0{suffix}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
                      {t(item as never, "label", locale)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── MAHSULOTLAR ─── */}
      {prodIntro && products.length > 0 && (
        <section id="products" style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div data-reveal="1" style={{ marginBottom: "clamp(40px,5vw,64px)" }}>
              <Eyebrow>{t(prodIntro, "eyebrow", locale)}</Eyebrow>
              <H2>{t(prodIntro, "title", locale)}</H2>
              <Sub>{t(prodIntro, "sub", locale)}</Sub>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
                gap: 24,
              }}
            >
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={href("/mahsulotlar", locale)}
                  data-reveal="1"
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 20,
                    boxShadow: "0 2px 10px rgba(29,29,29,.05)",
                    transition: "transform .45s var(--ease-out), box-shadow .45s var(--ease-out)",
                    display: "block",
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
                        {p.badge === "NEW" ? "YANGI" : p.badge === "HIT" ? "XIT" : "SHAKARSIZ"}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontWeight: 600,
                      fontSize: 17,
                    }}
                  >
                    {p.name}
                  </div>
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
                  {p.weight && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 12,
                        borderRadius: 8,
                        background: "rgba(201,162,75,.12)",
                        color: "#8F6E28",
                        fontSize: 12,
                        padding: "4px 9px",
                      }}
                    >
                      {p.weight}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {t(prodIntro, "allLabel", locale) && (
              <div style={{ marginTop: 40, textAlign: "center" }}>
                <Link
                  href={href("/mahsulotlar", locale)}
                  data-magnetic="1"
                  style={{ color: "var(--sfad-red)", fontWeight: 700, fontSize: 15 }}
                >
                  {t(prodIntro, "allLabel", locale)}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── EKSPORT XARITASI ─── */}
      {exportIntro && (
        <section id="export" style={{ ...SECTION, background: "var(--cream)" }}>
          <div style={WRAP}>
            <div data-reveal="1" style={{ textAlign: "center", marginBottom: "clamp(32px,4vw,52px)" }}>
              <Eyebrow>{t(exportIntro, "eyebrow", locale)}</Eyebrow>
              <H2>{t(exportIntro, "title", locale)}</H2>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sub>{t(exportIntro, "sub", locale)}</Sub>
              </div>
            </div>
            <WorldMap countries={countries} />
          </div>
        </section>
      )}

      {/* ─── SERTIFIKATLAR ─── */}
      {certs && list(certs).length > 0 && (
        <section id="certs" style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div data-reveal="1" style={{ marginBottom: 40 }}>
              <Eyebrow>{t(certs, "eyebrow", locale)}</Eyebrow>
              <H2>{t(certs, "title", locale)}</H2>
              <Sub>{t(certs, "sub", locale)}</Sub>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: 24,
              }}
            >
              {list(certs).map((c, i) => (
                <div
                  key={i}
                  data-reveal="1"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 26,
                    background: "var(--cream)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontWeight: 600,
                      fontSize: 18,
                      marginBottom: 8,
                    }}
                  >
                    {t(c as never, "title", locale)}
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)" }}>
                    {t(c as never, "text", locale)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── YANGILIKLAR ─── */}
      {newsIntro && articles.length > 0 && (
        <section id="news" style={{ ...SECTION, background: "var(--soft)" }}>
          <div style={WRAP}>
            <div data-reveal="1" style={{ marginBottom: 40 }}>
              <Eyebrow>{t(newsIntro, "eyebrow", locale)}</Eyebrow>
              <H2>{t(newsIntro, "title", locale)}</H2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 24,
              }}
            >
              {articles.map((a) => (
                <Link
                  key={a.slug}
                  href={href(`/yangiliklar/${a.slug}`, locale)}
                  data-reveal="1"
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 24,
                    display: "block",
                  }}
                >
                  <div style={{ fontSize: 12.5, color: "var(--sfad-gold)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {a.category}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontWeight: 600,
                      fontSize: 17,
                      lineHeight: 1.35,
                    }}
                  >
                    {a.title}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
                    {a.publishedAt?.toLocaleDateString("uz-UZ")} · {a.readingTime} daq
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
