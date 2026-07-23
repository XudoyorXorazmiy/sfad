import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// /admin/** himoyasi — sessiyasiz so'rovlar /admin/login ga yo'naltiriladi.
// (Next 16: middleware.ts o'rniga proxy.ts)
export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
