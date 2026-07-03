import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definir tipos
type CopyWithLoans = {
  id: string;
  status: string;
  location: string | null;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
  loans: {
    id: string;
    status: string;
    userId: string;
    copyId: string;
    loanDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

type BookWithCopies = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  copies: {
    id: string;
    status: string;
    location: string | null;
  }[];
  _count: {
    copies: number;
  };
};

// GET: Obtener todos los libros
export async function GET() {
  try {
    const books: BookWithCopies[] = await prisma.book.findMany({
      include: {
        copies: {
          select: {
            id: true,
            status: true,
            location: true,
          },
        },
        _count: {
          select: {
            copies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Error al obtener los libros" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo libro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, isbn, publisher, year, description } = body;

    // Validar datos requeridos
    if (!title || !author) {
      return NextResponse.json(
        { error: "El título y el autor son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un libro con el mismo ISBN
    if (isbn) {
      const existingBook = await prisma.book.findUnique({
        where: { isbn },
      });
      
      if (existingBook) {
        return NextResponse.json(
          { error: "Ya existe un libro con este ISBN" },
          { status: 400 }
        );
      }
    }

    // Crear el libro con un ejemplar por defecto
    const copyCode = isbn ? `${isbn.replace(/-/g, '')}-EJ-001` : `LIB-${Date.now()}-EJ-001`;
    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn: isbn || null,
        publisher: publisher || null,
        year: year ? parseInt(year) : null,
        description: description || null,
        copies: {
          create: {
            code: copyCode,
            status: "available",
            location: "Estante principal",
          },
        },
      },
      include: {
        copies: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    
    // Manejar error de ISBN duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "El ISBN ya está registrado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el libro. Por favor, intenta de nuevo." },
      { status: 500 }
    );
  }
}

// PUT: Actualizar un libro existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, author, isbn, publisher, year, description, coverImage, backImage } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El ID del libro es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "El libro no existe" },
        { status: 404 }
      );
    }

    // Verificar ISBN duplicado (si se está actualizando)
    if (isbn && isbn !== existingBook.isbn) {
      const bookWithIsbn = await prisma.book.findUnique({
        where: { isbn },
      });
      
      if (bookWithIsbn && bookWithIsbn.id !== id) {
        return NextResponse.json(
          { error: "Ya existe otro libro con este ISBN" },
          { status: 400 }
        );
      }
    }

    // Actualizar el libro
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title || existingBook.title,
        author: author || existingBook.author,
        isbn: isbn || null,
        publisher: publisher || null,
        year: year ? parseInt(year) : null,
        description: description || null,
        coverImage: coverImage || existingBook.coverImage,
        backImage: backImage || existingBook.backImage,
      },
      include: {
        copies: true,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Error al actualizar el libro" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un libro
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del libro es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: {
        copies: {
          include: {
            loans: {
              where: {
                status: {
                  in: ["active", "overdue"],
                },
              },
            },
          },
        },
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "El libro no existe" },
        { status: 404 }
      );
    }

    // Verificar si hay préstamos activos - CON TIPO EXPLÍCITO
    const hasActiveLoans = existingBook.copies.some(
      (copy: CopyWithLoans) => copy.loans.length > 0
    );

    if (hasActiveLoans) {
      return NextResponse.json(
        { error: "No se puede eliminar el libro porque tiene préstamos activos" },
        { status: 400 }
      );
    }

    // Eliminar el libro (los ejemplares se eliminarán en cascada)
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Libro eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Error al eliminar el libro" },
      { status: 500 }
    );
  }
}

// PATCH: Añadir un ejemplar a un libro existente
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, location } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "El ID del libro es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "El libro no existe" },
        { status: 404 }
      );
    }

    // Crear un nuevo ejemplar con código único
    const copyCode = existingBook.isbn
      ? `${existingBook.isbn.replace(/-/g, '')}-EJ-${String(Date.now()).slice(-6)}`
      : `LIB-${existingBook.id}-EJ-${String(Date.now()).slice(-6)}`;

    const newCopy = await prisma.copy.create({
      data: {
        bookId,
        code: copyCode,
        status: "available",
        location: location || "Estante principal",
      },
    });

    return NextResponse.json(newCopy, { status: 201 });
  } catch (error) {
    console.error("Error adding copy:", error);
    return NextResponse.json(
      { error: "Error al añadir el ejemplar" },
      { status: 500 }
    );
  }
}