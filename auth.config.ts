import type { NextAuthConfig } from "next-auth";

/**
 * Edge-xavfsiz konfiguratsiya — proxy.ts (middleware) shu faylni ishlatadi.
 * Prisma/bcrypt bu yerda YO'Q (ular faqat auth.ts da).
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin");
      const isLogin = pathname.startsWith("/admin/login");
      if (!isAdminArea || isLogin) return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "ADMIN" | "EDITOR";
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
  providers: [], // auth.ts da to'ldiriladi
} satisfies NextAuthConfig;
