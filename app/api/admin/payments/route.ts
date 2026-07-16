// app/api/admin/payments/route.ts
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            identification: true,
            status: true,
            lastPaymentDate: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, amount, method, description, period } = body;

    if (!userId || !amount || !method || !period) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: userId, amount, method, period" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ✅ Validar que el período tenga el formato correcto (YYYY-MM)
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return NextResponse.json(
        { error: "El período debe tener el formato YYYY-MM" },
        { status: 400 }
      );
    }

    // ✅ Obtener todos los pagos del usuario
    const userPayments = await prisma.payment.findMany({
      where: {
        userId,
        status: "completed",
      },
      select: {
        period: true,
      },
    });

    const paidPeriods = userPayments
      .filter(p => p.period)
      .map(p => p.period as string);

    // ✅ Verificar que el mes a pagar sea el siguiente mes pendiente
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const startDate = user.createdAt;
    const startMonth = startDate.toISOString().slice(0, 7);
    
    // Generar todos los meses desde el inicio hasta el mes actual
    const allMonths: string[] = [];
    let current = new Date(startDate);
    current.setDate(1);
    
    while (current <= now) {
      const monthKey = current.toISOString().slice(0, 7);
      allMonths.push(monthKey);
      current.setMonth(current.getMonth() + 1);
    }

    // Encontrar el primer mes pendiente (sin pago)
    const pendingMonths = allMonths.filter(month => !paidPeriods.includes(month));
    
    // ✅ Si el mes a pagar no es el primer mes pendiente, rechazar
    if (pendingMonths.length > 0) {
      const firstPendingMonth = pendingMonths[0];
      
      // Si el mes a pagar es el primero pendiente, permitir
      if (period === firstPendingMonth) {
        // Está bien, se permite el pago
      } else {
        // Verificar si el mes a pagar está en la lista de pendientes
        if (pendingMonths.includes(period)) {
          // El mes está pendiente pero no es el primero
          const monthIndex = pendingMonths.indexOf(period);
          const pendingBefore = pendingMonths.slice(0, monthIndex);
          
          return NextResponse.json({
            error: `No puedes pagar ${period} sin pagar los meses anteriores. Primero debes pagar: ${pendingBefore.join(', ')}`,
            pendingMonths: pendingBefore,
          }, { status: 400 });
        } else {
          // El mes ya está pagado o es futuro
          if (paidPeriods.includes(period)) {
            return NextResponse.json(
              { error: `El período ${period} ya está pagado` },
              { status: 400 }
            );
          }
          
          // El mes es futuro, verificar si hay meses pendientes antes
          const monthIndex = allMonths.indexOf(period);
          const pendingBefore = allMonths
            .slice(0, monthIndex)
            .filter(month => !paidPeriods.includes(month));
          
          if (pendingBefore.length > 0) {
            return NextResponse.json({
              error: `No puedes pagar ${period} sin pagar los meses anteriores. Meses pendientes: ${pendingBefore.join(', ')}`,
              pendingMonths: pendingBefore,
            }, { status: 400 });
          }
        }
      }
    }

    // ✅ Verificar que no exista un pago para este período
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        period: period,
        status: "completed",
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: `Ya existe un pago registrado para el período ${period}` },
        { status: 400 }
      );
    }

    // Generar referencia única
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        method,
        description: description || `Pago mensual - ${period}`,
        reference,
        status: "completed",
        period: period,
        paymentDate: new Date(),
      },
    });

    // ✅ Actualizar la fecha del último pago del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { 
        lastPaymentDate: new Date(),
        status: "active",
      },
    });

    // Crear notificación para el usuario
    await prisma.notification.create({
      data: {
        userId: userId,
        title: "✅ Pago registrado",
        message: `Se ha registrado un pago de $${amount} correspondiente al período ${period}. ¡Gracias por tu pago!`,
        type: "payment",
      },
    });

    return NextResponse.json({
      message: "Pago registrado exitosamente",
      payment,
    });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return NextResponse.json(
      { error: "Error al registrar el pago" },
      { status: 500 }
    );
  }
}