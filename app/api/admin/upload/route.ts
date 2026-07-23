import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUpload } from "@/lib/upload";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Avtorizatsiya yo'q" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string) || "pages";
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fayl topilmadi" }, { status: 400 });
  }
  if (!["products", "news", "pages"].includes(folder)) {
    return NextResponse.json({ ok: false, error: "Noto'g'ri papka" }, { status: 400 });
  }

  const res = await saveUpload(file, folder);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
