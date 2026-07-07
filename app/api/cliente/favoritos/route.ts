// app/api/cliente/favoritos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener todos los favoritos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            description: true,
            publisher: true,
            year: true,
            isbn: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatear los datos para el frontend
    const formattedFavorites = favorites.map(fav => ({
      id: fav.book.id,
      title: fav.book.title,
      author: fav.book.author,
      coverImage: fav.book.coverImage,
      description: fav.book.description,
      publisher: fav.book.publisher,
      year: fav.book.year,
      isbn: fav.book.isbn,
      createdAt: fav.book.createdAt,
      favoriteId: fav.id,
      favoriteCreatedAt: fav.createdAt,
    }));

    return NextResponse.json(formattedFavorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Error al obtener favoritos" },
      { status: 500 }
    );
  }
}

// POST - Agregar un libro a favoritos
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "ID del libro requerido" },
        { status: 400 }
      );
    }

    // Verificar si el libro existe
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya está en favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: bookId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "El libro ya está en favoritos" },
        { status: 400 }
      );
    }

    // Crear el favorito
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Libro agregado a favoritos",
      favorite,
    }, { status: 201 });

  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Error al agregar a favoritos" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un libro de favoritos
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "ID del libro requerido" },
        { status: 400 }
      );
    }

    // Eliminar el favorito
    await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: bookId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Libro eliminado de favoritos",
    });

  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Error al eliminar de favoritos" },
      { status: 500 }
    );
  }
}