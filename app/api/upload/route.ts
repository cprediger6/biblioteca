// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary con más opciones
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Verificar que Cloudinary está configurado
const isCloudinaryConfigured = () => {
  const configured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
  console.log("Cloudinary configurado:", configured);
  return configured;
};

export async function POST(request: Request) {
  try {
    console.log("=== INICIO DE SUBIDA A CLOUDINARY ===");
    
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      console.log("Autenticación fallida");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    console.log("Autenticación exitosa");

    // Verificar que Cloudinary está configurado
    if (!isCloudinaryConfigured()) {
      console.error("Cloudinary no está configurado");
      return NextResponse.json(
        { error: "Cloudinary no está configurado" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const bookId = formData.get("bookId") as string | null;
    const userId = formData.get("userId") as string | null;

    console.log("Datos recibidos:", {
      type,
      bookId,
      userId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    // Validar campos requeridos
    if (!file || !type) {
      console.log("Faltan datos requeridos");
      return NextResponse.json(
        { error: "Faltan datos requeridos: archivo y tipo son obligatorios" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      console.log("Tipo de archivo no permitido:", file.type);
      return NextResponse.json(
        { error: `Formato no permitido. Usa: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log("Archivo demasiado grande:", file.size);
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
          console.log("Falta bookId para tipo:", type);
          return NextResponse.json(
            { error: "Se requiere el ID del libro" },
            { status: 400 }
          );
        }
        const book = await prisma.book.findUnique({
          where: { id: bookId },
        });
        if (!book) {
          console.log("Libro no encontrado:", bookId);
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
          console.log("Falta userId para tipo:", type);
          return NextResponse.json(
            { error: "Se requiere el ID del usuario" },
            { status: 400 }
          );
        }
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          console.log("Usuario no encontrado:", userId);
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
        console.log("Tipo no soportado:", type);
        return NextResponse.json(
          { error: `Tipo de imagen no soportado: ${type}` },
          { status: 400 }
        );
    }

    console.log("Preparando subida a Cloudinary:", { folder, publicId });

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("Buffer creado, tamaño:", buffer.length);

    // Subir a Cloudinary
    try {
      console.log("Iniciando subida a Cloudinary...");
      
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
            timeout: 60000, // 60 segundos de timeout
          },
          (error, result) => {
            if (error) {
              console.error("Error en callback de Cloudinary:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload exitoso");
              resolve(result);
            }
          }
        );
        
        // Escribir el buffer en el stream
        const { Readable } = require("stream");
        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
        
        // Manejar errores del stream
        uploadStream.on('error', (error: Error) => {
          console.error("Error en stream:", error);
          reject(error);
        });
      });

      const imageUrl = (result as any).secure_url;
      console.log("URL de la imagen:", imageUrl);

      // Actualizar la entidad correspondiente en la base de datos
      let updatedEntity = null;

      try {
        if (type === "cover" || type === "back") {
          const updateData = type === "cover" 
            ? { coverImage: imageUrl }
            : { backImage: imageUrl };
          
          updatedEntity = await prisma.book.update({
            where: { id: entityId! },
            data: updateData,
          });
          console.log("Libro actualizado en BD");
        } else if (type === "user-photo") {
          updatedEntity = await prisma.user.update({
            where: { id: entityId! },
            data: { photo: imageUrl },
          });
          console.log("Usuario actualizado en BD");
        }
      } catch (dbError) {
        console.error("Error al actualizar la base de datos:", dbError);
        return NextResponse.json(
          { 
            error: "La imagen se subió pero hubo un error al actualizar la base de datos",
            url: imageUrl,
            partial: true
          },
          { status: 207 }
        );
      }

      console.log("=== SUBIDA COMPLETADA EXITOSAMENTE ===");
      
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

    } catch (cloudinaryError) {
      console.error("Error detallado al subir a Cloudinary:", cloudinaryError);
      
      let errorMessage = "Error al subir la imagen a Cloudinary";
      let errorDetails = "";
      
      if (cloudinaryError instanceof Error) {
        errorMessage = cloudinaryError.message;
        errorDetails = cloudinaryError.stack || "";
      } else if (typeof cloudinaryError === 'object' && cloudinaryError !== null) {
        errorMessage = JSON.stringify(cloudinaryError);
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error general en upload:", error);
    
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