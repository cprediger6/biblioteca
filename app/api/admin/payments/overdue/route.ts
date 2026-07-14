// app/api/admin/payments/overdue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ✅ Usar select explícito para incluir lastPaymentDate
    const overdueUsers = await prisma.user.findMany({
      where: {
        role: "user",
        status: {
          in: ["active", "suspended"],
        },
        OR: [
          {
            lastPaymentDate: {
              lt: thirtyDaysAgo,
            },
          },
          {
            lastPaymentDate: null,
            createdAt: {
              lt: thirtyDaysAgo,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        identification: true,
        phone: true,
        status: true,
        lastPaymentDate: true, // ✅ Seleccionar explícitamente
        createdAt: true,
        _count: {
          select: {
            loans: true,
            reservations: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
            reference: true,
          },
        },
      },
    });

    // ✅ Calcular días de atraso
    const overdueWithDays = overdueUsers.map(user => {
      const lastPaymentDate = user.lastPaymentDate || user.createdAt;
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        phone: user.phone,
        status: user.status,
        lastPaymentDate: user.lastPaymentDate,
        createdAt: user.createdAt,
        daysOverdue,
        statusLevel: daysOverdue > 30 ? "critical" : daysOverdue > 15 ? "warning" : "normal",
        _count: user._count,
        payments: user.payments,
      };
    });

    // ✅ Ordenar por días de atraso (mayor primero)
    overdueWithDays.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return NextResponse.json({
      totalOverdue: overdueWithDays.length,
      users: overdueWithDays,
    });
  } catch (error) {
    console.error("Error al obtener usuarios con pagos atrasados:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios con pagos atrasados" },
      { status: 500 }
    );
  }
}