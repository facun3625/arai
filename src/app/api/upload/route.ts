import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB raw input guard
const MAX_DIMENSION = 1920; // no product photo needs to be bigger than this on the web
// Formats sharp can't safely re-encode without losing what matters (vector/animation) pass through untouched.
const PASSTHROUGH_EXTENSIONS = new Set(["svg", "gif"]);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: "El archivo supera el tamaño máximo permitido (20MB)" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalExtension = (file.name.split('.').pop() || "").toLowerCase();
        const uploadDir = join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        let outputBuffer = buffer;
        let outputExtension = originalExtension;

        if (!PASSTHROUGH_EXTENSIONS.has(originalExtension)) {
            // Re-encode as webp: auto-orients from EXIF, caps dimensions, and compresses far
            // below what raw phone-camera uploads weigh (was serving unoptimized multi-MB files).
            outputBuffer = await sharp(buffer)
                .rotate()
                .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
                .webp({ quality: 82 })
                .toBuffer();
            outputExtension = "webp";
        }

        const fileName = `${uuidv4()}.${outputExtension}`;
        const path = join(uploadDir, fileName);
        await writeFile(path, outputBuffer);
        const url = `/uploads/${fileName}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: `Error al subir el archivo: ${error.message}` }, { status: 500 });
    }
}
