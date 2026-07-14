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

    console.log("📝 Devolviendo préstamo:", { id, returnDate, isDamaged });

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

    console.log("📖 Préstamo encontrado:", { 
      loanId: loan.id, 
      copyId: loan.copyId, 
      copyStatus: loan.copy.status 
    });

    if (loan.status === "returned") {
      return NextResponse.json(
        { error: "Este préstamo ya fue devuelto" },
        { status: 400 }
      );
    }

    // ✅ Actualizar el préstamo
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        returnDate: new Date(returnDate),
        status: "returned",
      },
    });

    console.log("✅ Préstamo actualizado:", { status: updatedLoan.status });

    // ✅ Actualizar el estado del ejemplar
    // Si isDamaged es true, el estado será "damaged", de lo contrario "available"
    const copyStatus = isDamaged ? "damaged" : "available";
    console.log(`📚 Actualizando ejemplar ${loan.copyId} a estado: ${copyStatus}`);

    const updatedCopy = await prisma.copy.update({
      where: { id: loan.copyId },
      data: { status: copyStatus },
    });

    console.log("✅ Ejemplar actualizado:", { 
      copyId: updatedCopy.id, 
      newStatus: updatedCopy.status 
    });

    // ✅ Crear notificación para el usuario
    await prisma.notification.create({
      data: {
        userId: loan.userId,
        title: "📚 Libro devuelto",
        message: `Has devuelto el libro "${loan.copy.bookId}" exitosamente. ${isDamaged ? 'El libro fue marcado como dañado.' : '¡Gracias por tu devolución!'}`,
        type: "return",
      },
    });

    // Registrar observaciones si existen
    if (observations) {
      console.log(`📝 Observaciones devolución: ${observations}`);
      // Aquí podrías guardar las observaciones en un modelo de notas
    }

    return NextResponse.json({
      success: true,
      message: "Libro devuelto exitosamente",
      loan: updatedLoan,
      copy: updatedCopy,
      copyStatus,
    });
  } catch (error) {
    console.error("❌ Error returning loan:", error);
    return NextResponse.json(
      { error: "Error al devolver el libro" },
      { status: 500 }
    );
  }
}