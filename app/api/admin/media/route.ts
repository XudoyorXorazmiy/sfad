import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, url: true, filename: true, mimeType: true },
  });
  return NextResponse.json({ items });
}
