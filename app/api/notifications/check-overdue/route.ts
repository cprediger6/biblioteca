import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar préstamos vencidos
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: "active",
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        user: true,
        copy: {
          include: {
            book: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    for (const loan of overdueLoans) {
      // Actualizar estado a "overdue"
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: "overdue" },
      });

      // Crear notificación
      await prisma.notification.create({
        data: {
          userId: loan.userId,
          title: "⚠️ Préstamo vencido",
          message: `El libro "${loan.copy.book.title}" está vencido desde el ${new Date(loan.dueDate).toLocaleDateString()}. Por favor, devuélvelo lo antes posible.`,
          type: "overdue",
          read: false,
        },
      });

      notificationsCreated++;
    }

    return NextResponse.json({
      success: true,
      message: `Se crearon ${notificationsCreated} notificaciones de vencimiento`,
    });
  } catch (error) {
    console.error("Error checking overdue loans:", error);
    return NextResponse.json(
      { error: "Error al verificar préstamos vencidos" },
      { status: 500 }
    );
  }
}