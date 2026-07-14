// app/api/cliente/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
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

    // Verificar que el libro existe
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        _count: {
          select: {
            copies: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que hay ejemplares disponibles
    const availableCopies = await prisma.copy.count({
      where: {
        bookId: bookId,
        status: "available",
      },
    });

    if (availableCopies < 1) {
      return NextResponse.json(
        { error: "No hay ejemplares disponibles para reservar" },
        { status: 400 }
      );
    }

    // Verificar que el usuario no tenga una reserva activa para este libro
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId,
        status: "pending",
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "Ya tienes una reserva activa para este libro" },
        { status: 400 }
      );
    }

    // Crear la reserva
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        bookId: bookId,
        status: "pending",
        reserveDate: new Date(),
      },
    });

    // Opcional: Actualizar el estado de un ejemplar a "reserved"
    // Esto se puede hacer cuando el usuario recoge el libro físicamente

    return NextResponse.json({
      message: "Reserva creada exitosamente",
      reservation,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}

// Opcional: Obtener las reservas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: session.user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}