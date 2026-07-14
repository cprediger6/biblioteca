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

    // ✅ Verificar si la reserva existe e incluir el ejemplar reservado
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
            copies: {
              where: {
                // ✅ Buscar el ejemplar que el usuario reservó
                // Para esto, necesitamos saber qué ejemplar está asociado a la reserva
                // Si no hay un campo específico, debemos buscar el ejemplar que esté en estado "reserved" para este libro y usuario
              },
            },
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

    // ✅ Si la reserva ya no está pendiente, no permitir cambios
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
      // ✅ Buscar el ejemplar específico que el usuario reservó
      // Buscamos un ejemplar que esté en estado "reserved" para este libro
      // y que no tenga un préstamo activo
      const reservedCopy = await prisma.copy.findFirst({
        where: {
          bookId: reservation.bookId,
          status: "reserved",
          loans: {
            none: {
              status: "active",
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // ✅ Si no hay ejemplar reservado, buscar uno disponible
      const availableCopy = reservedCopy || await prisma.copy.findFirst({
        where: {
          bookId: reservation.bookId,
          status: "available",
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      if (!availableCopy) {
        return NextResponse.json(
          { error: "No hay ejemplares disponibles para completar la reserva" },
          { status: 400 }
        );
      }

      // ✅ Cambiar el estado del ejemplar a "borrowed" (prestado)
      await prisma.copy.update({
        where: { id: availableCopy.id },
        data: { status: "borrowed" },
      });

      // ✅ Crear el préstamo automáticamente
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

      // ✅ Actualizar la reserva a "approved"
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

      // ✅ Crear notificación para el usuario
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
      // ✅ Si la reserva estaba reservada, liberar el ejemplar
      const reservedCopy = await prisma.copy.findFirst({
        where: {
          bookId: reservation.bookId,
          status: "reserved",
        },
      });

      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
      }

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

      // ✅ Crear notificación para el usuario
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
      // ✅ Si la reserva estaba reservada, liberar el ejemplar
      const reservedCopy = await prisma.copy.findFirst({
        where: {
          bookId: reservation.bookId,
          status: "reserved",
        },
      });

      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
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

      // ✅ Crear notificación para el usuario
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