// app/api/admin/loans/active/route.ts (versión con logging adicional)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("🔍 API /api/admin/loans/active fue llamada");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("👤 Sesión:", session?.user?.email);
    
    if (!session || session.user?.role !== "admin") {
      console.log("❌ No autorizado");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    console.log("📚 Buscando préstamos activos...");
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
    });

    console.log(`✅ Encontrados ${activeLoans.length} préstamos activos`);
    return NextResponse.json({ loans: activeLoans });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error al obtener préstamos activos", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}