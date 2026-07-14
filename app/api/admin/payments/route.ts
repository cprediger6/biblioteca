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
    const { userId, amount, method, description } = body;

    if (!userId || !amount || !method) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: userId, amount, method" },
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

    // Generar referencia única
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        method,
        description: description || "Pago mensual de suscripción",
        reference,
        status: "completed",
      },
    });

    // Actualizar la fecha del último pago del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { 
        lastPaymentDate: new Date(),
        status: "active", // Reactivar si estaba suspendido
      },
    });

    // Crear notificación para el usuario
    await prisma.notification.create({
      data: {
        userId: userId,
        title: "✅ Pago registrado",
        message: `Se ha registrado un pago de $${amount} a tu cuenta. ¡Gracias por tu pago!`,
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