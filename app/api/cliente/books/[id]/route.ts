// app/api/cliente/books/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID del libro no proporcionado" },
        { status: 400 }
      );
    }

    // Obtener el libro con conteos de ejemplares
    const book = await prisma.book.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            copies: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Contar ejemplares disponibles
    const availableCopies = await prisma.copy.count({
      where: {
        bookId: id,
        status: 'available',
      },
    });

    // Contar préstamos activos
    const activeLoans = await prisma.loan.count({
      where: {
        copy: {
          bookId: id,
        },
        status: {
          in: ['active', 'overdue'],
        },
      },
    });

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher,
        year: book.year,
        description: book.description,
        coverImage: book.coverImage,
        backImage: book.backImage,
        totalCopies: book._count.copies,
        availableCopies,
        activeLoans,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener el libro:", error);
    return NextResponse.json(
      {
        error: "Error al obtener los detalles del libro",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}