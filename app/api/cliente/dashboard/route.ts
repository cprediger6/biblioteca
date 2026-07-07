// app/api/cliente/dashboard/route.ts
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

    // Obtener reservas activas
    const activeReservations = await prisma.reservation.count({
      where: {
        userId,
        status: {
          in: ['pending', 'approved'],
        },
      },
    });

    // Obtener préstamos activos
    const activeLoans = await prisma.loan.count({
      where: {
        userId,
        status: 'active',
      },
    });

    // Obtener historial de préstamos
    const loanHistory = await prisma.loan.count({
      where: {
        userId,
        status: 'returned',
      },
    });

    // Días de membresía (simulado - puedes ajustarlo según tu lógica)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const membershipDays = user ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // Obtener actividad reciente (reservas y préstamos)
    const recentReservations = await prisma.reservation.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const recentLoans = await prisma.loan.findMany({
      where: { userId },
      include: {
        copy: {
          include: {
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Combinar actividad reciente
    const recentActivity = [
      ...recentReservations.map(r => ({
        id: r.id,
        type: 'reservation' as const,
        title: r.book.title,
        status: r.status,
        date: r.createdAt.toISOString(),
      })),
      ...recentLoans.map(l => ({
        id: l.id,
        type: l.status === 'returned' ? 'return' as const : 'loan' as const,
        title: l.copy.book.title,
        status: l.status,
        date: l.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Obtener libros recomendados (los más populares o aleatorios)
    const recommendedBooks = await prisma.book.findMany({
      take: 3,
      orderBy: {
        // Si tienes un campo de popularidad o préstamos, úsalo
        // Por ahora, aleatorio
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        author: true,
      },
    });

    // Asignar tags a los libros recomendados
    const recommendedWithTags = recommendedBooks.map((book, index) => {
      const tags = ['Tendencia', 'Recomendado', 'Clásico', 'Popular', 'Nuevo'];
      return {
        ...book,
        tag: tags[index % tags.length],
      };
    });

    return NextResponse.json({
      activeReservations,
      activeLoans,
      loanHistory,
      membershipDays,
      recentActivity,
      recommendedBooks: recommendedWithTags,
      user: {
        name: user?.name || 'Usuario',
        email: user?.email || '',
        role: user?.role || 'user',
      },
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del dashboard" },
      { status: 500 }
    );
  }
}