// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Obtener todos los préstamos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { copy: { book: { title: { contains: search, mode: "insensitive" } } } },
        { copy: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            identification: true,
          },
        },
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
      },
      orderBy: { loanDate: "desc" },
    });

    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      { error: "Error al obtener préstamos" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo préstamo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, copyId, loanDate, dueDate } = body;

    if (!userId || !copyId || !loanDate || !dueDate) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el ejemplar existe y está disponible
    const copy = await prisma.copy.findUnique({
      where: { id: copyId },
      include: { book: true },
    });
    if (!copy) {
      return NextResponse.json(
        { error: "Ejemplar no encontrado" },
        { status: 404 }
      );
    }
    if (copy.status !== "available") {
      return NextResponse.json(
        { error: `El ejemplar no está disponible. Estado actual: ${copy.status}` },
        { status: 400 }
      );
    }

    // Crear el préstamo
    const loan = await prisma.loan.create({
      data: {
        userId,
        copyId,
        loanDate: new Date(loanDate),
        dueDate: new Date(dueDate),
        status: "active",
      },
      include: {
        user: true,
        copy: {
          include: { book: true },
        },
      },
    });

    // Actualizar el estado del ejemplar a "loaned"
    await prisma.copy.update({
      where: { id: copyId },
      data: { status: "loaned" },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error("Error creating loan:", error);
    return NextResponse.json(
      { error: "Error al crear préstamo" },
      { status: 500 }
    );
  }
}

// DELETE - Marcar préstamo como devuelto
// app/api/reservations/route.ts (añadir el DELETE para clientes)
// Este ya lo tienes en el archivo principal, pero asegúrate de que esté así:

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

    // Si la reserva estaba "fulfilled", liberar el ejemplar
    if (reservation.status === "fulfilled") {
      const reservedCopy = reservation.book.copies.find(c => c.status === "reserved");
      
      if (reservedCopy) {
        await prisma.copy.update({
          where: { id: reservedCopy.id },
          data: { status: "available" },
        });
      }
    }

    // Solo permitir cancelar reservas que no estén fulfilled (aprobadas)
    if (reservation.status === "fulfilled") {
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