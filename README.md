# Handoff: SFAD konditer fabrikasi — korporativ B2B eksport sayti

## Overview
Bu — **SFAD** (1998 yildan faoliyat yurituvchi O'zbekiston konditer fabrikasi) uchun ko'p sahifali korporativ marketing/eksport sayti. Maqsad: xalqaro distribyutorlar va agentlarni jalb qilish — mahsulot assortimentini ko'rsatish, eksport geografiyasini interaktiv xaritada namoyish etish va agent-anketa orqali lidlarni yig'ish.

6 ta sahifa:
1. **Bosh sahifa** (`index` / `SFAD Bosh Sahifa`) — hero, kompaniya, mahsulotlar, eksport xaritasi, sertifikatlar, CTA, footer.
2. **Mahsulotlar** (`products`) — filtrlanadigan/qidiriladigan mahsulot katalogi + quick-view modal.
3. **Fabrika haqida** (`about`) — kompaniya, missiya, qadriyatlar, tarix lentasi, sertifikatlar.
4. **Eksport** (`export`) — afzalliklar, interaktiv jahon xaritasi, menejer + FAQ akkordeon, 5 qadamli agent-anketa, qadoq formatlari.
5. **Yangiliklar** (`news`) — featured + grid maqolalar, maqola shabloni (o'qish progress-bar).
6. **Kontaktlar** (`contacts`) — kontakt kartalari, aloqa formasi, Google Maps embed.

Interfeys tili: **O'zbekcha** (standart). Til almashtirgich mavjud: UZ / RU / EN / AR (AR uchun RTL). Hozircha faqat navigatsiya/footer kalitlari tarjima qilingan; sahifa asosiy kontenti o'zbekcha statik.

## About the Design Files
Ushbu paketdagi fayllar — **HTML'da yaratilgan dizayn namunalari (referens)**: mo'ljallangan ko'rinish va xatti-harakatni ko'rsatuvchi prototiplar, to'g'ridan-to'g'ri ko'chiriladigan production kod EMAS.

Vazifa — bu HTML dizaynlarni **maqsadli kod bazasining mavjud muhitida qayta yaratish** (masalan Next.js/React, Nuxt/Vue, SvelteKit va h.k.), o'sha muhitning o'rnatilgan pattern va kutubxonalaridan foydalanib. Agar muhit hali mavjud bo'lmasa — loyiha uchun eng mos framework tanlab (marketing sayti uchun **Next.js (App Router) + TypeScript** tavsiya etiladi, chunki SEO va statik generatsiya muhim), dizaynlarni o'sha yerda amalga oshiring.

Prototiplar "Design Component" (`.dc.html`) formatida yozilgan — bu ichki dizayn muhiti formati. `standalone_html/` papkasidagi fayllar esa oddiy brauzerda ochiladigan, o'zi-yetarli (inline) HTML nusxalari — vizual referens sifatida bevosita ochib ko'rish uchun eng qulayi.

## Fidelity
**High-fidelity (hifi)** — yakuniy ranglar, tipografiya, oraliqlar, radiuslar, soyalar va interaksiyalar aniq belgilangan. UI'ni kod bazasining mavjud kutubxonalari yordamida piksel darajasida qayta yarating. Quyidagi barcha o'lchov/rang/tipografiya qiymatlari yakuniy.

---

## Design Tokens

Prototiplarda `:root` CSS o'zgaruvchilari sifatida aniqlangan. Har bir sahifa `<style>`ida takrorlanadi.

### Ranglar
| Token | Hex | Ishlatilishi |
|---|---|---|
| `--sfad-red` | `#C8102E` | Asosiy brend rangi (CTA, aksentlar, aktiv holatlar) |
| `--sfad-red-dark` | `#9E0C24` | Hover / gradient ikkinchi to'xtash |
| `--sfad-gold` | `#C9A24B` | Ikkilamchi aksent (eyebrow, ikonkalar, badge) |
| `--cream` | `#FAF7F2` | Asosiy sahifa foni (issiq oq) |
| `--white` | `#FFFFFF` | Karta fonlari, alternativ seksiya foni |
| `--soft` | `#F3EDE4` | Uchinchi fon (bej), rasm-zona fonlari |
| `--ink` | `#1D1D1D` | Asosiy matn, footer foni |
| `--muted` | `#6F6F6F` | Ikkilamchi matn |
| `--line` | `rgba(0,0,0,.07)` | Chegaralar, ajratgichlar |

**Fon ritmi qoidasi:** seksiyalar navbat bilan oq → krem → soft-bej. Ketma-ket ikki seksiya bir xil fonda bo'lmasin. To'q fon (`--ink`) faqat footerda.

Oltin badge foni: `rgba(201,162,75,.12)`, matni `#8F6E28`.

### Tipografiya
Ikki Google Font oilasi:
- **Unbounded** (500/600/700/800) — sarlavhalar, raqamlar, brend-aksent matnlar. `letter-spacing: -0.02em` katta sarlavhalarda.
- **Manrope** (400/500/600/700/800) — asosiy matn, UI, tugmalar.
- **Cairo** (400/600/700) — faqat arab tili (RTL) uchun fallback.

```
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
```

Tipografiya shkalasi (clamp bilan responsiv):
| Element | Font | Weight | Size |
|---|---|---|---|
| Sahifa-hero H1 | Unbounded | 800 | `clamp(2.2rem, 5vw, 3.8rem)` / line-height 1.08 |
| Seksiya H2 | Unbounded | 700 | `clamp(1.8rem, 3.4vw, 2.8rem)` |
| Karta sarlavha H3 | Unbounded | 600 | 17–18px |
| Eyebrow | Manrope | 700 | 12–13px, uppercase, `letter-spacing: .14em`, `--sfad-gold` |
| Sub-matn | Manrope | 400 | `1.05–1.15rem`, line-height 1.7, `--muted`, max-width 560–640px |
| Body / UI | Manrope | 400–600 | 14–15px |
| Tarix yil raqami | Unbounded | 800 | 28px, `--sfad-red` |
| Afzallik fon-raqami | Unbounded | 800 | 72px, `rgba(29,29,29,.06)` |

### Oraliqlar va ritm
- Konteyner: `max-width: 1240px` (header/footer 1320px), yon padding `clamp(20px, 4vw, 48px)`.
- Seksiya vertikal padding: `clamp(72px, 9vw, 128px)`.
- Sarlavha-blokdan kontentgacha: `clamp(40px, 5vw, 64px)`.
- Grid gap: 20–24px.

### Border radius
| Qiymat | Ishlatilishi |
|---|---|
| 8px | Kichik badge |
| 12px | Input, textarea |
| 14px | Rasm konteyneri (karta ichida), primary tugma (to'rtburchak variant) |
| 16px | Suzuvchi mini-karta |
| 20px | Standart karta |
| 24px | Katta rasm-karta, forma-karta |
| 28px | CTA panel |
| 99px / 999px | Pill tugma, chip, til-switcher |

### Soyalar
| Kontekst | Qiymat |
|---|---|
| Karta default | `0 2px 10px rgba(29,29,29,.05)` |
| Karta hover | `0 24px 60px rgba(29,29,29,.10)` |
| Tugma (qizil) | `0 10px 24px rgba(200,16,46,.22)` → hover `0 16px 40px rgba(200,16,46,.28)` |
| CTA panel | `0 40px 90px rgba(158,12,36,.28)` |
| Modal karta | `0 50px 120px rgba(0,0,0,.35)` |
| Header (scrolled) | `0 8px 30px rgba(29,29,29,.07)` |

### Animatsiya tokenlari
| Token | Qiymat | Ishlatilishi |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22, 1, .36, 1)` | Asosiy easing (deyarli hamma joyda) |
| `--ease-spring` | `cubic-bezier(.34, 1.56, .64, 1)` | "Pop" mikro-momentlar (chip aktiv, FAB) |
| `--dur-fast` | `.25s` | |
| `--dur` | `.5s` | |
| `--dur-slow` | `.9s` | Scroll-reveal |

**Qoida:** faqat `transform` / `opacity` / `filter` animatsiya qilinadi (layout thrash yo'q). Barcha animatsiyalar `prefers-reduced-motion: reduce` da o'chadi.

---

## Umumiy komponentlar (barcha sahifalarda bir xil)

### Header (sticky)
- `position: sticky; top: 0; z-index: 70`. Fon `rgba(255,255,255,0.78)` + `backdrop-filter: blur(16px) saturate(1.3)`. Pastki chegara `--line`.
- Ichki: `max-width: 1320px`, balandlik 76px (desktop), padding `0 28px`, flex, gap 28px.
- Tarkib (chapdan): logo (`uploads/SFAD rang.png`, h44px) → nav linklar (5 ta, Manrope 600 14.5px; aktiv link `--sfad-red`) → spacer → til-switcher (pill, 4 tugma) → telefon `+998 (95) 146-66-66` → CTA pill tugma → burger.
- **Smart behavior:** scroll > 40px → `.scrolled`: balandlik 76→64px, soya chiqadi, fon `rgba(255,255,255,.88)`. Pastga scroll (>500px) → header `translateY(-100%)` bilan yashirinadi; tepaga scroll → qaytadi.
- **Header mini-progress:** header pastki chetida 2px `--sfad-red` chiziq, sahifa scroll progressi bilan `transform: scaleX()` orqali chapdan to'ladi (rAF).
- Mobil (`max-width: 900px`): balandlik 64px, logo h36px, nav va til-switcher yashirin, telefon yashirin; burger orqali overlay menyu.

### Navigation overlay (burger menyu)
- `position: fixed; inset: 0; z-index: 80`. Fon `rgba(250,247,242,0.9)` + `blur(24px)`. `opacity` bilan ochiladi (`.5s --ease-out`).
- Katta linklar: Unbounded 700, `clamp(1.9rem, 5vw, 3.8rem)`. Hover: `--sfad-red` + `translateX(14px)`.
- Mobilda til-switcher shu overlayda ko'rinadi.

### Footer
- Fon `--ink`, matn `rgba(255,255,255,.75)`, padding `clamp(60px,7vw,90px) 0 36px`.
- 3 ustunli grid: logo+tagline (`uploads/SFAD oq.png`) · Bo'limlar linklari · Kontaktlar. Ostida © qatori markazda.
- Bo'lim sarlavhalari: Manrope 700 12.5px uppercase `letter-spacing:.16em`, `--sfad-gold`.

### Tugmalar
- **Primary (qizil):** fon `--sfad-red`, oq matn, radius 14px (yoki 99px pill), padding `16px 28px`, Manrope 600. Hover: `--sfad-red-dark` + `translateY(-2px)` + kuchli soya. `data-sheen` atributi — hover'da chapdan-o'ngga o'tuvchi yorug'lik (`::after`, skewX(-20deg) gradient, `.85s`).
- **Secondary (outline):** `1.5px solid --ink` chegara, shaffof fon. Hover: fon `--ink`, matn `--cream`.
- **Magnetic (desktop):** `data-magnetic` atributi — kursor yaqinlashganda tugma kursor tomon ~4–6px siljiydi (`mousemove`, offset × 0.18/0.28), chiqqanda spring bilan qaytadi. Faqat `pointer: fine`.
- **Ghost/text ("Batafsil →"):** `--sfad-red` matn + strelka; hover'da strelka 6px o'ngga.

### Karta (universal anatomiya)
- Oq fon, `1px solid --line`, radius 20px, padding 24–28px, default soya.
- Hover: `translateY(-8px)`, kuchli soya, fon ba'zan `--cream`ga o'tadi. Transition `.45s --ease-out`.
- Rasmli karta: rasm konteyneri `overflow: hidden`, radius 14px; hover'da rasm `scale(1.06)`.
- 3D tilt (desktop): `mousemove` bo'yicha max ±6° `rotateX/rotateY` + `perspective(700–800px)`, rAF.

### Chip / Badge
- **Filtr chip:** radius 999px, padding 10px 18px, `1px --line`, Manrope 500 14px. Hover: chegara+matn qizil. Aktiv: fon `--sfad-red`, oq matn, `scale(1.04)` pop.
- **Info badge:** radius 8px, fon `rgba(201,162,75,.12)`, matn `#8F6E28`, 12px, inline SVG ikonka bilan.
- **Holat-badge** (mahsulot): "YANGI" (fon `--sfad-red`, oq), "XIT" (fon `--sfad-gold`, oq), "SHAKARSIZ" (shaffof, `1.5px solid #C9A24B` kontur, matn `#8F6E28`). Radius 99px, Manrope 800 10px.

### Forma elementlari
- Input/textarea: oq fon, `1px --line`, radius 12px, padding 14–16px, Manrope 15px. Focus: chegara `--sfad-red` + `0 0 0 3px rgba(200,16,46,.12)` ring (`.25s`).
- Label: 13px, 600, input tepasida.
- Submit: bosilganda matn "✓ Yuborildi"ga o'zgaradi (backend yo'q), forma yengil `scale(.99→1)` "nafas" oladi.

### Global suzuvchi elementlar (barcha sahifada, `sfad-inner.js` `initExtras`)
- **Scroll-to-top (progress halqali):** o'ng-past, 24px chetdan (mobil 16px). 48px oq doira, soyali. Atrofida SVG halqa (`r=21`, `stroke-dasharray`/`dashoffset`) — scroll progressi bilan `--sfad-red` chiziq to'ladi. 600px scrolldan keyin fade+scale bilan chiqadi. Bosilganda silliq tepaga. z-index 72.
- **Tezkor aloqa FAB:** chap-past. Asosiy 52px qizil doira (telefon ikonkasi, 4s pulse-halqa). Bosilganda 2 mini-tugma (42px oq doira) spring bilan pop: Qo'ng'iroq (`tel:+998951466666`) va Telegram (`https://t.me/sfaduzb`). Qayta bosilsa yig'iladi, asosiy tugma `rotate(90deg)`. z-index 72.
- **Sahifalararo o'tish:** ichki `.html` havola bosilganda `sessionStorage` bayrog'i qo'yiladi, body `.25s` fade-out (`opacity` + `translateY(8px)`) → navigatsiya; yangi sahifada `.4s` fade-in. `target="_blank"`, tashqi va anchor havolalarga tegilmaydi.

### Z-index tartibi
`header (70) < navigation overlay (80) < scroll-top / FAB (72)*` — *modal (85). Eslatma: modal FAB ustidan, header overlay-menyu ostidan.

---

## Screens / Views

### 1. Bosh sahifa
Hero (dark video fon, fallback yorug'), kompaniya + video modal, mahsulotlar (filtr, 3D tilt), interaktiv eksport xaritasi, sertifikatlar, qizil CTA, footer. Barcha komponentlar yuqoridagi umumiy anatomiyaga ergashadi. To'liq referens: `standalone_html/index.html`.

### 2. Mahsulotlar (`products`)
- **Sahifa-hero:** breadcrumb → H1 "Bizning **assortiment**" (aksent qizil) → sub → o'ngda "Katalogni yuklab olish" primary tugma. Fon: krem, o'ngda 8% opacity ulkan outline "SFAD" yozuvi (`-webkit-text-stroke`).
- **Boshqaruv paneli (sticky, `top: 76px`, z-index 40, oq blur):** chapda 2 tab (Kilogramm / Qadoqlangan — pastki 2px indikator) · qidiruv input (lupa ikonka) · natija soni "N ta mahsulot" · kategoriya chiplari (Barchasi/Shakarli pechenye/Galetli/Vafli/Choco/Bolalar uchun) — har chipda jonli hisob `(N)`.
- **Grid:** `repeat(auto-fill, minmax(250px, 1fr))`, gap 24px. Karta: kvadrat rasm-zona (`aspect-ratio: 1/1`, radial-gradient fon `#FBF8F2→#F0E9DE`), mahsulot PNG, holat-badge (burchakda), nom (Unbounded 600 17px), tavsif (2 satr clamp), 2 info-badge (srok 12 oy / massa). Kartalar 80ms stagger reveal.
- **Filtratsiya:** tab + qidiruv + kategoriya birgalikda. Chiquvchi kartalar `fade + scale(.96)`, kiruvchilar stagger. Dastlab 16 ta, "Yana ko'rsatish" tugmasi +12.
- **Quick-view modal** (karta bosilganda): fon `rgba(29,29,29,.45)` + `blur(6px)`. Karta `min(860px)`, 2 ustun grid, `scale(.94)→1` fade. Chapda katta rasm (float animatsiya), o'ngda kategoriya-chip + nom + tavsif + 3 badge (saqlash/massa/qadoq) + 2 tugma: "Katalogda ko'rish" (PDF) va "Buyurtma so'rovi" (bosilganda mini-forma: ism/telefon/izoh, mahsulot nomi avto → "✓ So'rov yuborildi"). Navigatsiya: ←/→ tugmalar, klaviatura ←/→, touch swipe. Yopish: X / fon / Esc. Ochiq payt `body` scroll qulf.
- **"Topilmadi" holati:** markazda 🍪 emoji + "Hech narsa topilmadi" + katalog tugmasi.
- **Oraliq banner:** to'liq kenglik qizil-gradient lenta "Katalogda 200+ nom" + tugma.
- **Mahsulot ma'lumotlari:** `prototypes/SFAD Mahsulotlar.dc.html` logika klassidagi `PRODUCTS` massivida (28 element: nom, fayl, kategoriya `cat`, massa `kg`, tavsif `d`, `pack` bayrog'i). Rasm bazasi: `https://sfad.uz/wp-content/uploads/2024/08/<fayl>.png`. **Brend nomlari tarjima qilinmaydi** (Бурёнка, Байрам, Ласточка va h.k.).

### 3. Fabrika haqida (`about`)
- Hero: H1 "**SFAD** konditer fabrikasi".
- Kompaniya haqida: 2 ustun (55/45). Chapda eyebrow+H2+matn+tugma; o'ngda rasm-karta (radius 24px, scroll-parallax `scale 1.12→1`), burchagida suzuvchi "20+ yillik tajriba" mini-karta (float animatsiya).
- Missiya: markazlashgan katta matn (Unbounded 500). **Scroll-highlight:** har so'z `--muted`dan boshlanib scroll progressi bilan `--ink`ga "yonadi"; kalit so'zlar ("shodlik", "tabassum") `--sfad-red`ga.
- Qadriyatlar: 3 karta (inline SVG oltin ikonka + nom + matn), stagger.
- Tarix lentasi: gorizontal timeline (4 nuqta; oltin chiziq scroll'da `scaleX 0→1` bilan chapdan-o'ngga chiziladi; mobilda vertikal). Nuqtalar: 1998 / 2005 / 2015 / Bugun.
- Sertifikatlar: `certs.-mobile.png` rasm + 2 izoh-karta (ISO 22000:2018, Halal; hover'da oltin chegara).
- Mini-kontakt band: 3 ikonkali karta (telefon/email/manzil).

### 4. Eksport (`export`) — eng muhim
- Hero: H1 "SFAD — pechenye, vafli va shokolad **eksportyori**". CTA "Agent bo'lish" → `#agent`ga silliq scroll.
- 4 afzallik karta: fon 72px xira raqam (01–04), oltin SVG ikonka, nom, matn. Hover'da raqam qizilroq. (01 Ishlab chiqaruvchi — 150 tonna/kun; 02 Logistika; 03 Eksport 15+ davlat; 04 Sifat — ISO/Halal.)
- **Interaktiv eksport xaritasi:** `world.svg` (inline SVG jahon xaritasi) `sfad-inner.js`'dagi `buildMap()` bilan quriladi. Toshkent hub (pulse halqalar), 15 davlatga auto-cycling samolyot (SVG `animateMotion`, 3.5s interval), arc yo'llar, hover/click bilan davlat highlight, davlat chiplari (bayroq + nom). Davlatlar `EXPORT_PARTNERS` massivida (`sfad-inner.js`): Qozog'iston, Qirg'iziston, Tojikiston, Turkmaniston, Rossiya, Xitoy, Mongoliya, Ozarbayjon, Armaniston, Gruziya, Belarus, Latviya, Iroq, Falastin, AQSh.
- Menejer-blok: chapda rasm-karta (grayscale, hover'da rang) + ism-karta ("Muxitdinov Dilshod Xojimuradovich"). O'ngda 4 akkordeon (`grid-template-rows: 0fr→1fr` silliq ochilish, "+" ikonka 45° aylanadi, bir vaqtda bittasi ochiq).
- **Agent-anketa** (`#agent`): krem fonda oq karta (radius 28px). 5 qadamli wizard: progress (5 nuqta + oltin chiziq to'ladi + "N/5"). Qadamlar gorizontal slide (chiquvchi chapga, kiruvchi o'ngdan). Qadamlar: (1) ism + murojaat radio; (2) telefon + email; (3) hudud radio-karta + shahar; (4) tajriba radio; (5) manba radio + izoh + rozilik checkbox. Har qadam validatsiyasi (bo'sh maydon → qizil chegara + xato matni). Oxirida "✓ Arizangiz qabul qilindi".
- Qadoq formatlari: 3 rasm-karta (Vaznda / Kartonli qutilarda / Shou-bokslarda). Rasm bazasi `https://sfad.uz/wp-content/uploads/2026/01/Frame-*.png`.

### 5. Yangiliklar (`news`)
- Hero: H1 "Yangiliklar".
- Featured karta: 2 ustun (rasm + sana-chip + H3 + tavsif + "Batafsil →").
- Grid: 2 oddiy karta (sana eyebrow + sarlavha).
- Maqola shabloni (`#article`): fixed o'qish progress-bar (3px, qizil, tepada); H2 + sana-chip + "3 daqiqa o'qish"; hero-rasm; matn ustuni `max-width: 720px`, 17px/1.8; iqtibos-blok (chap `3px --sfad-red` chiziq, oq fon); "Boshqa yangiliklar" 2 karta.
- Rasmlar hozircha CSS gradient placeholder (haqiqiy rasm yo'q).

### 6. Kontaktlar (`contacts`)
- Hero: H1 "Biz bilan **bog'laning**".
- 2 ustun (45/55). Chapda 4 kontakt-karta (oltin doira ichida oq ikonka): telefon (`tel:`), email (`mailto:`), manzil, ijtimoiy tarmoqlar (Instagram/Facebook/Telegram/LinkedIn — hover'da qizil + `translateY(-3px)`). O'ngda forma-karta (ism/telefon/izoh + "Ariza yuborish").
- Google Maps embed: `radius 24px` ramka, balandlik 420px. Koordinata `41.36230, 69.25332`.

---

## Interactions & Behavior (jamlanma)
- **Scroll-reveal:** `[data-reveal]` elementlari `opacity:0; translateY(28px)` → viewport'ga kirganda `in-view`. IntersectionObserver, bir marta (`unobserve`). Yonma-yon `data-reveal` sib'lar 80ms stagger. `sfad-inner.js` `initReveal()`.
- **Sanoq animatsiyasi:** `[data-counter]` — viewport'ga kirganda 0'dan ease-out kubik interpolatsiya bilan sanaladi (~1.8s), rAF. `initCounters()`.
- **Til almashtirish:** `[data-i18n]` / `[data-i18n-ph]` elementlari `sfad-data.js`'dagi `I18N` obyektidan kalit bo'yicha to'ldiriladi. Almashganda `.22s` fade. `localStorage['sfad-lang']`da saqlanadi. `dir` (RTL) va font oilasi ham almashadi.
- **Barcha JS-driven effektlar** (`tilt`, `magnetic`, `counter`, scroll-highlight, parallax) `matchMedia('(prefers-reduced-motion: reduce)')` bilan o'chiriladi.
- Scroll listenerlar `passive: true`, `mousemove`/scroll rAF bilan throttle.
- Rasmlar `loading="lazy"` (hero'dan tashqari), rasm-zonalarda `aspect-ratio` (layout sakramaydi).

## State Management (recreate uchun)
Marketing sayti — asosan statik. Kerakli holat:
- **Mahsulotlar:** `{ tab: 'kg'|'pack', cat: string, q: string, shown: number }` — filtr/qidiruv/pagination. Quick-view modal: joriy mahsulot indeksi + ochiq/yopiq.
- **Eksport anketa:** joriy qadam (1–5) + maydon qiymatlari + validatsiya holati + yuborilgan bayrog'i. Xarita: joriy aktiv davlat indeksi + auto-cycle timer + pauza.
- **Til:** joriy til (`localStorage` bilan saqlanadi).
- **Global:** scroll pozitsiyasi (progress hisoblash uchun), FAB ochiq/yopiq.
Backend yo'q — barcha formalar frontend-only ("✓" holati). Recreate paytida real endpoint ulash kerak.

## Assets
- **Logolar:** `prototypes/uploads/SFAD rang.png` (rangli, header), `prototypes/uploads/SFAD oq.png` (oq, footer). `uploads/` papkasida boshqa brend rasmlari ham bor.
- **Jahon xaritasi:** `prototypes/world.svg` — inline SVG, davlatlar `id` bilan (ISO kodlari: `UZ`, `KZ`, `RU` va h.k.). Xarita mantiqi `sfad-inner.js` `buildMap()`da.
- **Mahsulot rasmlari:** onlayn, `https://sfad.uz/wp-content/uploads/2024/08/` (28 PNG). Production'da o'z serverga ko'chirish tavsiya etiladi.
- **Qadoq rasmlari:** `https://sfad.uz/wp-content/uploads/2026/01/Frame-1618877203/206/207.png`.
- **Sertifikat rasmi:** `https://sfad.uz/wp-content/uploads/2024/08/certs.-mobile.png`.
- **Ikonkalar:** barchasi inline SVG (stroke-based, Lucide uslubida) — tashqi ikonka kutubxonasi yo'q.
- **Menejer fotosi:** hozircha placeholder (haqiqiy foto kerak).
- **Yangilik rasmlari:** hozircha CSS gradient placeholder.
- **Hero video:** haqiqiy MP4 URL hali qo'yilmagan (fallback yorug' fon).

## Files
Bu paketda:
- `prototypes/` — asl `.dc.html` dizayn komponentlari + umumiy `sfad-inner.js` (barcha interaksiya/animatsiya mantiqi), `sfad-data.js` (i18n + xarita ma'lumotlari), `world.svg`, `uploads/` (logolar/brend rasmlar).
- `standalone_html/` — oddiy brauzerda ochiladigan o'zi-yetarli HTML nusxalari (`index.html`, `products.html`, `about.html`, `export.html`, `news.html`, `contacts.html`). **Vizual referens uchun eng qulayi — shu fayllarni brauzerda oching.**

**Boshlash tavsiyasi:** `standalone_html/*.html` fayllarini brauzerda ochib har sahifani ko'ring, so'ng `prototypes/sfad-inner.js`'ni o'qib animatsiya/interaksiya mantig'ini tushuning, keyin maqsadli framework'da qayta quring.
