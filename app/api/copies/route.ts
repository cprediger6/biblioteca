// app/api/copies/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const bookId = searchParams.get("bookId");
    const exclude = searchParams.get("exclude")?.split(',') || [];

    const where: any = {};

    // Filtrar por bookId
    if (bookId) {
      where.bookId = bookId;
    }

    // Filtrar por estado
    if (status) {
      where.status = status;
    }

    // Excluir estados específicos
    if (exclude.length > 0) {
      where.status = {
        notIn: exclude,
      };
    }

    // Búsqueda por libro
    if (search) {
      where.book = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { author: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const copies = await prisma.copy.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      take: 20,
      orderBy: {
        book: {
          title: "asc",
        },
      },
    });

    return NextResponse.json({ copies });
  } catch (error) {
    console.error("Error fetching copies:", error);
    return NextResponse.json(
      { error: "Error al obtener ejemplares" },
      { status: 500 }
    );
  }
}