import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId } = body;

    if (!loanId) {
      return NextResponse.json(
        { error: "El ID del préstamo es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar que el préstamo existe y está activo
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        copy: true,
        user: true,
      },
    });

    if (!loan) {
      return NextResponse.json(
        { error: "El préstamo no existe" },
        { status: 404 }
      );
    }

    if (loan.status === "returned") {
      return NextResponse.json(
        { error: "Este préstamo ya fue devuelto" },
        { status: 400 }
      );
    }

    // Actualizar el préstamo
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: "returned",
        returnDate: new Date(),
      },
    });

    // Actualizar el estado del ejemplar a "available"
    await prisma.copy.update({
      where: { id: loan.copyId },
      data: {
        status: "available",
      },
    });

    // Crear notificación de devolución
    await prisma.notification.create({
      data: {
        userId: loan.userId,
        title: "📚 Devolución registrada",
        message: `Has devuelto el ejemplar correctamente.`,
        type: "loan",
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Préstamo devuelto correctamente",
      loan: updatedLoan,
    });
  } catch (error) {
    console.error("Error returning loan:", error);
    return NextResponse.json(
      { error: "Error al procesar la devolución" },
      { status: 500 }
    );
  }
}