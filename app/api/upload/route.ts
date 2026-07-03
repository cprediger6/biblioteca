// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

// Tipos para las imágenes
interface ImageInfo {
  type: string;
  url: string | null;
}

// Tipo para el usuario con photo
type UserWithPhoto = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  identification: string;
  photo: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(request: Request) {
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

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const bookId = formData.get("bookId") as string | null;
    const userId = formData.get("userId") as string | null;

    // Validar campos requeridos
    if (!file || !type) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: archivo y tipo son obligatorios" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG o WebP" },
        { status: 400 }
      );
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5MB" },
        { status: 400 }
      );
    }

    // Determinar carpeta de destino según el tipo
    let uploadDir: string;
    let publicPath: string;
    let entityId: string | null = null;

    switch (type) {
      case "cover":
      case "back":
        if (!bookId) {
          return NextResponse.json(
            { error: "Se requiere el ID del libro para subir imágenes de portada" },
            { status: 400 }
          );
        }
        // Verificar que el libro existe
        const book = await prisma.book.findUnique({
          where: { id: bookId },
        });
        if (!book) {
          return NextResponse.json(
            { error: "Libro no encontrado" },
            { status: 404 }
          );
        }
        uploadDir = join(process.cwd(), "public", "uploads", "books", bookId);
        publicPath = `/uploads/books/${bookId}`;
        entityId = bookId;
        break;

      case "user-photo":
        if (!userId) {
          return NextResponse.json(
            { error: "Se requiere el ID del usuario para subir la foto" },
            { status: 400 }
          );
        }
        // Verificar que el usuario existe
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          return NextResponse.json(
            { error: "Usuario no encontrado" },
            { status: 404 }
          );
        }
        uploadDir = join(process.cwd(), "public", "uploads", "users", userId);
        publicPath = `/uploads/users/${userId}`;
        entityId = userId;
        break;

      default:
        return NextResponse.json(
          { error: `Tipo de imagen no soportado: ${type}` },
          { status: 400 }
        );
    }

    // Crear directorio si no existe
    await mkdir(uploadDir, { recursive: true });

    // Generar nombre único para el archivo
    const extension = file.name.split('.').pop() || "jpg";
    const fileName = `${type}-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const filePath = join(uploadDir, fileName);
    const imageUrl = `${publicPath}/${fileName}`;

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Actualizar la entidad correspondiente en la base de datos
    let updatedEntity = null;

    if (type === "cover" || type === "back") {
      const updateData = type === "cover" 
        ? { coverImage: imageUrl }
        : { backImage: imageUrl };
      
      updatedEntity = await prisma.book.update({
        where: { id: entityId! },
        data: updateData,
      });
    } else if (type === "user-photo") {
      // Usar update con any para evitar el error de TypeScript
      // mientras se completa la migración
      updatedEntity = await prisma.user.update({
        where: { id: entityId! },
        data: { 
          // @ts-ignore - Photo field will be added after migration
          photo: imageUrl 
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: "Imagen subida exitosamente",
      type: type,
      entityId: entityId,
      fileName: fileName,
      fileSize: file.size,
      updatedEntity: updatedEntity,
    }, { status: 200 });

  } catch (error) {
    console.error("Error detallado al subir imagen:", error);
    
    // Manejar errores específicos
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: `Error al subir la imagen: ${error.message}`,
          details: error.stack 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor al subir la imagen" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una imagen
export async function DELETE(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const type = searchParams.get("type");
    const entityId = searchParams.get("entityId");

    if (!url || !type || !entityId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: url, type y entityId son obligatorios" },
        { status: 400 }
      );
    }

    // Determinar qué actualizar según el tipo
    let updateData: any = {};

    if (type === "cover") {
      updateData = { coverImage: null };
    } else if (type === "back") {
      updateData = { backImage: null };
    } else if (type === "user-photo") {
      updateData = { photo: null };
    } else {
      return NextResponse.json(
        { error: "Tipo de imagen no soportado para eliminar" },
        { status: 400 }
      );
    }

    // Actualizar la entidad en la base de datos
    let updatedEntity = null;

    if (type === "cover" || type === "back") {
      updatedEntity = await prisma.book.update({
        where: { id: entityId },
        data: updateData,
      });
    } else if (type === "user-photo") {
      updatedEntity = await prisma.user.update({
        where: { id: entityId },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Imagen eliminada exitosamente",
      updatedEntity: updatedEntity,
    });

  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return NextResponse.json(
      { error: "Error al eliminar la imagen" },
      { status: 500 }
    );
  }
}

// GET - Obtener información de imágenes
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const type = searchParams.get("type");

    if (!entityId || !type) {
      return NextResponse.json(
        { error: "Faltan datos requeridos: entityId y type son obligatorios" },
        { status: 400 }
      );
    }

    let images: ImageInfo[] = [];

    if (type === "cover" || type === "back") {
      const book = await prisma.book.findUnique({
        where: { id: entityId },
        select: {
          coverImage: true,
          backImage: true,
        },
      });
      
      if (book) {
        const coverImage: ImageInfo = { type: "cover", url: book.coverImage };
        const backImage: ImageInfo = { type: "back", url: book.backImage };
        images = [coverImage, backImage].filter(img => img.url !== null);
      }
    } else if (type === "user-photo") {
      // Usar findFirst con select para evitar errores
      const user = await prisma.user.findUnique({
        where: { id: entityId },
      });
      
      // @ts-ignore - Photo field will be added after migration
      if (user && user.photo) {
        // @ts-ignore
        images = [{ type: "user-photo", url: user.photo }];
      }
    }

    return NextResponse.json({
      success: true,
      images,
      count: images.length,
    });

  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    return NextResponse.json(
      { error: "Error al obtener las imágenes" },
      { status: 500 }
    );
  }
}