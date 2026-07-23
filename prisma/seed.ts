/**
 * SFAD CMS seed — statik saytdagi barcha kontentni bazaga ko'chiradi.
 * Manba: prisma/seed-data/*.json (dizayn-handoff'dan avtomatik chiqarilgan).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Badge, BlockType, Status } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import i18nRaw from "./seed-data/i18n.json";
import productsRaw from "./seed-data/products.json";
import countriesRaw from "./seed-data/countries.json";
import tashkent from "./seed-data/tashkent.json";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Loc = { uz: string; ru: string; en: string; ar: string };
const i18n = i18nRaw as Record<string, Record<string, string>>;

/** I18N lug'atidan 4 tilli qiymat yasaydi */
const L = (key: string): Loc => ({
  uz: i18n.uz[key] ?? "",
  ru: i18n.ru?.[key] ?? "",
  en: i18n.en?.[key] ?? "",
  ar: i18n.ar?.[key] ?? "",
});
/** Faqat UZ qiymat (boshqa tillar keyin admin paneldan) */
const U = (uz: string): Loc => ({ uz, ru: "", en: "", ar: "" });

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
};
function slugify(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("")
    .replace(/['ʼ`’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const IMG_BASE = "https://sfad.uz/wp-content/uploads/2024/08/";

async function main() {
  console.log("Seeding…");

  // ── 1. Admin ──────────────────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL ?? "admin@sfad.uz";
  const password = process.env.ADMIN_PASSWORD ?? "sfad-admin-2026";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await bcrypt.hash(password, 12),
      name: "SFAD Admin",
      role: "ADMIN",
    },
  });

  // ── 2. Kategoriyalar ──────────────────────────────────────────────────
  const CATS: { slug: string; uz: string }[] = [
    { slug: "sugar", uz: "Shakarli pechenye" },
    { slug: "galet", uz: "Galetli" },
    { slug: "wafer", uz: "Vafli" },
    { slug: "choco", uz: "Choco" },
    { slug: "kids", uz: "Bolalar uchun" },
  ];
  const catIds: Record<string, string> = {};
  for (const [i, c] of CATS.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, name: U(c.uz), order: i },
    });
    catIds[c.slug] = row.id;
  }

  // ── 3. Mahsulotlar ────────────────────────────────────────────────────
  const BADGE_MAP: Record<string, Badge> = {
    new: "NEW",
    hit: "HIT",
    sugarfree: "SUGAR_FREE",
  };
  type RawProduct = {
    n: string; f: string; cat: string; kg: string; d: string;
    pack?: number; badgeKind?: string;
  };
  const seen = new Set<string>();
  for (const [i, p] of (productsRaw as RawProduct[]).entries()) {
    let slug = slugify(p.n);
    while (seen.has(slug)) slug = `${slug}-${i}`;
    seen.add(slug);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: p.n,
        description: U(p.d),
        image: IMG_BASE + p.f,
        gallery: [],
        categoryId: catIds[p.cat] ?? null,
        shelfLife: "12 oy",
        weight: p.kg || null,
        packaging: p.pack ? "Qadoqlangan" : "Vaznda",
        badge: p.badgeKind ? BADGE_MAP[p.badgeKind] : null,
        isPackaged: Boolean(p.pack),
        isFeatured: i < 8, // bosh sahifa karuseli
        order: i,
        status: Status.PUBLISHED,
      },
    });
  }

  // ── 4. Maqolalar ──────────────────────────────────────────────────────
  const ARTICLES = [
    {
      key: "news_1",
      slug: "eksport-15-davlat",
      category: "Eksport",
      isFeatured: true,
      daysAgo: 10,
    },
    {
      key: "news_2",
      slug: "sfad-tarixi",
      category: "Kompaniya",
      isFeatured: false,
      daysAgo: 40,
    },
    {
      key: "news_3",
      slug: "choko-joke",
      category: "Yangi mahsulotlar",
      isFeatured: false,
      daysAgo: 70,
    },
  ];
  for (const a of ARTICLES) {
    const title = L(a.key);
    const para = (t: string) => (t ? `<p>${t}</p>` : "");
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        slug: a.slug,
        title,
        excerpt: title,
        content: {
          uz: para(title.uz), ru: para(title.ru), en: para(title.en), ar: para(title.ar),
        },
        category: a.category,
        isFeatured: a.isFeatured,
        status: Status.PUBLISHED,
        publishedAt: new Date(Date.now() - a.daysAgo * 864e5),
        readingTime: 3,
      },
    });
  }

  // ── 5. Sahifa bloklari ───────────────────────────────────────────────
  const blocks: {
    page: string; key: string; type: BlockType; data: unknown; order?: number;
  }[] = [
    // ---- home (I18N: 4 til) ----
    {
      page: "home", key: "hero", type: "TEXT",
      data: {
        kicker: L("hero_kicker"), title: L("hero_title"), sub: L("hero_sub"),
        cta1: { label: L("hero_cta1"), url: "/mahsulotlar" },
        cta2: { label: L("hero_cta2"), url: "/eksport#agent" },
        watchLabel: L("hero_watch"),
        videoUrl: "https://sfad.uz/wp-content/uploads/2026/07/YTDown.com_YouTube_www-sfad-uz_Media_htNhw2wWoBg_002_720p.mp4",
        poster: "",
      },
    },
    {
      page: "home", key: "about", type: "TEXT",
      data: {
        eyebrow: L("about_kicker"), title: L("about_title"),
        text: L("about_text"), btn: { label: L("about_btn"), url: "/fabrika" },
        image: "",
      },
    },
    {
      page: "home", key: "stats", type: "STATS",
      data: {
        items: [
          { value: "25+", label: L("stat_exp") },
          { value: "1M+", label: L("stat_clients") },
          { value: "100+", label: L("stat_products") },
          { value: "15+", label: L("stat_countries") },
        ],
      },
    },
    {
      page: "home", key: "productsIntro", type: "TEXT",
      data: {
        eyebrow: L("prod_kicker"), title: L("prod_title"), sub: L("prod_sub"),
        allLabel: L("prod_all"),
        chips: { all: L("chip_all"), cookie: L("chip_cookie"), wafer: L("chip_wafer"), choco: L("chip_choco") },
      },
    },
    {
      page: "home", key: "production", type: "STEPS",
      data: {
        eyebrow: L("production_kicker"), title: L("production_title"), sub: L("production_sub"),
        steps: [
          { title: L("hs1_t"), text: L("hs1_d") },
          { title: L("hs2_t"), text: L("hs2_d") },
          { title: L("hs3_t"), text: L("hs3_d") },
          { title: L("hs4_t"), text: L("hs4_d") },
        ],
      },
    },
    {
      page: "home", key: "exportIntro", type: "TEXT",
      data: {
        eyebrow: L("export_kicker"), title: L("export_title"),
        t1: L("export_t1"), hl: L("export_hl"), t2: L("export_t2"),
        sub: L("export_sub"),
      },
    },
    {
      page: "home", key: "certs", type: "LIST",
      data: {
        eyebrow: L("certs_kicker"), title: L("certs_title"), sub: L("certs_sub"),
        image: "https://sfad.uz/wp-content/uploads/2024/08/certs.-mobile.png",
        items: [
          { title: U("ISO 22000:2018"), text: U("Oziq-ovqat xavfsizligi menejmenti tizimi bo'yicha xalqaro sertifikat") },
          { title: U("Halal"), text: U("Barcha mahsulotlar halal standartlariga muvofiq ishlab chiqariladi") },
        ],
      },
    },
    {
      page: "home", key: "coop", type: "TEXT",
      data: {
        title: L("coop_title"), text: L("coop_text"),
        form: { name: L("form_name"), phone: L("form_phone"), company: L("form_company"), role: L("form_role"), msg: L("form_msg"), send: L("form_send") },
      },
    },
    {
      page: "home", key: "jobs", type: "TEXT",
      data: { title: L("jobs_title"), text: L("jobs_text") },
    },
    {
      page: "home", key: "newsIntro", type: "TEXT",
      data: { eyebrow: L("news_kicker"), title: L("news_title"), moreLabel: L("news_more") },
    },
    {
      page: "home", key: "contact", type: "TEXT",
      data: { eyebrow: L("contact_kicker"), title: L("contact_title"), addrLabel: L("contact_addr") },
    },
    // ---- products ----
    {
      page: "products", key: "hero", type: "TEXT",
      data: {
        breadcrumb: U("Bosh sahifa / Mahsulotlar"),
        title: U("Bizning assortiment"), accent: U("assortiment"),
        sub: U("200 ga yaqin nom: pechenye, vafli, shokolad konfetlari, galetlar"),
        cta: { label: U("Katalogni yuklab olish"), url: "" },
      },
    },
    {
      page: "products", key: "controls", type: "TEXT",
      data: {
        tabKg: U("Kilogramm"), tabPack: U("Qadoqlangan"),
        searchPlaceholder: U("Qidirish…"), countSuffix: U("ta mahsulot"),
        moreLabel: U("Yana ko'rsatish"),
        empty: { emoji: "🍪", title: U("Hech narsa topilmadi"), btn: U("Barcha mahsulotlar") },
      },
    },
    {
      page: "products", key: "banner", type: "TEXT",
      data: { title: U("Katalogda 200+ nom"), btn: { label: U("Katalogni yuklab olish"), url: "" } },
    },
    // ---- about (Fabrika) ----
    {
      page: "about", key: "hero", type: "TEXT",
      data: { title: U("SFAD konditer fabrikasi"), accent: U("SFAD"), sub: L("about_text") },
    },
    {
      page: "about", key: "company", type: "TEXT",
      data: {
        eyebrow: L("about_kicker"), title: L("about_title"), text: L("about_text"),
        image: "", floatCard: U("20+ yillik tajriba"),
      },
    },
    {
      page: "about", key: "mission", type: "RICHTEXT",
      data: {
        title: U("Missiyamiz"),
        text: U("Har bir mahsulotda — katta qalbimizning bir bo'lagi va mukammallikka intilishimiz."),
        highlightWords: ["shodlik", "tabassum"],
      },
    },
    {
      page: "about", key: "values", type: "LIST",
      data: {
        items: [
          { icon: "grid", title: U("Keng assortiment"), text: U("100 dan ortiq turdagi shirinliklar — har bir didga mos tanlov") },
          { icon: "sparkles", title: U("Yangi ta'mlar va texnologiyalar"), text: U("Doimiy izlanish va zamonaviy uskunalarda yangi retseptlar") },
          { icon: "leaf", title: U("Tabiiy ingredientlar"), text: U("Sifatli va tabiiy xomashyo — mahsulotlarimiz asosi") },
        ],
      },
    },
    {
      page: "about", key: "timeline", type: "TIMELINE",
      data: {
        items: [
          { year: "1998", text: U("Kichik sexda birinchi pechenye partiyasi") },
          { year: "2005", text: U("Birinchi fabrika va avtomatlashtirilgan liniyalar") },
          { year: "2015", text: U("Ikkinchi fabrika, eksportning boshlanishi") },
          { year: "Bugun", text: U("100+ mahsulot turi, 15+ davlatga eksport") },
        ],
      },
    },
    {
      page: "about", key: "certs", type: "LIST",
      data: {
        image: "https://sfad.uz/wp-content/uploads/2024/08/certs.-mobile.png",
        items: [
          { title: U("ISO 22000:2018"), text: U("Oziq-ovqat xavfsizligi menejmenti tizimi") },
          { title: U("Halal"), text: U("Halal standartlariga to'liq muvofiqlik") },
        ],
      },
    },
    // ---- export ----
    {
      page: "export", key: "hero", type: "TEXT",
      data: {
        title: U("SFAD — pechenye, vafli va shokolad eksportyori"),
        accent: U("eksportyori"),
        sub: U("15 davlatdagi distribyutorlar SFAD mahsulotlariga ishonadi"),
        cta: { label: U("Agent bo'lish"), url: "#agent" },
      },
    },
    {
      page: "export", key: "advantages", type: "LIST",
      data: {
        items: [
          { num: "01", icon: "factory", title: U("Ishlab chiqaruvchi"), text: U("O'z fabrikamiz — kuniga 150 tonna quvvat") },
          { num: "02", icon: "truck", title: U("Logistika"), text: U("Har qanday yo'nalishga yetkazib berishni tashkil qilamiz") },
          { num: "03", icon: "globe", title: U("Eksport"), text: U("15+ davlatga muvaffaqiyatli eksport tajribasi") },
          { num: "04", icon: "shield", title: U("Benuqson sifat"), text: U("ISO 22000:2018 va Halal sertifikatlari") },
        ],
      },
    },
    {
      page: "export", key: "mapIntro", type: "TEXT",
      data: { eyebrow: L("export_kicker"), title: U("Toshkentdan — dunyoga"), sub: L("export_sub") },
    },
    {
      page: "export", key: "manager", type: "TEXT",
      data: { name: "Muxitdinov Dilshod Xojimuradovich", role: U("Eksport bo'limi boshlig'i"), photo: "" },
    },
    {
      page: "export", key: "faq", type: "ACCORDION",
      data: { items: [] }, // 5-bosqichda markupdan to'ldiriladi
    },
    {
      page: "export", key: "wizard", type: "STEPS",
      data: {
        steps: [
          { title: U("Ismingiz"), fields: ["name", "appeal"] },
          { title: U("Aloqa"), fields: ["phone", "email"] },
          { title: U("Hudud"), fields: ["region", "city"] },
          { title: U("Tajriba"), fields: ["experience"] },
          { title: U("Manba va izoh"), fields: ["source", "note", "consent"] },
        ],
        success: U("Arizangiz qabul qilindi"),
      },
    },
    {
      page: "export", key: "packFormats", type: "LIST",
      data: {
        items: [
          { title: U("Vaznda"), image: "" },
          { title: U("Kartonli qutilarda"), image: "" },
          { title: U("Shou-bokslarda"), image: "" },
        ],
      },
    },
    // ---- news ----
    {
      page: "news", key: "hero", type: "TEXT",
      data: { title: L("news_title"), eyebrow: L("news_kicker") },
    },
    // ---- contacts ----
    {
      page: "contacts", key: "hero", type: "TEXT",
      data: { title: U("Biz bilan bog'laning"), accent: U("bog'laning") },
    },
    {
      page: "contacts", key: "formLabels", type: "TEXT",
      data: {
        name: L("form_name"), phone: L("form_phone"), msg: L("form_msg"),
        send: U("Ariza yuborish"), success: U("✓ Yuborildi"),
      },
    },
  ];
  for (const [i, b] of blocks.entries()) {
    await prisma.block.upsert({
      where: { page_key: { page: b.page, key: b.key } },
      update: {},
      create: { page: b.page, key: b.key, type: b.type, data: b.data as object, order: b.order ?? i },
    });
  }

  // ── 6. Eksport davlatlari ────────────────────────────────────────────
  type RawCountry = { id: string; name: string; flag: string; x: number; y: number };
  for (const [i, c] of (countriesRaw as RawCountry[]).entries()) {
    await prisma.exportCountry.upsert({
      where: { isoCode: c.id },
      update: {},
      create: { isoCode: c.id, name: U(c.name), flag: c.flag, x: c.x, y: c.y, order: i },
    });
  }

  // ── 7. Sozlamalar ────────────────────────────────────────────────────
  const SETTINGS: Record<string, unknown> = {
    phone: "+998 (95) 146-66-66",
    phoneRaw: "+998951466666",
    email: "manages@sfad.uz",
    address: U("Toshkent 100057"),
    mapCoords: "41.36230,69.25332",
    mapHub: tashkent, // { x, y } — xarita Toshkent nuqtasi
    workHours: U("Dush–Shan, 9:00–18:00"),
    instagram: "https://instagram.com/sfaduzb",
    facebook: "https://facebook.com/sfaduzb",
    telegram: "https://t.me/sfaduzb",
    linkedin: "https://linkedin.com/company/sfaduzb",
    catalogPdf: "",
    logoColor: "/uploads/sfad-rang.png",
    logoWhite: "/uploads/sfad-oq.png",
    footerTag: L("footer_tag"),
    footerRights: L("footer_rights"),
    activeLocales: ["uz", "ru", "en", "ar"],
    maintenanceMode: false,
  };
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as object },
    });
  }

  // ── 8. Menyular ──────────────────────────────────────────────────────
  const HEADER_MENU = [
    { key: "nav_about", url: "/fabrika" },
    { key: "nav_products", url: "/mahsulotlar" },
    { key: "nav_export", url: "/eksport" },
    { key: "nav_coop", url: "/eksport#agent" },
    { key: "nav_contact", url: "/kontakt" },
    { key: "nav_news", url: "/yangiliklar" },
  ];
  const existingMenu = await prisma.menuItem.count();
  if (existingMenu === 0) {
    for (const [i, m] of HEADER_MENU.entries()) {
      await prisma.menuItem.create({
        data: { location: "header", label: L(m.key), url: m.url, order: i },
      });
    }
    for (const [i, m] of HEADER_MENU.entries()) {
      await prisma.menuItem.create({
        data: { location: "footer", label: L(m.key), url: m.url, order: i },
      });
    }
  }

  // ── 9. PageSeo ───────────────────────────────────────────────────────
  const PAGES: { path: string; title: string; desc: string }[] = [
    { path: "/", title: "SFAD — Shirinliklar sehri", desc: "1998 yildan buyon 100+ turdagi shirinlik. 15+ davlatga eksport." },
    { path: "/mahsulotlar", title: "SFAD — Mahsulotlar", desc: "200 ga yaqin nom: pechenye, vafli, shokolad konfetlari, galetlar." },
    { path: "/fabrika", title: "SFAD — Fabrika haqida", desc: "Bozor rastasidan xalqaro fabrikagacha — SFAD tarixi va qadriyatlari." },
    { path: "/eksport", title: "SFAD — Eksport", desc: "SFAD — pechenye, vafli va shokolad eksportyori. Agent bo'ling." },
    { path: "/yangiliklar", title: "SFAD — Yangiliklar", desc: "SFAD kompaniyasi yangiliklari va e'lonlari." },
    { path: "/kontakt", title: "SFAD — Kontaktlar", desc: "Biz bilan bog'laning: telefon, email, manzil." },
  ];
  for (const p of PAGES) {
    const existing = await prisma.pageSeo.findUnique({ where: { path: p.path } });
    if (!existing) {
      await prisma.pageSeo.create({
        data: {
          path: p.path,
          seo: { create: { metaTitle: U(p.title), metaDesc: U(p.desc) } },
        },
      });
    }
  }

  // ── 10. Redirectlar (eski statik URL'lar) ────────────────────────────
  const REDIRECTS = [
    { from: "/index.html", to: "/" },
    { from: "/products.html", to: "/mahsulotlar" },
    { from: "/about.html", to: "/fabrika" },
    { from: "/export.html", to: "/eksport" },
    { from: "/news.html", to: "/yangiliklar" },
    { from: "/contacts.html", to: "/kontakt" },
  ];
  for (const r of REDIRECTS) {
    await prisma.redirect.upsert({
      where: { from: r.from },
      update: {},
      create: r,
    });
  }

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    articles: await prisma.article.count(),
    blocks: await prisma.block.count(),
    countries: await prisma.exportCountry.count(),
    settings: await prisma.setting.count(),
    menuItems: await prisma.menuItem.count(),
    pageSeo: await prisma.pageSeo.count(),
    redirects: await prisma.redirect.count(),
  };
  console.log("Seed tugadi:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
