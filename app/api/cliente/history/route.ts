// app/api/cliente/history/route.ts
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

    // Obtener reservas del usuario
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Obtener préstamos del usuario
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        copy: {
          include: {
            book: {
              select: {
                title: true,
                author: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Combinar y formatear el historial
    const history = [
      // Reservas
      ...reservations.map(r => ({
        id: `res-${r.id}`,
        type: 'reservation' as const,
        status: r.status,
        title: r.book.title,
        author: r.book.author,
        date: r.createdAt.toISOString(),
        details: {
          reservationId: r.id,
          copyCode: null,
          dueDate: null,
          returnDate: null,
        },
      })),
      // Préstamos
      ...loans.map(l => ({
        id: `loan-${l.id}`,
        type: l.status === 'returned' ? 'return' as const : 'loan' as const,
        status: l.status,
        title: l.copy.book.title,
        author: l.copy.book.author,
        date: l.createdAt.toISOString(),
        details: {
          loanId: l.id,
          copyCode: l.copy.code,
          dueDate: l.dueDate.toISOString(),
          returnDate: l.returnDate?.toISOString() || null,
        },
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial" },
      { status: 500 }
    );
  }
}