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
    const available = searchParams.get("available") === "true";

    let where: any = {};
    
    if (available) {
      where.status = "available";
    }
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { book: { title: { contains: search, mode: "insensitive" } } },
        { book: { author: { contains: search, mode: "insensitive" } } },
      ];
    }

    const copies = await prisma.copy.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
      take: 20,
      orderBy: {
        book: {
          title: 'asc',
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