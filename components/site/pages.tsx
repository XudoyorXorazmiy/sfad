import Image from "next/image";
import Link from "next/link";
import {
  getBlocks, getAllProducts, getCategories, getExportCountries,
  getArticles, getSettings, setting, t, tp, raw, list, href,
} from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { WRAP, SECTION, Eyebrow, H2, Sub, PageHero, Card } from "./ui";
import { ProductCatalog } from "./product-catalog";
import { WorldMap } from "./world-map";
import { ContactForm } from "./contact-form";

/* ─────────────────── MAHSULOTLAR ─────────────────── */
export async function ProductsPage({ locale }: { locale: Locale }) {
  const [b, products, categories] = await Promise.all([
    getBlocks("products"),
    getAllProducts(locale),
    getCategories(locale),
  ]);
  const hero = b.hero;
  const c = b.controls;

  return (
    <>
      <PageHero
        locale={locale}
        breadcrumb={t(hero, "breadcrumb", locale)}
        title={t(hero, "title", locale)}
        accent={t(hero, "accent", locale)}
        sub={t(hero, "sub", locale)}
        cta={{ label: tp(hero, "cta.label", locale), url: raw(hero, "cta.url") || "/mahsulotlar" }}
      />
      <section style={{ background: "var(--white)", paddingBottom: "clamp(72px,9vw,128px)" }}>
        <ProductCatalog
          products={products}
          categories={categories}
          labels={{
            tabKg: t(c, "tabKg", locale) || "Kilogramm",
            tabPack: t(c, "tabPack", locale) || "Qadoqlangan",
            searchPlaceholder: t(c, "searchPlaceholder", locale) || "Qidirish…",
            countSuffix: t(c, "countSuffix", locale) || "ta mahsulot",
            moreLabel: t(c, "moreLabel", locale) || "Yana ko'rsatish",
            allChip: "Barchasi",
            emptyEmoji: raw(c, "empty.emoji") || "🍪",
            emptyTitle: tp(c, "empty.title", locale) || "Hech narsa topilmadi",
          }}
        />
      </section>

      {b.banner && (
        <section style={{ background: "linear-gradient(90deg,var(--sfad-red),var(--sfad-red-dark))", padding: "clamp(40px,5vw,64px) 0" }}>
          <div style={{ ...WRAP, textAlign: "center", color: "#fff" }}>
            <H2>{t(b.banner, "title", locale)}</H2>
          </div>
        </section>
      )}
    </>
  );
}

/* ─────────────────── FABRIKA HAQIDA ─────────────────── */
export async function AboutPage({ locale }: { locale: Locale }) {
  const b = await getBlocks("about");

  return (
    <>
      <PageHero
        locale={locale}
        title={t(b.hero, "title", locale)}
        accent={t(b.hero, "accent", locale)}
        sub={t(b.hero, "sub", locale)}
      />

      {b.company && (
        <section style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
              <div data-reveal="1">
                <Eyebrow>{t(b.company, "eyebrow", locale)}</Eyebrow>
                <H2>{t(b.company, "title", locale)}</H2>
                <Sub>{t(b.company, "text", locale)}</Sub>
              </div>
              {raw(b.company, "image") && (
                <div data-reveal="1" style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "4/3" }}>
                  <Image src={raw(b.company, "image")} alt="" fill sizes="45vw" style={{ objectFit: "cover" }} unoptimized />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {b.mission && (
        <section style={{ ...SECTION, background: "var(--cream)" }}>
          <div style={{ ...WRAP, textAlign: "center", maxWidth: 900 }}>
            <Eyebrow>{t(b.mission, "title", locale)}</Eyebrow>
            <p
              data-reveal="1"
              style={{
                fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                fontWeight: 500,
                fontSize: "clamp(1.3rem,2.6vw,2.1rem)",
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
              }}
            >
              {t(b.mission, "text", locale)}
            </p>
          </div>
        </section>
      )}

      {b.values && list(b.values).length > 0 && (
        <section style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {list(b.values).map((v, i) => (
                <Card key={i}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(201,162,75,.14)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <span style={{ color: "var(--sfad-gold)", fontSize: 18 }}>◆</span>
                  </div>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 18 }}>
                    {t(v as never, "title", locale)}
                  </h3>
                  <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)" }}>
                    {t(v as never, "text", locale)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {b.timeline && list(b.timeline).length > 0 && (
        <section style={{ ...SECTION, background: "var(--soft)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 28 }}>
              {list(b.timeline).map((it, i) => (
                <div key={i} data-reveal="1" style={{ position: "relative", paddingTop: 26 }}>
                  <span style={{ position: "absolute", top: 0, insetInlineStart: 0, width: 12, height: 12, borderRadius: "50%", background: "var(--sfad-gold)" }} />
                  <div style={{ fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--sfad-red)" }}>
                    {String((it as Record<string, unknown>).year ?? "")}
                  </div>
                  <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.6, color: "var(--muted)" }}>
                    {t(it as never, "text", locale)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {b.certs && (
        <section style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {list(b.certs).map((c, i) => (
                <Card key={i}>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 18 }}>
                    {t(c as never, "title", locale)}
                  </h3>
                  <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)" }}>
                    {t(c as never, "text", locale)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ─────────────────── EKSPORT ─────────────────── */
export async function ExportPage({ locale }: { locale: Locale }) {
  const [b, countries] = await Promise.all([
    getBlocks("export"),
    getExportCountries(locale),
  ]);

  return (
    <>
      <PageHero
        locale={locale}
        title={t(b.hero, "title", locale)}
        accent={t(b.hero, "accent", locale)}
        sub={t(b.hero, "sub", locale)}
        cta={{ label: tp(b.hero, "cta.label", locale), url: "/eksport#agent" }}
      />

      {b.advantages && list(b.advantages).length > 0 && (
        <section style={{ ...SECTION, background: "var(--white)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 24 }}>
              {list(b.advantages).map((a, i) => (
                <Card key={i} style={{ position: "relative", overflow: "hidden" }}>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 6,
                      insetInlineEnd: 14,
                      fontFamily: "var(--font-unbounded), Unbounded, sans-serif",
                      fontWeight: 800,
                      fontSize: 72,
                      color: "rgba(29,29,29,.06)",
                      lineHeight: 1,
                    }}
                  >
                    {String((a as Record<string, unknown>).num ?? "")}
                  </span>
                  <h3 style={{ margin: 0, position: "relative", fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 18 }}>
                    {t(a as never, "title", locale)}
                  </h3>
                  <p style={{ marginTop: 10, position: "relative", fontSize: 14.5, lineHeight: 1.65, color: "var(--muted)" }}>
                    {t(a as never, "text", locale)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ ...SECTION, background: "var(--cream)" }}>
        <div style={WRAP}>
          <div data-reveal="1" style={{ textAlign: "center", marginBottom: "clamp(32px,4vw,52px)" }}>
            <Eyebrow>{t(b.mapIntro, "eyebrow", locale)}</Eyebrow>
            <H2>{t(b.mapIntro, "title", locale)}</H2>
            <Sub center>{t(b.mapIntro, "sub", locale)}</Sub>
          </div>
          <WorldMap countries={countries} />
        </div>
      </section>

      {/* Agent anketasi */}
      <section id="agent" style={{ ...SECTION, background: "var(--white)" }}>
        <div style={{ ...WRAP, maxWidth: 720 }}>
          <div data-reveal="1" style={{ marginBottom: 32, textAlign: "center" }}>
            <H2>{tp(b.hero, "cta.label", locale) || "Agent bo'lish"}</H2>
          </div>
          <div style={{ background: "var(--cream)", borderRadius: 28, padding: "clamp(24px,4vw,40px)" }}>
            <ContactForm
              type="AGENT"
              submitLabel="Ariza yuborish"
              successLabel={t(b.wizard, "success", locale) || "✓ Arizangiz qabul qilindi"}
              fields={[
                { name: "name", label: "Ismingiz", required: true },
                { name: "phone", label: "Telefon", required: true },
                { name: "email", label: "E-mail", type: "email", required: true },
                { name: "region", label: "Qaysi hududda ishlaysiz?", required: true },
                { name: "city", label: "Aniq shahar / region" },
                { name: "experience", label: "Distribyutsiya tajribangiz" },
                { name: "source", label: "Bizni qayerdan topdingiz?" },
                { name: "note", label: "Izoh", textarea: true },
              ]}
            />
          </div>
        </div>
      </section>

      {b.packFormats && list(b.packFormats).length > 0 && (
        <section style={{ ...SECTION, background: "var(--soft)" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
              {list(b.packFormats).map((f, i) => (
                <Card key={i} style={{ textAlign: "center" }}>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 17 }}>
                    {t(f as never, "title", locale)}
                  </h3>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ─────────────────── YANGILIKLAR ─────────────────── */
export async function NewsPage({ locale }: { locale: Locale }) {
  const [b, articles] = await Promise.all([getBlocks("news"), getArticles(locale)]);
  const featured = articles.find((a) => a.isFeatured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== featured?.slug);

  return (
    <>
      <PageHero locale={locale} title={t(b.hero, "title", locale) || "Yangiliklar"} />
      <section style={{ ...SECTION, background: "var(--white)", paddingTop: 40 }}>
        <div style={WRAP}>
          {featured && (
            <Link href={href(`/yangiliklar/${featured.slug}`, locale)} data-reveal="1" style={{ display: "block", marginBottom: 40 }}>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                  <div style={{ minHeight: 220, background: "linear-gradient(135deg,#F3EDE4,#E8DFD0)", position: "relative" }}>
                    {featured.coverImage && (
                      <Image src={featured.coverImage} alt="" fill sizes="50vw" style={{ objectFit: "cover" }} unoptimized />
                    )}
                  </div>
                  <div style={{ padding: 32 }}>
                    <span style={{ borderRadius: 99, background: "rgba(201,162,75,.12)", color: "#8F6E28", fontSize: 12, padding: "5px 12px" }}>
                      {featured.publishedAt?.toLocaleDateString("uz-UZ")}
                    </span>
                    <h3 style={{ marginTop: 16, fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 22, lineHeight: 1.3 }}>
                      {featured.title}
                    </h3>
                    <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "var(--muted)" }}>
                      {featured.excerpt}
                    </p>
                    <span style={{ display: "inline-block", marginTop: 18, color: "var(--sfad-red)", fontWeight: 700 }}>
                      Batafsil →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {rest.map((a) => (
              <Link key={a.slug} href={href(`/yangiliklar/${a.slug}`, locale)}>
                <Card>
                  <div style={{ fontSize: 12.5, color: "var(--sfad-gold)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {a.category}
                  </div>
                  <h3 style={{ marginTop: 10, fontFamily: "var(--font-unbounded), Unbounded, sans-serif", fontWeight: 600, fontSize: 17, lineHeight: 1.35 }}>
                    {a.title}
                  </h3>
                  <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
                    {a.publishedAt?.toLocaleDateString("uz-UZ")} · {a.readingTime} daq
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────── KONTAKTLAR ─────────────────── */
export async function ContactsPage({ locale }: { locale: Locale }) {
  const [b, s] = await Promise.all([getBlocks("contacts"), getSettings()]);
  const f = b.formLabels;
  const coords = setting(s, "mapCoords") || "41.36230,69.25332";

  const cards = [
    { label: "Telefon", value: setting(s, "phone"), href: `tel:${setting(s, "phoneRaw")}` },
    { label: "Email", value: setting(s, "email"), href: `mailto:${setting(s, "email")}` },
    { label: "Manzil", value: setting(s, "address", locale) },
    { label: "Ish vaqti", value: setting(s, "workHours", locale) },
  ].filter((c) => c.value);

  return (
    <>
      <PageHero
        locale={locale}
        title={t(b.hero, "title", locale) || "Biz bilan bog'laning"}
        accent={t(b.hero, "accent", locale)}
      />
      <section style={{ ...SECTION, background: "var(--white)", paddingTop: 40 }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(28px,4vw,48px)" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {cards.map((c) => (
                <Card key={c.label} style={{ display: "flex", gap: 16, alignItems: "center", padding: 22 }}>
                  <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--sfad-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    ●
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} style={{ fontSize: 16, fontWeight: 600 }}>{c.value}</a>
                    ) : (
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{c.value}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card style={{ padding: "clamp(24px,4vw,36px)", borderRadius: 24 }}>
              <ContactForm
                type="CONTACT"
                submitLabel={t(f, "send", locale) || "Ariza yuborish"}
                successLabel={t(f, "success", locale) || "✓ Yuborildi"}
                fields={[
                  { name: "name", label: t(f, "name", locale) || "Ismingiz", required: true },
                  { name: "phone", label: t(f, "phone", locale) || "Telefon", required: true },
                  { name: "message", label: t(f, "msg", locale) || "Xabar", textarea: true },
                ]}
              />
            </Card>
          </div>

          <div style={{ marginTop: 48, borderRadius: 24, overflow: "hidden", height: 420 }}>
            <iframe
              title="SFAD xarita"
              src={`https://maps.google.com/maps?q=${coords}&z=15&output=embed`}
              style={{ width: "100%", height: "100%", border: 0 }}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
