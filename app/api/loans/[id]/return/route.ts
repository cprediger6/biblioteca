// app/api/loans/[id]/return/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { returnDate, isDamaged, observations } = await request.json();

    // Verificar que el préstamo existe
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        copy: true,
      },
    });

    if (!loan) {
      return NextResponse.json(
        { error: "Préstamo no encontrado" },
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
      where: { id },
      data: {
        returnDate: new Date(returnDate),
        status: "returned",
      },
    });

    // Actualizar el estado del ejemplar
    const copyStatus = isDamaged ? "damaged" : "available";
    await prisma.copy.update({
      where: { id: loan.copyId },
      data: { status: copyStatus },
    });

    // Registrar observaciones (opcional - podrías tener un campo de notas)
    if (observations) {
      // Aquí podrías guardar las observaciones en un modelo de notas o logs
      console.log(`Observaciones devolución: ${observations}`);
    }

    return NextResponse.json({
      success: true,
      message: "Libro devuelto exitosamente",
      loan: updatedLoan,
    });
  } catch (error) {
    console.error("Error returning loan:", error);
    return NextResponse.json(
      { error: "Error al devolver el libro" },
      { status: 500 }
    );
  }
}