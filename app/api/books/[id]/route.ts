import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          select: {
            id: true,
            code: true,
            status: true,
            location: true,
            bookId: true,
            createdAt: true,
            updatedAt: true,
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

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Error al obtener el libro" },
      { status: 500 }
    );
  }
}