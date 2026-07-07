// app/api/cliente/payments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Intentar obtener pagos de la base de datos
    let payments = [];
    try {
      // @ts-ignore - El modelo Payment se agregará después de la migración
      payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.log("El modelo Payment aún no existe, usando datos de ejemplo");
      
      // Datos de ejemplo mientras no exista el modelo
      payments = [
        {
          id: 'pay_1',
          userId: userId,
          amount: 15.00,
          method: 'credit_card',
          status: 'completed',
          reference: 'REF-001-2024',
          description: 'Membresía Premium - Enero 2024',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
          id: 'pay_2',
          userId: userId,
          amount: 5.00,
          method: 'cash',
          status: 'pending',
          reference: 'REF-002-2024',
          description: 'Multa por retraso - El Principito',
          createdAt: new Date('2024-02-01').toISOString(),
          updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
          id: 'pay_3',
          userId: userId,
          amount: 20.00,
          method: 'bank_transfer',
          status: 'completed',
          reference: 'REF-003-2024',
          description: 'Membresía Premium - Febrero 2024',
          createdAt: new Date('2024-02-15').toISOString(),
          updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
          id: 'pay_4',
          userId: userId,
          amount: 8.00,
          method: 'debit_card',
          status: 'failed',
          reference: 'REF-004-2024',
          description: 'Multa por daño - 1984',
          createdAt: new Date('2024-03-01').toISOString(),
          updatedAt: new Date('2024-03-01').toISOString(),
        },
      ];
    }

    return NextResponse.json({
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Error al obtener los pagos" },
      { status: 500 }
    );
  }
}