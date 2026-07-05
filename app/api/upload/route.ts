// app/api/upload/route.ts 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tipos para las imágenes
interface ImageInfo {
  type: string;
  url: string | null;
}

export async function POST(request: Request) {
  try {
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

    // Determinar la carpeta y el nombre del archivo en Cloudinary
    let folder: string;
    let publicId: string;
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
        folder = `biblioteca/books/${bookId}`;
        publicId = `${type}-${Date.now()}`;
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
        folder = `biblioteca/users/${userId}`;
        publicId = `photo-${Date.now()}`;
        entityId = userId;
        break;

      default:
        return NextResponse.json(
          { error: `Tipo de imagen no soportado: ${type}` },
          { status: 400 }
        );
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: "image",
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Escribir el buffer en el stream
      const { Readable } = require("stream");
      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });

    const imageUrl = (result as any).secure_url;

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
      updatedEntity = await prisma.user.update({
        where: { id: entityId! },
        data: { photo: imageUrl },
      });
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      publicId: (result as any).public_id,
      message: "Imagen subida exitosamente",
      type: type,
      entityId: entityId,
      fileSize: file.size,
      updatedEntity: updatedEntity,
    }, { status: 200 });

  } catch (error) {
    console.error("Error detallado al subir imagen:", error);
    
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

// DELETE - Eliminar una imagen de Cloudinary
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

    // Extraer el public_id de la URL de Cloudinary
    // Ejemplo: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/biblioteca/books/xxx/cover-1234567890.jpg
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      return NextResponse.json(
        { error: "URL de Cloudinary inválida" },
        { status: 400 }
      );
    }
    
    // Obtener la parte después de 'upload/v1234567890/'
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    // Eliminar la extensión del archivo
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    // Eliminar de Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Error al eliminar de Cloudinary:", cloudinaryError);
      // Continuamos aunque falle la eliminación en Cloudinary
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
      const user = await prisma.user.findUnique({
        where: { id: entityId },
      });
      
      if (user && user.photo) {
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