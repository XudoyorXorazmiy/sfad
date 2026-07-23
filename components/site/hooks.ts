"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(.22,1,.36,1)";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * [data-reveal] elementlari viewportga kirganda ochiladi (80ms stagger).
 * Statik saytdagi initReveal() bilan bir xil xatti-harakat.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (els.length === 0) return;

    if (reducedMotion()) {
      els.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity .9s ${EASE}, transform .9s ${EASE}`;
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          // yonma-yon sib'lar orasida 80ms stagger
          const siblings = el.parentElement
            ? Array.from(el.parentElement.children).filter((c) =>
                c.hasAttribute("data-reveal"),
              )
            : [];
          const idx = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${idx * 80}ms`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** [data-counter] — 0 dan berilgan songacha ease-out bilan sanaydi */
export function useCounters() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-counter]"),
    );
    if (els.length === 0) return;

    const run = (el: HTMLElement) => {
      const target = Number(el.dataset.counter ?? "0");
      const suffix = el.dataset.suffix ?? "";
      if (reducedMotion() || !target) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const dur = 1800;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.5 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** [data-magnetic] — kursorga engil tortiladi (faqat pointer:fine) */
export function useMagnetic() {
  useEffect(() => {
    if (reducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-magnetic]"),
    );
    const cleanups: (() => void)[] = [];
    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      };
      const leave = () => {
        el.style.transition = `transform .5s cubic-bezier(.34,1.56,.64,1)`;
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 500);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);
}

/** Header: scrollda kichrayadi, pastga scrollda yashirinadi + progress chiziq */
export function useHeaderBehavior() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    const bar = document.getElementById("header-progress");
    if (!header) return;
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 40);
      if (y > 500 && y > last) header.style.transform = "translateY(-100%)";
      else header.style.transform = "translateY(0)";
      last = y;
      if (bar) {
        const max = document.body.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
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
}

/** Barcha umumiy sayt effektlari */
export function useSiteEffects() {
  useReveal();
  useCounters();
  useMagnetic();
  useHeaderBehavior();
}
