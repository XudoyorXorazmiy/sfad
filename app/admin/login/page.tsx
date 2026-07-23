import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "SFAD Admin — Kirish" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-[#C8102E]">
            SFAD
          </div>
          <p className="mt-1 text-sm text-neutral-500">Boshqaruv paneli</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
