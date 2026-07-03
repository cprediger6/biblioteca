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
        { error: "El ejemplar no está disponible" },
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

    // Actualizar el estado del ejemplar
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