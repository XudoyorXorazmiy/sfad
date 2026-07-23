import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

/** Server action/route ichida ADMIN tekshiruvi */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Avtorizatsiya talab qilinadi");
  if (session.user.role !== "ADMIN") throw new Error("Faqat ADMIN uchun");
  return session;
}

/** Har qanday kirgan foydalanuvchi (ADMIN yoki EDITOR) */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Avtorizatsiya talab qilinadi");
  return session;
}
