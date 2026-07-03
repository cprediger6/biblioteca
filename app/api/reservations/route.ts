// app/api/reservations/route.ts (versión modificada)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener reservas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const isAdmin = session.user?.role === "admin";

    const where: any = {};
    if (!isAdmin) {
      where.userId = session.user.id;
    }
    if (status) where.status = status;

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: isAdmin ? {
          select: {
            id: true,
            name: true,
            email: true,
            identification: true,
          },
        } : false,
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            description: true,
            publisher: true,
            year: true,
          },
        },
      },
      orderBy: { reserveDate: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva reserva (sin verificar disponibilidad)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "ID del libro requerido" },
        { status: 400 }
      );
    }

    // Verificar si el libro existe
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario ya tiene una reserva activa para este libro
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId,
        status: {
          in: ['pending', 'approved'],
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "Ya tienes una reserva activa para este libro" },
        { status: 400 }
      );
    }

    // Verificar límite de reservas activas (máximo 3)
    const activeReservations = await prisma.reservation.count({
      where: {
        userId: session.user.id,
        status: {
          in: ['pending', 'approved'],
        },
      },
    });

    if (activeReservations >= 3) {
      return NextResponse.json(
        { error: "Has alcanzado el límite máximo de reservas activas (3)" },
        { status: 400 }
      );
    }

    // Crear la reserva (sin verificar disponibilidad de ejemplares)
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
        status: "pending",
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar una reserva
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get("id");

    if (!reservationId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: session.user.id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.status === 'approved') {
      return NextResponse.json(
        { error: "No se puede cancelar una reserva ya aprobada" },
        { status: 400 }
      );
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json(
      { message: "Reserva cancelada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error canceling reservation:", error);
    return NextResponse.json(
      { error: "Error al cancelar la reserva" },
      { status: 500 }
    );
  }
}