// app/api/admin/loans/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("🚀 API /api/admin/loans/active iniciada");
  
  try {
    console.log("🔐 Verificando sesión...");
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log("❌ No hay sesión");
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }
    
    console.log("👤 Usuario:", session.user?.email);
    console.log("🔑 Rol:", session.user?.role);

    if (session.user?.role !== "admin") {
      console.log("❌ No es admin");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    console.log("📚 Consultando préstamos activos...");
    const activeLoans = await prisma.loan.findMany({
      where: {
        status: "active",
      },
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
                coverImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        loanDate: "desc",
      },
      take: 100, // Limitar resultados
    });

    console.log(`✅ ${activeLoans.length} préstamos activos encontrados`);
    return NextResponse.json({ loans: activeLoans });
  } catch (error) {
    console.error("❌ Error en API:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener préstamos activos",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}