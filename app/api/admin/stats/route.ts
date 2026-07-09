// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    // Obtener estadísticas
    const [
      totalUsers,
      totalBooks,
      activeLoans,
      pendingReturns
    ] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.loan.count({
        where: {
          status: "active",
        },
      }),
      prisma.loan.count({
        where: {
          status: "pending",
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalBooks,
      activeLoans,
      pendingReturns,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}