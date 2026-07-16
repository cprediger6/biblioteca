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
    const currentMonth = now.toISOString().slice(0, 7); // "2024-01"
    
    // ✅ Obtener todos los pagos completos de cada usuario con sus períodos
    const allUsers = await prisma.user.findMany({
      where: {
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        identification: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            loans: true,
            reservations: true,
          },
        },
        payments: {
          where: {
            status: "completed",
          },
          orderBy: {
            paymentDate: "desc",
          },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
            reference: true,
            period: true,
            paymentDate: true,
          },
        },
      },
    });

    // ✅ Calcular meses atrasados para cada usuario
    const usersWithDebt = allUsers.map((user: any) => {
      // Obtener los períodos pagados (meses completos)
      const paidPeriods = user.payments
        .filter((p: any) => p.period)
        .map((p: any) => p.period);
      
      // Determinar el mes de inicio (cuando se registró el usuario o el primer pago)
      const startDate = user.createdAt;
      const startMonth = startDate.toISOString().slice(0, 7);
      
      // Generar todos los meses desde el inicio hasta el mes actual
      const allMonths: string[] = [];
      let current = new Date(startDate);
      current.setDate(1); // Asegurar que estamos en el primer día del mes
      
      while (current <= now) {
        const monthKey = current.toISOString().slice(0, 7);
        allMonths.push(monthKey);
        current.setMonth(current.getMonth() + 1);
      }
      
      // Identificar meses pendientes (no pagados)
      const pendingMonths = allMonths.filter(month => !paidPeriods.includes(month));
      
      // Calcular meses atrasados (meses pendientes hasta el mes actual)
      const overdueMonths = pendingMonths.filter(month => month <= currentMonth);
      
      // Calcular el monto adeudado
      const monthlyFee = 10;
      const totalDebt = overdueMonths.length * monthlyFee;
      
      // Determinar el estado de la deuda
      let debtLevel = "al-dia";
      let debtLabel = "Al día";
      let debtColor = "bg-green-100 text-green-700";
      const monthsOverdue = overdueMonths.length;
      
      if (monthsOverdue === 0) {
        debtLevel = "al-dia";
        debtLabel = "Al día";
        debtColor = "bg-green-100 text-green-700";
      } else if (monthsOverdue === 1) {
        debtLevel = "1-mes";
        debtLabel = "1 mes atrasado";
        debtColor = "bg-yellow-100 text-yellow-700";
      } else if (monthsOverdue === 2) {
        debtLevel = "2-meses";
        debtLabel = "2 meses atrasados";
        debtColor = "bg-orange-100 text-orange-700";
      } else if (monthsOverdue >= 3 && monthsOverdue <= 5) {
        debtLevel = "critico";
        debtLabel = `${monthsOverdue} meses atrasados`;
        debtColor = "bg-red-100 text-red-700";
      } else if (monthsOverdue > 5) {
        debtLevel = "muy-critico";
        debtLabel = `${monthsOverdue} meses atrasados`;
        debtColor = "bg-red-600 text-white";
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        monthsOverdue,
        pendingMonths,
        paidPeriods,
        debtLevel,
        debtLabel,
        debtColor,
        totalDebt,
        monthlyFee,
        isOverdue: monthsOverdue > 0,
        lastPayment: user.payments[0] || null,
        _count: user._count,
        payments: user.payments,
      };
    });

    // ✅ Filtrar solo los que tienen deuda
    const overdueUsers = usersWithDebt.filter(user => user.isOverdue);
    
    // ✅ Ordenar por meses atrasados (mayor primero)
    overdueUsers.sort((a, b) => b.monthsOverdue - a.monthsOverdue);

    // ✅ Calcular estadísticas
    const totalDebt = overdueUsers.reduce((sum, u) => sum + u.totalDebt, 0);
    const totalMonthsOverdue = overdueUsers.reduce((sum, u) => sum + u.monthsOverdue, 0);
    const criticalOverdue = overdueUsers.filter(u => u.monthsOverdue >= 3).length;

    return NextResponse.json({
      totalOverdue: overdueUsers.length,
      users: overdueUsers,
      totalDebt,
      totalMonthsOverdue,
      criticalOverdue,
      monthlyFee: 10,
      currentMonth,
    });
  } catch (error) {
    console.error("Error al obtener usuarios con pagos atrasados:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios con pagos atrasados" },
      { status: 500 }
    );
  }
}