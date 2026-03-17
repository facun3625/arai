import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    console.log("--- INICIO UPLOAD REQUEST ---");
    try {
        const formData = await req.formData();
        console.log("FormData recibido:", Array.from(formData.keys()));
        const file = formData.get("file") as File;

        if (!file) {
            console.error("ERROR: No se encontró el campo 'file' en el FormData");
            return NextResponse.json({ error: "No se subió ningún archivo" }, { status: 400 });
        }

        console.log("Archivo recibido:", { name: file.name, size: file.size, type: file.type });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generar nombre de archivo único
        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const path = join(process.cwd(), "public/uploads", fileName);
        
        console.log("Intentando escribir en:", path);

        await writeFile(path, buffer);
        const url = `/uploads/${fileName}`;

        console.log("Upload exitoso. URL:", url);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("CRITICAL UPLOAD ERROR:", error);
        return NextResponse.json({ error: `Error al subir el archivo: ${error.message}` }, { status: 500 });
    } finally {
        console.log("--- FIN UPLOAD REQUEST ---");
    }
}
