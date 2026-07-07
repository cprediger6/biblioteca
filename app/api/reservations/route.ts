// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener reservas (admin: todas, cliente: sus propias)
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

    // Construir filtros
    const where: any = {};
    
    // Si no es admin, solo ver sus propias reservas
    if (!isAdmin) {
      where.userId = session.user.id;
    }

    if (status) where.status = status;

    // Obtener reservas
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

// POST - Crear una nueva reserva (cliente y admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
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
      include: {
        copies: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Libro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay al menos un ejemplar disponible
    const availableCopies = book.copies.filter(c => c.status === "available");
    
    // Si NO hay ejemplares disponibles, no se puede reservar
    if (availableCopies.length === 0) {
      return NextResponse.json(
        { 
          error: "No hay ejemplares disponibles para este libro.",
          hasAvailableCopies: false,
          availableCopies: 0,
        },
        { status: 400 }
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

    // Obtener el primer ejemplar disponible
    const firstAvailableCopy = availableCopies[0];

    // Crear la reserva
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

    // Marcar el ejemplar como "reserved"
    await prisma.copy.update({
      where: { id: firstAvailableCopy.id },
      data: { status: "reserved" },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente",
      reservation,
      assignedCopy: {
        id: firstAvailableCopy.id,
        code: firstAvailableCopy.code,
        status: "reserved",
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva. Por favor, intenta nuevamente." },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar una reserva (cliente)
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

    // Verificar que la reserva existe y pertenece al usuario
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: session.user.id,
      },
      include: {
        book: {
          include: {
            copies: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Solo permitir cancelar reservas pendientes
    if (reservation.status === "approved") {
      // Si estaba aprobada, liberar el ejemplar
      const reservedCopy = reservation.book.copies.find(c => c.status === "reserved");
      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
      }
      return NextResponse.json(
        { error: "No se puede cancelar una reserva ya aprobada" },
        { status: 400 }
      );
    }

    // Si la reserva está pendiente y tiene un ejemplar reservado, liberarlo
    if (reservation.status === "pending") {
      const reservedCopy = reservation.book.copies.find(c => c.status === "reserved");
      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
      }
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada exitosamente",
    });
  } catch (error) {
    console.error("Error canceling reservation:", error);
    return NextResponse.json(
      { error: "Error al cancelar la reserva" },
      { status: 500 }
    );
  }
}