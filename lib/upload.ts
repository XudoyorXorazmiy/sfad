import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
}

export async function saveUpload(
  file: File,
  folder: string = "pages",
): Promise<{ ok: true; media: { id: string; url: string } } | { ok: false; error: string }> {
  if (file.size > MAX_SIZE) return { ok: false, error: "Fayl 5MB dan katta" };
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, error: "Faqat jpg/png/webp/svg/pdf" };

  let buffer = Buffer.from(await file.arrayBuffer());
  let finalExt = ext;
  let width: number | null = null;
  let height: number | null = null;

  // Rasterlarni WebP ga o'tkazamiz + o'lchamni cheklaymiz
  if (["jpg", "png", "webp"].includes(ext)) {
    const img = sharp(buffer).rotate();
    const meta = await img.metadata();
    const resized = img.resize({
      width: Math.min(meta.width ?? 2000, 2000),
      withoutEnlargement: true,
    });
    buffer = Buffer.from(await resized.webp({ quality: 85 }).toBuffer());
    finalExt = "webp";
    const outMeta = await sharp(buffer).metadata();
    width = outMeta.width ?? null;
    height = outMeta.height ?? null;
  }

  const base = sanitizeName(file.name);
  const filename = `${base}-${Date.now().toString(36)}.${finalExt}`;
  let url: string;

  if (process.env.UPLOAD_DRIVER === "blob" && process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      contentType: finalExt === "webp" ? "image/webp" : file.type,
    });
    url = blob.url;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    url = `/uploads/${folder}/${filename}`;
  }

  const media = await prisma.media.create({
    data: {
      url,
      filename,
      mimeType: finalExt === "webp" ? "image/webp" : file.type,
      size: buffer.length,
      width,
      height,
      folder,
    },
  });

  return { ok: true, media: { id: media.id, url: media.url } };
}
