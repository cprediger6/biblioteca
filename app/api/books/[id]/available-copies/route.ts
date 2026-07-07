// app/api/books/[id]/available-copies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ CORRECTO para Next.js 15+ - params es una Promise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // ✅ Esperar a que params se resuelva
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          where: { status: "available" },
          orderBy: { code: "asc" },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
      availableCopies: book.copies,
      totalAvailable: book.copies.length,
    });
  } catch (error) {
    console.error("Error fetching available copies:", error);
    return NextResponse.json(
      { error: "Error al obtener ejemplares disponibles" },
      { status: 500 }
    );
  }
}