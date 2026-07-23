import {
  getMenu, getSettings, setting,
} from "@/lib/site";
import type { Locale } from "@/lib/i18n";
import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { FloatingButtons } from "./floating-buttons";
import { SiteEffects } from "./site-effects";

/** Header + Footer + suzuvchi tugmalar — hammasi bazadan */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [headerMenu, footerMenu, s] = await Promise.all([
    getMenu("header", locale),
    getMenu("footer", locale),
    getSettings(),
  ]);

  const socials = [
    { label: "Instagram", url: setting(s, "instagram") },
    { label: "Telegram", url: setting(s, "telegram") },
    { label: "Facebook", url: setting(s, "facebook") },
    { label: "LinkedIn", url: setting(s, "linkedin") },
  ].filter((x) => x.url);

  return (
    <>
      <SiteEffects />
      <SiteHeader
        locale={locale}
        menu={headerMenu}
        logo={setting(s, "logoColor")}
        phone={setting(s, "phone")}
        phoneRaw={setting(s, "phoneRaw")}
        catalogLabel="Katalog"
      />
      <main>{children}</main>
      <SiteFooter
        locale={locale}
        menu={footerMenu}
        logoWhite={setting(s, "logoWhite")}
        tagline={setting(s, "footerTag", locale)}
        rights={setting(s, "footerRights", locale)}
        phone={setting(s, "phone")}
        phoneRaw={setting(s, "phoneRaw")}
        email={setting(s, "email")}
        address={setting(s, "address", locale)}
        socials={socials}
      />
      <FloatingButtons
        phoneRaw={setting(s, "phoneRaw")}
        telegram={setting(s, "telegram")}
      />
    </>
  );
}
