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

    // ✅ Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ✅ Validar estados permitidos
    const validStatuses = ["active", "suspended", "blocked", "inactive"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Los estados permitidos son: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // ✅ Construir datos a actualizar - SOLO los campos que existen
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (identification !== undefined) updateData.identification = identification;
    if (role !== undefined) updateData.role = role;
    if (photo !== undefined) updateData.photo = photo;
    
    // ✅ Manejar status de forma segura
    // Comprobamos dinámicamente si la propiedad `status` existe en el modelo
    let statusFieldExists = false;
    try {
      // Obtenemos un usuario completo (sin select) y comprobamos la propiedad en tiempo de ejecución
      const testUser = await prisma.user.findFirst();
      statusFieldExists = !!testUser && Object.prototype.hasOwnProperty.call(testUser, 'status');
    } catch (error) {
      statusFieldExists = false;
      console.warn('⚠️ El campo status no existe en el modelo o hubo un error al comprobarlo', error);
    }

    // Solo agregar status si el campo existe
    if (status !== undefined && statusFieldExists) {
      updateData.status = status;
      console.log('✅ Campo status agregado para actualización');
    } else if (status !== undefined && !statusFieldExists) {
      console.warn('⚠️ El campo status no existe en el modelo, ignorando actualización de status');
    }

    // ✅ Si no hay datos para actualizar, devolver error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    // ✅ Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // ✅ Obtener el usuario actualizado con conteos
    const userWithCounts = await prisma.user.findUnique({
      where: { id },
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
      user: userWithCounts,
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return NextResponse.json(
      { 
        error: "Error al actualizar el usuario",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
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