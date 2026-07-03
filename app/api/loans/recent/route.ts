import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const recentLoans = await prisma.loan.findMany({
      take: 5,
      orderBy: { loanDate: "desc" },
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
    });

    return NextResponse.json(recentLoans);
  } catch (error) {
    console.error("Error fetching recent loans:", error);
    return NextResponse.json(
      { error: "Error al obtener préstamos recientes" },
      { status: 500 }
    );
  }
}