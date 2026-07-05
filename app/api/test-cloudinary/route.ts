// app/api/test-cloudinary/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  try {
    console.log("=== TEST DE CONFIGURACIÓN CLOUDINARY ===");
    
    // Verificar variables de entorno
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log("Cloud Name:", cloudName);
    console.log("API Key:", apiKey ? "✅ Configurado" : "❌ No configurado");
    console.log("API Secret:", apiSecret ? "✅ Configurado" : "❌ No configurado");

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: "Faltan variables de entorno de Cloudinary",
        missing: {
          cloud_name: !cloudName,
          api_key: !apiKey,
          api_secret: !apiSecret,
        }
      }, { status: 500 });
    }

    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Intentar hacer ping
    try {
      const pingResult = await cloudinary.api.ping();
      console.log("Ping exitoso:", pingResult);
      
      return NextResponse.json({
        success: true,
        message: "Cloudinary está configurado correctamente",
        config: {
          cloud_name: cloudName,
          api_key: apiKey ? "✅" : "❌",
          api_secret: apiSecret ? "✅" : "❌",
        },
        ping: pingResult,
      });
    } catch (pingError: any) {
      console.error("Error en ping - Completo:", pingError);
      
      // Extraer información detallada del error
      let errorMessage = "Error desconocido";
      let errorCode = "";
      let errorHttpCode = "";
      
      if (pingError) {
        errorMessage = pingError.message || JSON.stringify(pingError);
        errorCode = pingError.error?.code || pingError.code || "";
        errorHttpCode = pingError.http_code || pingError.statusCode || "";
      }

      console.log("Detalles del error:", {
        message: errorMessage,
        code: errorCode,
        httpCode: errorHttpCode,
      });

      return NextResponse.json({
        success: false,
        error: errorMessage,
        code: errorCode,
        httpCode: errorHttpCode,
        config: {
          cloud_name: cloudName,
          api_key: apiKey ? "✅" : "❌",
          api_secret: apiSecret ? "✅" : "❌",
        },
        fullError: pingError,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error general:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Error desconocido",
      stack: error.stack,
    }, { status: 500 });
  }
}