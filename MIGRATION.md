# SFAD — Statik saytdan Next.js + CMS'ga migratsiya xaritasi

> 1-bosqich hujjati. Manba: `~/Downloads/design_handoff_sfad_website/`
> (prototypes/*.dc.html + sfad-inner.js + sfad-data.js + README.md) va jonli sayt https://sfaduz.vercel.app

---

## 1. Manba tahlili — nima bor

| Manba fayl | Mazmuni | Taqdiri |
|---|---|---|
| `SFAD Bosh Sahifa.dc.html` (1116 q.) | 9 seksiya: hero, about, products, export, certs, coop, jobs, news, contact | → `app/(site)/[locale]/page.tsx` |
| `SFAD Mahsulotlar.dc.html` (379 q.) | Sahifa-hero, boshqaruv paneli (2 tab + qidiruv + 6 chip), grid, quick-view modal, `PRODUCTS` massivi (28 ta) | → `/mahsulotlar` |
| `SFAD Fabrika.dc.html` (315 q.) | Hero, kompaniya, missiya (scroll-highlight), 3 qadriyat, timeline (4 nuqta), sertifikatlar, mini-kontakt | → `/fabrika` |
| `SFAD Eksport.dc.html` (423 q.) | Hero, 4 afzallik, interaktiv xarita, menejer + 4 FAQ akkordeon, 5-qadamli agent-anketa (`#agent`), 3 qadoq formati | → `/eksport` |
| `SFAD Yangiliklar.dc.html` (221 q.) | Featured karta, grid, maqola shabloni (`#article`, o'qish progress-bar) | → `/yangiliklar`, `/yangiliklar/[slug]` |
| `SFAD Kontaktlar.dc.html` (194 q.) | 4 kontakt-karta, forma, Google Maps embed (41.36230, 69.25332) | → `/kontakt` |
| `sfad-inner.js` (416 q.) | initChrome (i18n, menyu, header, reveal, counters, magnetic, forms, responsive), initExtras (totop, FAB, sahifa o'tish), buildMap | → React hook/komponentlarga (7-bo'lim) |
| `sfad-data.js` | `I18N` (uz/ru/en/ar lug'at), `MAP_PARTNERS` (15 davlat: id/name/flag/x/y), `TASHKENT` | → seed: `ExportCountry`, Block'lardagi tarjimalar |
| `world.svg` | Dunyo xaritasi, davlatlar `path#ISO` | → `components/site/WorldMap.tsx` ichida statik asset |

**Dizayn tokenlari** (README'дан): `--sfad-red #C8102E`, `--sfad-red-dark #9E0C24`, `--sfad-gold #C9A24B`, `--cream #FAF7F2`, `--soft #F3EDE4`, `--ink #1D1D1D`, `--muted #6F6F6F`, `--line rgba(0,0,0,.07)` → `tailwind.config.ts` `colors.sfad.*`; shriftlar Unbounded/Manrope/Cairo → `next/font/google`; radius/soya/easing shkalasi → Tailwind theme extend. Mavjud keyframe'lar (maskUp, floatUp, pulseRing, dashFlow...) → `globals.css` aynan ko'chiriladi.

---

## 2. Dinamik entity'lar (alohida jadvalga tushadi)

### 2.1 `Product` — 28 ta mahsulot
Manba: `SFAD Mahsulotlar.dc.html` ichidagi `PRODUCTS` massivi:
```js
{ n:'Бурёнка choco', f:'95-1.png', cat:'choco', kg:'3 kg', d:'Sutli-shokoladli...' , pack?: true }
```
Mapping: `n`→`name` (String, **tarjimasiz** — brend nomi), `f`→`image` (`https://sfad.uz/wp-content/uploads/2024/08/` + f — seed'да to'liq URL), `cat`→`categoryId`, `kg`→`weight`, `d`→`description.uz`, `pack`→`isPackaged`. `shelfLife` standart "12 oy". `badge` — hozirgi markup'dagi YANGI/XIT/SHAKARSIZ belgilariga mos. Bosh sahifa karuselидаги mahsulotlar → `isFeatured: true`.

### 2.2 `Category` — 5 ta
Chip'lardan: `sugar` Shakarli pechenye · `galet` Galetli · `wafer` Vafli · `choco` Choco · `kids` Bolalar uchun. ("Barchasi" — kategoriya emas, UI holati.) Chip'lardagi jonli hisob `(N)` — so'rov bilan hisoblanadi, bazada saqlanmaydi.

### 2.3 `Article` — 3 ta seed maqola
Yangiliklar sahifasidagi featured + 2 grid karta (sarlavha, sana, excerpt). Rasm — hozircha gradient placeholder → `coverImage: null`. Maqola tanasi Tiptap HTML sifatida `content.uz`ga.

### 2.4 `ExportCountry` — 15 ta
`sfad-data.js` `MAP_PARTNERS`dan aynan: `{ id:"KZ", name:"Qozog'iston", flag:"🇰🇿", x:690.7, y:328.2 }` → `isoCode`, `name.uz`, `flag`, `x`, `y`, `order` (massiv tartibi). `TASHKENT` koordinatasi → `Setting("mapHub")`.

### 2.5 `Setting`
`phone: +998951466666`, `email: manages@sfad.uz`, `address` (kontakt sahifasidan), `mapCoords: 41.36230,69.25332`, `workHours`, `instagram/facebook/telegram/linkedin` (sfaduzb), `catalogPdf`, `logoColor`/`logoWhite`, `footerText`, `activeLocales`, `maintenanceMode`.

### 2.6 `MenuItem`
Header: Kompaniya→/fabrika, Mahsulotlar→/mahsulotlar, Eksport→/eksport, Hamkorlik→/eksport#agent, Aloqa→/kontakt. Footer: bo'limlar + yangiliklar. (Hozirgi statik saytda header 5 + overlay 9 havola — overlay to'liq ro'yxat header'ники kengaytmasi sifatida `location:"header"`да saqlanadi, farqi `order`.)

### 2.7 `Submission` — 5 forma turi
| Forma | Joyi | type |
|---|---|---|
| Hamkorlik formasi | Bosh sahifa #coop | PARTNER |
| 5-qadamli agent-anketa | /eksport#agent | AGENT |
| Vakansiya | Bosh sahifa #jobs | VACANCY |
| Aloqa formasi | /kontakt va bosh sahifa #contact | CONTACT |
| Buyurtma so'rovi (quick-view modal ichida) | /mahsulotlar | PRODUCT_INQUIRY |

---

## 3. `Block` xaritasi — sahifama-sahifa

`type` qiymatlari TZ'dagi enum: TEXT · RICHTEXT · IMAGE · LIST · STATS · FAQ · TIMELINE · STEPS · ACCORDION.

### page: `home`
| key | type | data tarkibi (har matn `{uz,ru,en,ar}`) |
|---|---|---|
| `hero` | TEXT | kicker ("1998 yildan beri"), title, sub, cta1 {label,url}, cta2 {label,url}, watchLabel, videoUrl (MP4), poster |
| `about` | TEXT | eyebrow, title ("Bozor rastasidan..."), text, btn {label,url}, image |
| `stats` | STATS | 4×{value:25+/1M+/100+/15+, label} — odometer counter shu raqamlardan |
| `productsIntro` | TEXT | eyebrow, title, sub, allLabel ("Barcha mahsulotlar (100+) →") |
| `exportIntro` | TEXT | eyebrow ("Eksport geografiyasi"), title ("Toshkentdan — dunyoga"), sub |
| `certs` | LIST | items[]: {name: ISO 22000:2018 / Halal, text, image} |
| `coop` | STEPS | title, sub, steps[]: {num, title, text} + forma matnlari |
| `jobs` | TEXT | title, sub, vakansiya kartalari items[] |
| `newsIntro` | TEXT | eyebrow, title (ro'yxatning o'zi `Article`dan) |
| `contact` | TEXT | title, sub, forma label'lari |
| `ctaPanel` | TEXT | title, sub, btn {label,url} |

### page: `products`
| key | type | data |
|---|---|---|
| `hero` | TEXT | breadcrumb, title ("Bizning **assortiment**" — aksent so'z belgilanadi), sub, ctaBtn {label, fileUrl→catalogPdf} |
| `banner` | TEXT | oraliq qizil lenta: title ("Katalogda 200+ nom"), btn |
| `controls` | TEXT | tab1 ("Kilogramm"), tab2 ("Qadoqlangan"), searchPlaceholder, countSuffix ("ta mahsulot"), emptyState {emoji, title, btn} |

### page: `about` (Fabrika)
| key | type | data |
|---|---|---|
| `hero` | TEXT | title ("**SFAD** konditer fabrikasi"), sub |
| `company` | TEXT | eyebrow, title, text, btn, image, floatCard ("20+ yillik tajriba") |
| `mission` | RICHTEXT | matn + highlightWords[] ("shodlik","tabassum" — qizilga yonadi) |
| `values` | LIST | 3×{icon (SVG nomi), title, text} |
| `timeline` | TIMELINE | 4×{year: 1998/2005/2015/Bugun, title, text} |
| `certs` | LIST | image (certs.-mobile.png), 2×{title, text} |
| `capacity` | STATS | ish quvvati raqamlari (150 tonna/kun...) |
| `miniContact` | LIST | 3×{icon, label, value} |

### page: `export`
| key | type | data |
|---|---|---|
| `hero` | TEXT | title ("...**eksportyori**"), sub, cta {label, url:#agent} |
| `advantages` | LIST | 4×{num: 01-04, icon, title, text} (Ishlab chiqaruvchi 150t/kun · Logistika · 15+ davlat · ISO/Halal) |
| `mapIntro` | TEXT | eyebrow, title, sub (davlatlar ro'yxati `ExportCountry`dan) |
| `manager` | TEXT | name ("Muxitdinov Dilshod Xojimuradovich"), role, photo |
| `faq` | ACCORDION | 4×{q, a} |
| `wizard` | STEPS | 5 qadam: label'lar, radio variantlari, validatsiya xabarlari, muvaffaqiyat matni |
| `packFormats` | LIST | 3×{title: Vaznda/Kartonli/Shou-boks, image (Frame-*.png)} |
| `docs` | LIST | hujjatlar: {name, fileUrl} |

### page: `news`
| key | type | data |
|---|---|---|
| `hero` | TEXT | title, sub |
| `articleUi` | TEXT | "3 daqiqa o'qish" formati, "Boshqa yangiliklar" sarlavha — UI matnlari |

### page: `contacts`
| key | type | data |
|---|---|---|
| `hero` | TEXT | title ("Biz bilan **bog'laning**"), sub |
| `formLabels` | TEXT | ism/telefon/izoh label + submit + success matni |
| `directions` | TEXT | "qanday yetib borish", ish vaqti (qiymatlar `Setting`dan) |

**Eslatma:** kontakt kartalari (telefon/email/manzil/ijtimoiy) — `Setting`dan olinadi, Block emas (bitta manba, hamma joyda bir xil).

---

## 4. i18n strategiyasi

- `sfad-data.js` `I18N` lug'ati — nav/footer/tugma kalitlari. Bular `MenuItem.label` va tegishli Block maydonlariga singdiriladi; alohida "lug'at jadvali" YO'Q — har matn o'z blokida 4 tilda.
- Sayt kontenti hozir faqat UZ → seed'да `{uz: "...", ru:"", en:"", ar:""}`, RU/EN/AR keyin admin paneldan. Fallback: bo'sh til → UZ.
- Route: `/[locale]` segment, `uz` prefikssiz (default), `ru|en|ar` prefiksli. AR → `<html dir="rtl">` + Cairo font (mavjud `[dir="rtl"]` CSS qoidalari saqlanadi).
- Til almashtirgich URL almashtiradi (localStorage emas — SEO/hreflang uchun).

---

## 5. Route va redirect xaritasi

| Eski (statik) | Yangi |
|---|---|
| `/index.html`, `/` | `/` |
| `/products.html` | `/mahsulotlar` |
| `/about.html` | `/fabrika` |
| `/export.html` | `/eksport` |
| `/news.html` | `/yangiliklar` |
| `/contacts.html` | `/kontakt` |

`Redirect` jadvaliга seed: `*.html → yangi yo'l` (301). Sahifa ichi anchor'lar (`#agent`, `#coop`...) saqlanadi.

---

## 6. Qaysi matn dinamik, qaysi statik qoladi

**Dinamik (bazadan):** barcha ko'rinadigan matn/rasm — hero'lar, seksiya sarlavhalari, statistika raqamlari, FAQ, wizard label'lari, mahsulot/maqola/kategoriya, davlatlar, kontaktlar, menyu, footer, SEO meta.

**Statik qoladi (kodda):** SVG ikonkalar (Lucide-uslub inline — Block'да `icon` nomi bilan tanlanadi), animatsiya parametrlari (easing/duration), layout/grid, dunyo xaritasi SVG geometriyasi, til nomlari (UZ/RU/EN/AR).

---

## 7. JS → React migratsiya rejasi (animatsiya parity)

| sfad-inner.js | Yangi joy |
|---|---|
| initI18n | O'chadi — server-side locale routing |
| initMenu (burger overlay) | `components/site/Header.tsx` (client) |
| initHeader (scrolled/hide, mini-progress) | `Header.tsx` ichida `useEffect` + rAF, cleanup bilan |
| initReveal (IO, 80ms stagger) | `useReveal()` hook — `[data-reveal]` xatti-harakati aynan |
| initCounters (odometer) | `useCounter()` hook / `<Stat>` komponenti |
| initMagnetic | `useMagnetic()` hook (`pointer:fine` guard) |
| initForms (focus ring, submit holati) | react-hook-form + mavjud CSS klasslar |
| initResponsive | CSS media query'larга ko'chadi (JS'siz) |
| initExtras (totop ring, FAB, sahifa o'tish fade) | `components/site/FloatingButtons.tsx` + Next.js `Link` o'tishlari uchun `template.tsx` fade |
| buildMap (+ samolyot auto-cycle, tooltip) | `components/site/WorldMap.tsx` (client) — `ExportCountry[]` props, mantiq aynan ko'chadi |
| Mahsulot filtr/qidiruv/modal (sahifa ichi) | `components/site/ProductCatalog.tsx` (client) — data server'дан props |
| Agent-anketa 5-qadam wizard | `components/site/AgentWizard.tsx` (client) — submit → server action → `Submission` |
| Scroll-highlight missiya, timeline chizish, parallax | `components/site/` kichik client komponentlar, xatti-harakat aynan |

Piksel-parity nazorati (5-bosqichда): har sahifa eski statik versiya (sfaduz.vercel.app) bilan yonma-yon skrinshot-solishtiruv — desktop 1280 va mobil 375, to'rt tilda emas, avval UZ.

---

## 8. Seed rejasi (`prisma/seed.ts`)

1. Admin user (`ADMIN_EMAIL`/`ADMIN_PASSWORD` env).
2. 5 Category → 28 Product (rasm: `sfad.uz/wp-content/uploads/2024/08/*.png` URL'lari).
3. 3 Article (UZ).
4. Barcha Block'lar (3-bo'limdagi jadval bo'yicha, UZ to'ldirilgan).
5. 15 ExportCountry (`MAP_PARTNERS`dan aynan).
6. Settings (2.5-bo'lim).
7. MenuItem'lar (header/footer).
8. PageSeo — 6 yo'l uchun boshlang'ich meta (statik `<title>`lardan).
9. Redirect'lar (5-bo'lim).

---

## 9. Ochiq savollar (tasdiq kerak)

1. **Baza:** Neon yoki Supabase? (`DATABASE_URL` kerak bo'ladi — 2-bosqichда. Lokal dev uchun men Docker Postgres bilan boshlayman.)
2. **Repo:** yangi repo (`sfad-cms`) ochamizmi, yoki mavjud `XudoyorXorazmiy/sfad` repo'ни almashtramizmi? Tavsiyam: yangi repo, eski statik sayt zaxira bo'lib qoladi.
3. **Loyiha joyi:** `~/developer/sfad-cms/` — ma'qulmi?
4. **Hero video:** hozirgi `sfad.uz/...YTDown...mp4` URL saqlansinmi yoki video faylни blob'ga yuklaymizmi?
5. **Ariza bildirishnomasi:** email (Resend) va/yoki Telegram bot — qaysi biri kerak, tokenlar bormi?
