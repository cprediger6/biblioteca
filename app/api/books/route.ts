// app/api/books/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

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

    const body = await request.json();
    const { title, author, isbn, publisher, year, description, copiesCount } = body;

    // Validar campos requeridos
    if (!title || !author || !copiesCount || copiesCount < 1) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el ISBN ya existe
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

    // Generar código base para los ejemplares
    const baseCode = isbn ? isbn.replace(/-/g, '') : `LIB-${Date.now()}`;

    // Crear el libro con sus copias
    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn: isbn || null,
        publisher: publisher || null,
        year: year ? parseInt(year) : null,
        description: description || null,
        copies: {
          create: Array.from({ length: copiesCount }, (_, index) => ({
            code: `${baseCode}-EJ-${String(index + 1).padStart(3, '0')}`,
            status: "available",
            location: "Estante principal",
          })),
        },
      },
      include: {
        copies: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Error al crear el libro" },
      { status: 500 }
    );
  }
}

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Construir el objeto where correctamente tipado
    let where: Prisma.BookWhereInput = {};

    if (search) {
      where = {
        OR: [
          { title: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { author: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { isbn: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        ],
      };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          copies: {
            select: {
              id: true,
              code: true,
              status: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Error al obtener los libros" },
      { status: 500 }
    );
  }
}