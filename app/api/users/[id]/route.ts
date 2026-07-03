// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Eliminar un usuario
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

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        loans: true,
        reservations: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // No permitir eliminar el propio usuario
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Verificar si el usuario tiene préstamos activos
    const activeLoans = existingUser.loans.filter(
      loan => loan.status === "active" || loan.status === "overdue"
    );

    if (activeLoans.length > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar el usuario porque tiene ${activeLoans.length} préstamo(s) activo(s)`,
          activeLoans: activeLoans.length
        },
        { status: 400 }
      );
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}

// GET - Obtener un usuario específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        identification: true,
        photo: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loans: true,
            reservations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, identification, role, password, photo } = body;

    // Validar campos requeridos
    if (!name || !email || !identification) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, email e identificación son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el email ya existe (excepto el propio usuario)
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "El email ya está registrado por otro usuario" },
          { status: 400 }
        );
      }
    }

    // Verificar si la identificación ya existe (excepto el propio usuario)
    if (identification !== existingUser.identification) {
      const identificationExists = await prisma.user.findUnique({
        where: { identification },
      });
      if (identificationExists) {
        return NextResponse.json(
          { error: "El número de identificación ya está registrado por otro usuario" },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const data: any = {
      name,
      email,
      phone: phone || null,
      identification,
      role,
      photo: photo || null,
    };

    // Si se proporciona contraseña, hashearla
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres" },
          { status: 400 }
        );
      }
      const bcrypt = await import('bcryptjs');
      data.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}