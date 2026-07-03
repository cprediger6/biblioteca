import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: "overdue",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        copy: {
          include: {
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    return NextResponse.json(overdueLoans);
  } catch (error) {
    console.error("Error fetching overdue loans:", error);
    return NextResponse.json(
      { error: "Error al obtener préstamos vencidos" },
      { status: 500 }
    );
  }
}