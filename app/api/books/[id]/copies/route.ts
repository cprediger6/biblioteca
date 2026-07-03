// app/api/books/[id]/copies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const copies = await prisma.copy.findMany({
      where: {
        bookId: id,
      },
      select: {
        id: true,
        code: true,
        status: true,
        location: true,
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