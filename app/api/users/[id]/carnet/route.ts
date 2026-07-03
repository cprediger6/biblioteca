// app/api/users/[id]/carnet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Carnet - ${user.name}</title>
  <style>
    body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; font-family: Arial, sans-serif; }
    .carnet { width: 85.5mm; height: 54mm; background: white; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 4mm; border: 2px solid #1a1a2e; box-sizing: border-box; }
    .card-content { display: flex; height: 100%; gap: 6px; }
    .left-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-right: 6px; }
    .photo { width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 4px; overflow: hidden; }
    .photo-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #4f46e5; }
    .left-text { font-size: 5px; text-align: center; color: #1a1a2e; }
    .right-section { flex: 2; padding-left: 6px; border-left: 1px solid #e5e7eb; }
    .header { font-size: 8px; font-weight: bold; color: #1a1a2e; margin-bottom: 2px; }
    .label { font-size: 4.5px; color: #6b7280; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 6.5px; font-weight: 600; color: #1a1a2e; }
    .barcode-container { margin-top: 2px; text-align: center; }
    .barcode-container svg { max-width: 120px; height: auto; }
    .footer { font-size: 4px; color: #9ca3af; text-align: center; margin-top: 2px; }
    .role-badge { font-size: 5px; font-weight: bold; color: white; background: #4f46e5; padding: 2px 8px; border-radius: 2px; margin-top: 2px; }
    .info-row { display: flex; gap: 4px; margin-top: 1px; }
    .info-col { flex: 1; }
    #barcode-container { display: flex; justify-content: center; align-items: center; width: 100%; }
    @media print { body { padding: 0; background: white; } .carnet { box-shadow: none; margin: 0; } }
  </style>
</head>
<body>
  <div class="carnet">
    <div class="card-content">
      <div class="left-section">
        ${user.photo ? `<img src="${user.photo}" class="photo-img" alt="Foto" />` : `<div class="photo">📚</div>`}
        <div class="left-text" style="font-weight:bold;font-size:5px;">${user.name.split(' ')[0]}</div>
        <div class="role-badge">${user.role === 'admin' ? 'ADMIN' : 'USUARIO'}</div>
      </div>
      <div class="right-section">
        <div class="header">📚 Biblioteca+</div>
        <div><div class="label">NOMBRE COMPLETO</div><div class="value">${user.name}</div></div>
        <div><div class="label">IDENTIFICACIÓN</div><div class="value">${user.identification}</div></div>
        <div class="info-row">
          <div class="info-col"><div class="label">EMAIL</div><div class="value" style="font-size:5px;">${user.email}</div></div>
          <div class="info-col"><div class="label">TELÉFONO</div><div class="value" style="font-size:5px;">${user.phone || 'N/A'}</div></div>
        </div>
        <div class="barcode-container">
          <div id="barcode-container"></div>
        </div>
        <div class="footer">Válido desde ${new Date(user.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <script>
    (function() {
      function generateBarcode() {
        const container = document.getElementById('barcode-container');
        if (!container) return;
        try {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '150');
          svg.setAttribute('height', '40');
          if (typeof JsBarcode !== 'undefined') {
            JsBarcode(svg, '${user.identification}', {
              format: "CODE128",
              width: 1.2,
              height: 30,
              displayValue: true,
              fontSize: 10,
              font: "monospace",
              textMargin: 2,
              background: "#ffffff",
              lineColor: "#000000",
              margin: 5,
            });
            container.appendChild(svg);
          } else {
            container.innerHTML = '<div style="font-family:monospace;font-size:12px;letter-spacing:2px;padding:4px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;">*${user.identification}*</div>';
          }
        } catch(e) {
          container.innerHTML = '<div style="font-family:monospace;font-size:12px;letter-spacing:2px;padding:4px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;">*${user.identification}*</div>';
        }
      }
      if (document.readyState === 'complete') generateBarcode();
      else window.addEventListener('load', generateBarcode);
    })();
  </script>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 1000); }, 500);
    }
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="carnet-${user.identification}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating carnet:", error);
    return NextResponse.json(
      { error: "Error al generar el carnet" },
      { status: 500 }
    );
  }
}