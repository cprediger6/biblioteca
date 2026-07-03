import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, location } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código de ejemplar requerido" },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Crear el ejemplar
    const copy = await prisma.copy.create({
      data: {
        bookId: id,
        code,
        location: location || "Biblioteca Central",
        status: "available",
      },
    });

    return NextResponse.json(copy, { status: 201 });
  } catch (error) {
    console.error("Error adding copy:", error);
    return NextResponse.json(
      { error: "Error al agregar el ejemplar" },
      { status: 500 }
    );
  }
}