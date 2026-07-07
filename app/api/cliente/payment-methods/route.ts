// app/api/cliente/payment-methods/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Datos de ejemplo (en una implementación real, vendrían de la BD)
    const methods = [
      {
        id: '1',
        type: 'credit_card',
        lastFour: '4242',
        brand: 'Visa',
        isDefault: true,
        expiryDate: '12/26',
        holderName: 'Juan Pérez',
      },
      {
        id: '2',
        type: 'credit_card',
        lastFour: '5555',
        brand: 'Mastercard',
        isDefault: false,
        expiryDate: '08/25',
        holderName: 'Juan Pérez',
      },
    ];

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Error al obtener métodos de pago" },
      { status: 500 }
    );
  }
}