"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" };
    }
    throw err; // NEXT_REDIRECT shu yerdan o'tadi
  }
}
