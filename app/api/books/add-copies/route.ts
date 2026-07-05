// app/api/books/add-copies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCopyCode } from "@/lib/copy-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, copiesCount } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "El ID del libro es obligatorio" },
        { status: 400 }
      );
    }

    const numCopies = parseInt(copiesCount) || 1;

    if (numCopies < 1 || numCopies > 50) {
      return NextResponse.json(
        { error: "La cantidad de ejemplares debe ser entre 1 y 50" },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        copies: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "El libro no existe" },
        { status: 404 }
      );
    }

    // Crear los nuevos ejemplares con códigos generados secuencialmente
    const copies = [];
    let nextCode = await generateCopyCode(book.isbn || `LIB-${book.id}`, book.id);

    for (let i = 0; i < numCopies; i++) {
      const code = i === 0 ? nextCode : `${book.isbn ? book.isbn.replace(/-/g, '') : `LIB-${book.id}`}-EJ-${String(i + 1).padStart(3, '0')}`;
      const copy = await prisma.copy.create({
        data: {
          bookId,
          code,
          status: "available",
          location: "Estante principal",
        },
      });
      copies.push(copy);
    }

    const updatedCopies = copies; // ya contienen los códigos generados

    return NextResponse.json({
      success: true,
      message: `${numCopies} ejemplares agregados correctamente`,
      copies: updatedCopies,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding copies:", error);
    return NextResponse.json(
      { error: "Error al agregar ejemplares" },
      { status: 500 }
    );
  }
}