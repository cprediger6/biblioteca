// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    try {
      // Obtener todas las configuraciones
      const settings = await prisma.settings.findMany();
      
      // Convertir a objeto clave-valor
      const settingsMap: Record<string, string> = {};
      settings.forEach((s: any) => {
        settingsMap[s.key] = s.value;
      });

      // ✅ Obtener todas las monedas disponibles
      const currencies = await prisma.currency.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ 
        settings: settingsMap,
        currencies,
      });
    } catch (error) {
      console.warn("Error obteniendo configuraciones:", error);
      return NextResponse.json({
        settings: {
          siteName: "Biblioteca+",
          maxLoans: "5",
          loanDays: "14",
          enableNotifications: "true",
          theme: "light",
          monthlyFee: "10",
          currency: "USD",
        },
        currencies: [],
      });
    }
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    return NextResponse.json(
      { error: "Error al obtener configuraciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: "Datos de configuración inválidos" },
        { status: 400 }
      );
    }

    // Guardar cada configuración usando upsert
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      try {
        const result = await prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            description: `Configuración: ${key}`,
          },
        });
        results.push(result);
      } catch (error) {
        console.error(`Error guardando ${key}:`, error);
      }
    }

    return NextResponse.json({
      message: "Configuración guardada exitosamente",
      settings: results,
    });
  } catch (error) {
    console.error("Error al guardar configuraciones:", error);
    return NextResponse.json(
      { error: "Error al guardar configuraciones" },
      { status: 500 }
    );
  }
}