import { Unbounded, Manrope, Cairo } from "next/font/google";
import "./site.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${unbounded.variable} ${manrope.variable} ${cairo.variable} sfad-site`}>
      {children}
    </div>
  );
}
