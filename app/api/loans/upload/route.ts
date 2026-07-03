import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

export async function POST(request: NextRequest) {
  try {
    if (isVercel) {
      return NextResponse.json(
        {
          error:
            "Local filesystem uploads are not supported on Vercel. Use cloud storage or deploy locally.",
        },
        { status: 501 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bookId = formData.get("bookId") as string;
    const type = formData.get("type") as string; // "cover" o "back"

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato de imagen no permitido. Usa JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5MB" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // El directorio ya existe
    }

    // Generar nombre único
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${bookId}-${type}-${timestamp}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // URL pública
    const imageUrl = `/uploads/${filename}`;

    // Actualizar el libro en la base de datos
    const updateData = type === "cover" 
      ? { coverImage: imageUrl } 
      : { backImage: imageUrl };

    await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: "Imagen subida correctamente",
    });

  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}