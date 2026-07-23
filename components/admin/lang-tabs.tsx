"use client";

import { createContext, useContext, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LangCtx = createContext<{
  lang: Locale;
  setLang: (l: Locale) => void;
}>({ lang: "uz", setLang: () => {} });

export function useLang() {
  return useContext(LangCtx);
}

/**
 * Tahrir formalarining tepasidagi til tab'lari (UZ | RU | EN | AR).
 * Ichidagi <LocField> lar faol tilga mos maydonni ko'rsatadi.
 */
export function LangTabs({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Locale>("uz");
  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <div className="mb-4 inline-flex rounded-lg border bg-white p-0.5">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-bold uppercase transition-colors",
              lang === l
                ? "bg-[#C8102E] text-white"
                : "text-neutral-500 hover:text-neutral-900",
            )}
          >
            {l}
            {l === "uz" && <span className="ml-0.5 text-[9px]">*</span>}
          </button>
        ))}
      </div>
      {children}
    </LangCtx.Provider>
  );
}

/**
 * 4 tilli maydon: barcha tillar uchun input render qilinadi (forma submit'ida
 * hammasi ketadi), lekin faqat faol til ko'rinadi.
 */
export function LocField({
  render,
}: {
  render: (locale: Locale, hidden: boolean) => React.ReactNode;
}) {
  const { lang } = useLang();
  return (
    <>
      {LOCALES.map((l) => (
        <div key={l} className={cn(l !== lang && "hidden")}>
          {render(l, l !== lang)}
        </div>
      ))}
    </>
  );
}
