// app/api/debug/check-schema/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Intentamos obtener un usuario para ver los campos disponibles
    const user = await prisma.user.findFirst();
    
    return NextResponse.json({
      message: 'Estructura del modelo User (basado en el primer registro)',
      availableFields: user ? Object.keys(user) : 'No hay usuarios en la base de datos',
      hasStatusField: user ? 'status' in user : false,
    });
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    return NextResponse.json({ error: 'Error en el diagnóstico' }, { status: 500 });
  }
}