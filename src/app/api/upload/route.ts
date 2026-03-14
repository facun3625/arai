import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generar nombre de archivo único
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const path = join(process.cwd(), "public/uploads", fileName);

        await writeFile(path, buffer);
        const url = `/uploads/${fileName}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
    }
}
