// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PUT - Actualizar una reserva (aprobar/rechazar)
export async function PUT(
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

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Estado requerido" },
        { status: 400 }
      );
    }

    // Verificar si la reserva existe
    const reservation = await prisma.reservation.findUnique({
      where: { id },
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

    let updatedReservation;

    // Si se aprueba la reserva
    if (status === "approved") {
      // Buscar un ejemplar disponible
      const availableCopy = reservation.book.copies.find(c => c.status === "available");
      
      if (!availableCopy) {
        return NextResponse.json(
          { error: "No hay ejemplares disponibles para completar la reserva" },
          { status: 400 }
        );
      }

      // Cambiar el estado del ejemplar a "reserved"
      await prisma.copy.update({
        where: { id: availableCopy.id },
        data: { status: "reserved" },
      });

      // Actualizar la reserva
      updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { status: "approved" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              identification: true,
            },
          },
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

      return NextResponse.json({
        success: true,
        message: "Reserva aprobada exitosamente",
        reservation: updatedReservation,
        assignedCopy: {
          id: availableCopy.id,
          code: availableCopy.code,
          status: "reserved",
        },
      });
    }
    
    // Si se rechaza la reserva
    else if (status === "rejected") {
      updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { status: "rejected" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              identification: true,
            },
          },
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

      return NextResponse.json({
        success: true,
        message: "Reserva rechazada",
        reservation: updatedReservation,
      });
    }
    
    // Si se cancela la reserva
    else if (status === "cancelled") {
      // Si la reserva estaba aprobada, liberar el ejemplar
      if (reservation.status === "approved") {
        const reservedCopy = reservation.book.copies.find(c => c.status === "reserved");
        if (reservedCopy) {
          await prisma.copy.update({
            where: { id: reservedCopy.id },
            data: { status: "available" },
          });
        }
      }

      updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { status: "cancelled" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              identification: true,
            },
          },
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

      return NextResponse.json({
        success: true,
        message: "Reserva cancelada",
        reservation: updatedReservation,
      });
    }
    
    else {
      return NextResponse.json(
        { error: "Estado no válido" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una reserva (solo admin)
export async function DELETE(
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

    const reservation = await prisma.reservation.findUnique({
      where: { id },
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

    // Si la reserva estaba aprobada, liberar el ejemplar
    if (reservation.status === "approved") {
      const reservedCopy = reservation.book.copies.find(c => c.status === "reserved");
      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
      }
    }

    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Reserva eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return NextResponse.json(
      { error: "Error al eliminar la reserva" },
      { status: 500 }
    );
  }
}