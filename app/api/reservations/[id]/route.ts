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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            identification: true,
          },
        },
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

    // Si la reserva ya no está pendiente, no permitir cambios
    if (reservation.status !== "pending") {
      const statusMap = {
        'approved': 'aprobada',
        'rejected': 'rechazada',
        'cancelled': 'cancelada'
      };
      return NextResponse.json(
        { error: `Esta reserva ya ha sido ${statusMap[reservation.status as keyof typeof statusMap] || 'procesada'}` },
        { status: 400 }
      );
    }

    let updatedReservation;
    let assignedCopy = null;
    let createdLoan = null;

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

      // Cambiar el estado del ejemplar a "borrowed" (prestado)
      await prisma.copy.update({
        where: { id: availableCopy.id },
        data: { status: "borrowed" },
      });

      // Crear el préstamo automáticamente
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 días de préstamo

      createdLoan = await prisma.loan.create({
        data: {
          userId: reservation.userId,
          copyId: availableCopy.id,
          loanDate: new Date(),
          dueDate: dueDate,
          status: "active",
        },
        include: {
          copy: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Actualizar la reserva a "approved"
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

      assignedCopy = {
        id: availableCopy.id,
        code: availableCopy.code,
        status: "borrowed",
      };

      // Crear notificación para el usuario
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          title: "📚 Reserva aprobada y préstamo creado",
          message: `Tu reserva del libro "${reservation.book.title}" ha sido aprobada. 
                    Se ha creado un préstamo con el ejemplar ${availableCopy.code}.
                    Fecha de devolución: ${dueDate.toLocaleDateString('es-ES')}`,
          type: "reservation_approved",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Reserva aprobada y préstamo creado exitosamente",
        reservation: updatedReservation,
        assignedCopy,
        loan: createdLoan,
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

      // Crear notificación para el usuario
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          title: "❌ Reserva rechazada",
          message: `Tu reserva del libro "${reservation.book.title}" ha sido rechazada.`,
          type: "reservation_rejected",
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

      // Crear notificación para el usuario
      await prisma.notification.create({
        data: {
          userId: reservation.userId,
          title: "⛔ Reserva cancelada",
          message: `Tu reserva del libro "${reservation.book.title}" ha sido cancelada.`,
          type: "reservation_cancelled",
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

    // Primero obtener la reserva con sus relaciones
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

    // Si la reserva está aprobada, buscar el ejemplar que fue reservado
    if (reservation.status === "approved") {
      // Buscar el préstamo asociado a esta reserva
      const loan = await prisma.loan.findFirst({
        where: {
          userId: reservation.userId,
          copy: {
            bookId: reservation.bookId,
          },
          status: "active",
        },
        include: {
          copy: true,
        },
      });

      if (loan) {
        // Liberar el ejemplar
        await prisma.copy.update({
          where: { id: loan.copyId },
          data: { status: "available" },
        });

        // Marcar el préstamo como devuelto
        await prisma.loan.update({
          where: { id: loan.id },
          data: {
            status: "returned",
            returnDate: new Date(),
          },
        });
      }
    }

    // Eliminar la reserva
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