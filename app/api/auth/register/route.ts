// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📝 Datos recibidos:", body);

    const { name, email, password, phone, identification } = body;

    // Validar campos requeridos
    if (!name || !email || !password || !identification) {
      console.log("❌ Faltan campos requeridos");
      return NextResponse.json(
        { error: "Faltan campos requeridos: nombre, email, contraseña e identificación son obligatorios" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Email inválido:", email);
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log("❌ Contraseña muy corta");
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Validar identificación
    if (identification.length < 3) {
      console.log("❌ Identificación muy corta");
      return NextResponse.json(
        { error: "El número de identificación debe tener al menos 3 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    console.log("🔍 Verificando email:", email);
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      console.log("❌ Email ya registrado:", email);
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Verificar si la identificación ya existe
    console.log("🔍 Verificando identificación:", identification);
    const existingIdentification = await prisma.user.findUnique({
      where: { identification },
    });

    if (existingIdentification) {
      console.log("❌ Identificación ya registrada:", identification);
      return NextResponse.json(
        { error: "El número de identificación ya está registrado" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    console.log("🔐 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    console.log("👤 Creando usuario...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        identification,
        role: "user",
      },
    });

    console.log("✅ Usuario creado exitosamente:", user.id);

    // Eliminar la contraseña del objeto de respuesta
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error detallado en registro:", error);
    
    // Si es un error de Prisma, mostrar más detalles
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error al registrar usuario: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}