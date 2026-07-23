// SFAD ichki sahifalar — umumiy chrome va helperlar
import { I18N, TASHKENT, MAP_PARTNERS } from './sfad-data.js';
export const EASE = 'cubic-bezier(0.22,1,0.36,1)';

export function initChrome(reduced) {
  initI18n(); initMenu(); initHeader(); initReveal(reduced); initCounters(reduced); initMagnetic(reduced); initForms(); initResponsive(); initExtras(reduced);
}

export function initExtras(reduced) {
  if (document.getElementById('sfad-totop')) return;
  // 1.4 header mini-progress
  const header = document.getElementById('site-header');
  let hbar = null;
  if (header) {
    hbar = document.createElement('div');
    hbar.style.cssText = 'position:absolute;left:0;bottom:-1px;height:2px;width:100%;background:var(--sfad-red);transform:scaleX(0);transform-origin:left center;pointer-events:none';
    header.appendChild(hbar);
  }
  // 1.1 scroll-to-top with progress ring
  const R = 21, C = 2 * Math.PI * R;
  const top = document.createElement('button');
  top.id = 'sfad-totop';
  top.setAttribute('aria-label', 'Tepaga');
  top.style.cssText = 'position:fixed;inset-inline-end:24px;bottom:24px;width:48px;height:48px;border-radius:50%;border:0;background:var(--white);box-shadow:0 14px 36px rgba(29,29,29,.16);cursor:pointer;z-index:72;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.7);pointer-events:none;transition:opacity .4s ' + EASE + ',transform .4s ' + EASE;
  top.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="24" cy="24" r="' + R + '" fill="none" stroke="rgba(0,0,0,.07)" stroke-width="2.5"></circle><circle id="sfad-topring" cx="24" cy="24" r="' + R + '" fill="none" stroke="var(--sfad-red)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"></circle></svg><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="position:relative;transition:transform .3s ' + EASE + '"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
  document.body.appendChild(top);
  top.addEventListener('mouseenter', () => { top.lastElementChild.style.transform = 'translateY(-2px)'; });
  top.addEventListener('mouseleave', () => { top.lastElementChild.style.transform = ''; });
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  const ring = top.querySelector('#sfad-topring');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const p = Math.min(scrollY / max, 1);
      if (hbar) hbar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      ring.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
      const on = scrollY > 600;
      top.style.opacity = on ? '1' : '0';
      top.style.transform = on ? 'scale(1)' : 'scale(.7)';
      top.style.pointerEvents = on ? 'auto' : 'none';
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  // 1.2 quick-contact FAB
  const fab = document.createElement('div');
  fab.style.cssText = 'position:fixed;inset-inline-start:24px;bottom:24px;z-index:72;display:flex;flex-direction:column-reverse;align-items:center;gap:12px';
  if (innerWidth < 700) fab.style.insetInlineStart = '16px';
  const mkMini = (href, label, svg) => {
    const a = document.createElement('a');
    a.href = href; a.setAttribute('aria-label', label);
    if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
    a.style.cssText = 'width:42px;height:42px;border-radius:50%;background:var(--white);box-shadow:0 12px 30px rgba(29,29,29,.16);display:flex;align-items:center;justify-content:center;color:var(--sfad-red);opacity:0;transform:translateY(10px) scale(.6);pointer-events:none;transition:opacity .35s ' + EASE + ',transform .45s cubic-bezier(.34,1.56,.64,1)';
    a.innerHTML = svg;
    return a;
  };
  const call = mkMini('tel:+998951466666', "Qo'ng'iroq", '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"></path></svg>');
  const tg = mkMini('https://t.me/sfaduzb', 'Telegram', '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 3.4 2.8 10.8c-1 .4-1 1.4-.2 1.7l4.9 1.5 1.9 5.8c.2.7 1 .9 1.5.4l2.7-2.6 5 3.7c.6.4 1.4.1 1.6-.6l3.1-15.7c.2-1-.5-1.7-1.4-1.6zM8.5 13.7l9.5-6.5-7.5 7.6-.3 3.2z"></path></svg>');
  const main = document.createElement('button');
  main.setAttribute('aria-label', 'Tezkor aloqa');
  main.style.cssText = 'position:relative;width:52px;height:52px;border-radius:50%;border:0;background:var(--sfad-red);color:#fff;box-shadow:0 16px 40px rgba(200,16,46,.32);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .3s';
  main.innerHTML = (reduced ? '' : '<span style="position:absolute;inset:0;border-radius:50%;border:2px solid var(--sfad-red);animation:sfadFabPulse 4s ease-out infinite;pointer-events:none"></span>') + '<svg data-fab-icon="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .35s ' + EASE + '"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"></path></svg>';
  if (!document.getElementById('sfad-fab-style')) {
    const st = document.createElement('style');
    st.id = 'sfad-fab-style';
    st.textContent = '@keyframes sfadFabPulse{0%{transform:scale(1);opacity:.7}60%{transform:scale(1.55);opacity:0}100%{transform:scale(1.55);opacity:0}}';
    document.head.appendChild(st);
  }
  let fabOpen = false;
  main.addEventListener('click', () => {
    fabOpen = !fabOpen;
    [call, tg].forEach((b, i) => {
      b.style.transitionDelay = fabOpen ? (i * 60) + 'ms' : '0ms';
      b.style.opacity = fabOpen ? '1' : '0';
      b.style.transform = fabOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(.6)';
      b.style.pointerEvents = fabOpen ? 'auto' : 'none';
    });
    main.style.transform = fabOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  });
  fab.appendChild(main); fab.appendChild(call); fab.appendChild(tg);
  document.body.appendChild(fab);
  // 1.3 page transitions
  try {
    if (sessionStorage.getItem('sfad-nav')) {
      sessionStorage.removeItem('sfad-nav');
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity .4s ' + EASE;
      requestAnimationFrame(() => requestAnimationFrame(() => { document.body.style.opacity = '1'; }));
    }
  } catch (e) {}
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute('href') || '';
    if (!href.endsWith('.html') && !href.includes('.html#')) return;
    if (href.startsWith('http') || href.startsWith('#')) return;
    e.preventDefault();
    try { sessionStorage.setItem('sfad-nav', '1'); } catch (err) {}
    if (reduced) { location.href = href; return; }
    document.body.style.transition = 'opacity .25s ' + EASE + ',transform .25s ' + EASE;
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(8px)';
    setTimeout(() => { location.href = href; }, 250);
  });
}

function initI18n() {
  let lang = localStorage.getItem('sfad-lang') || 'uz';
  if (!I18N[lang]) lang = 'uz';
  const apply = (l, animate) => {
    const t = I18N[l]; if (!t) return;
    document.documentElement.lang = l;
    document.documentElement.dir = t.dir;
    document.body.style.fontFamily = l === 'ar' ? "'Cairo',Manrope,sans-serif" : "Manrope,'Cairo',sans-serif";
    const els = [...document.querySelectorAll('[data-i18n],[data-i18n-ph]')];
    const swap = () => els.forEach(el => {
      const k = el.getAttribute('data-i18n'), kp = el.getAttribute('data-i18n-ph');
      if (k && t[k] != null) el.textContent = t[k];
      if (kp && t[kp] != null) el.setAttribute('placeholder', t[kp]);
    });
    if (animate) {
      els.forEach(el => { el.style.transition = 'opacity .22s'; el.style.opacity = '0'; });
      setTimeout(() => { swap(); els.forEach(el => { el.style.opacity = '1'; }); }, 230);
    } else swap();
    document.querySelectorAll('[data-setlang]').forEach(b => {
      const on = b.getAttribute('data-setlang') === l;
      b.style.background = on ? 'var(--ink)' : 'transparent';
      b.style.color = on ? '#fff' : 'var(--ink)';
    });
    try { localStorage.setItem('sfad-lang', l); } catch (e) {}
  };
  apply(lang, false);
  document.querySelectorAll('[data-setlang]').forEach(b => b.addEventListener('click', () => apply(b.getAttribute('data-setlang'), true)));
}

function initMenu() {
  const ov = document.getElementById('menu-overlay');
  if (!ov) return;
  const open = v => { ov.style.opacity = v ? '1' : '0'; ov.style.pointerEvents = v ? 'auto' : 'none'; };
  const burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', () => open(true));
  const close = document.getElementById('menu-close');
  if (close) close.addEventListener('click', () => open(false));
  ov.querySelectorAll('a').forEach(a => a.addEventListener('click', () => open(false)));
}

function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const inner = header.querySelector('.hdr-inner');
  if (inner) inner.style.transition = 'height .35s ' + EASE;
  let lastY = window.scrollY, scrolled = false;
  const setScrolled = v => {
    if (scrolled === v) return; scrolled = v;
    header.style.boxShadow = v ? '0 8px 30px rgba(29,29,29,.07)' : 'none';
    header.style.background = v ? 'rgba(255,255,255,.88)' : 'rgba(255,255,255,0.78)';
    if (inner && innerWidth > 900) inner.style.height = v ? '64px' : '76px';
  };
  window.addEventListener('scroll', () => {
    const y = window.scrollY, down = y > lastY + 4, up = y < lastY - 4;
    setScrolled(y > 40);
    if (down && y > 500) header.style.transform = 'translateY(-100%)';
    else if (up || y < 200) header.style.transform = 'translateY(0)';
    lastY = y;
  }, { passive: true });
}

export function initReveal(reduced, root) {
  const els = [...(root || document).querySelectorAll('[data-reveal]')].filter(el => !el.dataset.revealed);
  if (reduced) { els.forEach(el => { el.dataset.revealed = '1'; }); return; }
  els.forEach(el => {
    el.dataset.revealed = '1';
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity .9s ${EASE}, transform .9s ${EASE}`;
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.hasAttribute && c.hasAttribute('data-reveal')) : [];
    if (sibs.length > 1) el.style.transitionDelay = Math.min(sibs.indexOf(el) * 80, 480) + 'ms';
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

export function initCounters(reduced) {
  const els = [...document.querySelectorAll('[data-counter]')];
  const run = el => {
    const target = +el.getAttribute('data-counter');
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1800;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .5 });
  els.forEach(el => io.observe(el));
}

export function initMagnetic(reduced) {
  if (reduced || !matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    if (el.dataset.mag) return; el.dataset.mag = '1';
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${dx * 0.18}px,${dy * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s ' + EASE;
      el.style.transform = 'translate(0,0)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });
}

function initForms() {
  document.querySelectorAll('form[data-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const btn = f.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = '✓ Yuborildi';
    btn.style.opacity = '.85';
    f.style.transition = 'transform .3s ' + EASE;
    f.style.transform = 'scale(.99)';
    setTimeout(() => { f.style.transform = 'scale(1)'; }, 180);
    f.querySelectorAll('input,textarea').forEach(i => { i.value = ''; });
    setTimeout(() => { btn.textContent = orig; btn.style.opacity = '1'; }, 2600);
  }));
}

function initResponsive() {
  const nav = document.getElementById('header-nav');
  const phone = document.querySelector('#site-header a[href^="tel:"]');
  const apply = () => {
    const w = innerWidth;
    if (nav) nav.style.display = w < 1280 ? 'none' : 'flex';
    if (phone) phone.style.display = w < 1000 ? 'none' : 'inline';
  };
  apply();
  window.addEventListener('resize', apply, { passive: true });
}

// ===== Eksport xaritasi (bosh sahifadagi bilan bir xil vizual) =====
export const EXPORT_PARTNERS = [
  { id:"KZ", name:"Qozog'iston",  flag:"🇰🇿", x:690.7, y:328.2 },
  { id:"KG", name:"Qirg'iziston", flag:"🇰🇬", x:684.3, y:329.7 },
  { id:"TJ", name:"Tojikiston",   flag:"🇹🇯", x:668.0, y:345.6 },
  { id:"TM", name:"Turkmaniston", flag:"🇹🇲", x:638.7, y:347.8 },
  { id:"RU", name:"Rossiya",      flag:"🇷🇺", x:580.5, y:273.9 },
  { id:"CN", name:"Xitoy",        flag:"🇨🇳", x:801.7, y:340.8 },
  { id:"MN", name:"Mongoliya",    flag:"🇲🇳", x:775.0, y:309.6 },
  { id:"AZ", name:"Ozarbayjon",   flag:"🇦🇿", x:614.8, y:338.9 },
  { id:"AM", name:"Armaniston",   flag:"🇦🇲", x:599.8, y:339.7 },
  { id:"GE", name:"Gruziya",      flag:"🇬🇪", x:600.6, y:334.0 },
  { id:"BY", name:"Belarus",      flag:"🇧🇾", x:546.0, y:282.0 },
  { id:"LV", name:"Latviya",      flag:"🇱🇻", x:536.0, y:268.0 },
  { id:"IQ", name:"Iroq",         flag:"🇮🇶", x:592.0, y:363.0 },
  { id:"PS", name:"Falastin",     flag:"🇵🇸", x:571.5, y:366.5 },
  { id:"US", name:"AQSh",         flag:"🇺🇸", x:267.0, y:337.8 }
];

export async function buildMap(reduced, partners) {
  const mount = document.getElementById('map-mount');
  if (!mount || mount.dataset.built) return;
  mount.dataset.built = '1';
  const RED = '#C8102E', GOLD = '#C9A24B', INK = '#3A3F52';
  const VB = { x: 150, y: 235, w: 762, h: 250 };
  const PARTNERS = partners || MAP_PARTNERS;

  let svgText;
  try { const wu = (window.__resources && window.__resources.worldSvg) || 'world.svg'; svgText = await (await fetch(wu)).text(); }
  catch (e) { const l = document.getElementById('map-loading'); if (l) l.textContent = ''; return; }
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  const NS = 'http://www.w3.org/2000/svg';
  svg.setAttribute('viewBox', `${VB.x} ${VB.y} ${VB.w} ${VB.h}`);
  svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.setAttribute('style', 'width:100%;height:auto;display:block');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const partnerIds = new Set(PARTNERS.map(p => p.id));
  [...svg.querySelectorAll('path')].forEach((el, i) => {
    const base = i % 2 ? '#FBFCFE' : '#F2F5FB';
    el.dataset.base = base;
    el.style.fill = base;
    el.style.stroke = 'rgba(200,16,46,.22)';
    el.style.strokeWidth = '0.5';
    el.classList.add('sfad-country');
    if (partnerIds.has(el.id)) el.classList.add('sfad-partner');
  });
  const uz = svg.getElementById('UZ');
  if (uz) { uz.style.fill = RED; uz.dataset.base = RED; uz.classList.remove('sfad-partner'); }

  const overlay = document.createElementNS(NS, 'g');
  svg.appendChild(overlay);
  const arc = document.createElementNS(NS, 'path');
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', INK);
  arc.setAttribute('stroke-width', '1.4');
  arc.setAttribute('stroke-dasharray', '4 6');
  arc.setAttribute('stroke-linecap', 'round');
  arc.setAttribute('opacity', '0');
  if (!reduced) arc.style.animation = 'dashFlow 1s linear infinite';
  overlay.appendChild(arc);
  let planeG = null;

  const hub = document.createElementNS(NS, 'g');
  hub.setAttribute('transform', `translate(${TASHKENT.x},${TASHKENT.y})`);
  hub.innerHTML = `<circle r="6" fill="none" stroke="${RED}" stroke-width="1" style="${reduced?'':'animation:pulseRing 2.4s ease-out infinite'};transform-origin:center;transform-box:fill-box"></circle><circle r="9" fill="none" stroke="${RED}" stroke-width=".7" style="${reduced?'':'animation:pulseRing 2.4s ease-out .6s infinite'};transform-origin:center;transform-box:fill-box"></circle><circle r="3" fill="#fff" stroke="${RED}" stroke-width="1.6"></circle><text y="-10" text-anchor="middle" style="font:700 8px Manrope,sans-serif;fill:${RED};paint-order:stroke;stroke:#fff;stroke-width:2.4px;stroke-linejoin:round">Toshkent</text>`;
  overlay.appendChild(hub);

  const mobile = innerWidth < 760;
  PARTNERS.forEach(p => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', p.x); t.setAttribute('y', p.y - 5);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('style', `font:600 6.4px Manrope,sans-serif;fill:#8A8F9C;paint-order:stroke;stroke:#fff;stroke-width:1.8px;stroke-linejoin:round;pointer-events:none;opacity:${mobile?0:0.9}`);
    t.textContent = p.name;
    t.dataset.pid = p.id;
    overlay.appendChild(t);
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', '2');
    dot.setAttribute('fill', GOLD); dot.setAttribute('opacity', '.55');
    overlay.appendChild(dot);
  });

  const loading = mount.querySelector('#map-loading');
  if (loading) loading.remove();
  mount.insertBefore(svg, mount.firstChild);

  const tip = document.getElementById('map-tooltip');
  const arcPath = (a, b) => {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    return `M ${a.x} ${a.y} Q ${mx} ${my - dist * 0.22} ${b.x} ${b.y}`;
  };

  const chipWrap = document.getElementById('partner-chips');
  let cur = -1, timer = null, paused = false;
  PARTNERS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.i = i;
    b.style.cssText = 'display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--white);color:var(--ink);font:600 13px Manrope;padding:8px 15px;border-radius:99px;cursor:pointer;transition:all .3s';
    b.innerHTML = `<span style="font-size:15px">${p.flag}</span><span>${p.name}</span>`;
    b.addEventListener('click', () => { activate(i); paused = true; clearTimeout(timer); timer = setTimeout(() => { paused = false; cycle(); }, 8000); });
    chipWrap.appendChild(b);
  });

  function toPct(pt) { return { l: (pt.x - VB.x) / VB.w * 100, t: (pt.y - VB.y) / VB.h * 100 }; }

  function activate(i) {
    if (i === cur) return;
    if (cur >= 0) { const prev = svg.getElementById(PARTNERS[cur].id); if (prev) prev.style.fill = prev.dataset.base; }
    cur = i;
    const p = PARTNERS[i];
    const el = svg.getElementById(p.id);
    if (el) el.style.fill = GOLD;
    arc.setAttribute('d', arcPath(TASHKENT, p));
    arc.setAttribute('opacity', '1');
    const pos = toPct(p);
    tip.style.left = pos.l + '%'; tip.style.top = pos.t + '%';
    tip.innerHTML = `${p.flag}&nbsp; ${p.name}`;
    tip.style.opacity = '1';
    chipWrap.querySelectorAll('button').forEach(b => {
      const on = +b.dataset.i === i;
      b.style.background = on ? RED : 'var(--white)';
      b.style.color = on ? '#fff' : 'var(--ink)';
      b.style.borderColor = on ? RED : 'var(--line)';
    });
    overlay.querySelectorAll('text[data-pid]').forEach(t => { t.style.fill = t.dataset.pid === p.id ? RED : '#8A8F9C'; });
    if (!reduced) flyPlane(p);
  }

  function flyPlane(p) {
    if (planeG) planeG.remove();
    planeG = document.createElementNS(NS, 'g');
    const plane = document.createElementNS(NS, 'path');
    plane.setAttribute('d', 'M7,0 L-5,3.6 L-2.4,0 L-5,-3.6 Z');
    plane.setAttribute('fill', INK);
    planeG.appendChild(plane);
    const am = document.createElementNS(NS, 'animateMotion');
    am.setAttribute('dur', '1.45s');
    am.setAttribute('rotate', 'auto');
    am.setAttribute('fill', 'freeze');
    am.setAttribute('keyPoints', '0;1');
    am.setAttribute('keyTimes', '0;1');
    am.setAttribute('calcMode', 'spline');
    am.setAttribute('keySplines', '0.22 1 0.36 1');
    am.setAttribute('path', arcPath(TASHKENT, p));
    planeG.appendChild(am);
    overlay.appendChild(planeG);
    if (am.beginElement) am.beginElement();
  }

  function cycle() {
    if (paused) return;
    activate((cur + 1) % PARTNERS.length);
    timer = setTimeout(cycle, 3500);
  }

  PARTNERS.forEach((p, i) => {
    const el = svg.getElementById(p.id);
    if (el) el.addEventListener('click', () => { activate(i); paused = true; clearTimeout(timer); timer = setTimeout(() => { paused = false; cycle(); }, 8000); });
  });

  let started = false;
  const start = () => { if (started) return; started = true; activate(0); timer = setTimeout(cycle, 3500); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { start(); io.disconnect(); } }), { threshold: 0.01 });
  io.observe(mount);
  setTimeout(start, 1200);
}
