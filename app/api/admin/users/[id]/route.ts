// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    // ✅ Usar include en lugar de select para evitar problemas con campos que pueden no existir
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loans: true,
            reservations: true,
            payments: true,
          },
        },
        loans: {
          include: {
            copy: {
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
            },
          },
          orderBy: {
            loanDate: "desc",
          },
          take: 10,
        },
        reservations: {
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
            reserveDate: "desc",
          },
          take: 10,
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, identification, role, status, photo } = body;

    // ✅ Usar include en lugar de select
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const validStatuses = ["active", "suspended", "blocked", "inactive"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Los estados permitidos son: active, suspended, blocked, inactive" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (identification) updateData.identification = identification;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (photo !== undefined) updateData.photo = photo;

    // ✅ Manejar status de forma segura
    // @ts-ignore - El campo puede no existir en producción
    const currentStatus = existingUser.status || "active";

    // Notificaciones según cambio de estado
    if (status === "active" && currentStatus !== "active") {
      await prisma.notification.create({
        data: {
          userId: id,
          title: "Cuenta reactivada",
          message: "Tu cuenta ha sido reactivada exitosamente.",
          type: "reactivation",
        },
      });
    }

    if (status === "suspended" && currentStatus !== "suspended") {
      await prisma.notification.create({
        data: {
          userId: id,
          title: "Cuenta suspendida",
          message: "Tu cuenta ha sido suspendida por falta de pago.",
          type: "suspension",
        },
      });
    }

    if (status === "blocked" && currentStatus !== "blocked") {
      await prisma.notification.create({
        data: {
          userId: id,
          title: "Cuenta bloqueada",
          message: "Tu cuenta ha sido bloqueada por razones de seguridad.",
          type: "blocked",
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            loans: true,
            reservations: true,
            payments: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}