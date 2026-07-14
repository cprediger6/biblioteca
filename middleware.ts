// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    const path = req.nextUrl.pathname;

    // Si no hay token, redirigir al login
    if (!token) {
      // Permitir acceso a páginas públicas
      if (path === "/login" || path === "/register" || path === "/") {
        return NextResponse.next();
      }
      // Redirigir al login para rutas protegidas
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Si está autenticado y va al login, redirigir según rol
    if (path === "/login" && token) {
      if (token.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/cliente/dashboard", req.url));
      }
    }

    // ✅ VERIFICAR ESTADO DEL USUARIO (SOLO PARA CLIENTES)
    // Usuario bloqueado - No puede acceder a nada
    if (token.status === "blocked" && token.role !== "admin") {
      // Permitir solo logout y páginas de bloqueo
      if (path !== "/api/auth/signout" && 
          path !== "/api/auth/session" && 
          path !== "/cliente/blocked") {
        return NextResponse.redirect(new URL("/cliente/blocked", req.url));
      }
    }

    // Usuario suspendido - Acceso limitado
    if (token.status === "suspended" && token.role !== "admin") {
      // Rutas permitidas para usuarios suspendidos
      const allowedPaths = [
        "/cliente/dashboard",
        "/cliente/profile",
        "/cliente/pagos",
        "/cliente/payments",
        "/cliente/suspended",
        "/cliente/history",
        "/api/cliente/payments",
        "/api/cliente/profile",
        "/api/auth/signout",
        "/api/auth/session",
      ];
      
      const isAllowedPath = allowedPaths.some(allowedPath => 
        path === allowedPath || path.startsWith(allowedPath + '/')
      );

      // Si no está en una ruta permitida y no es admin, redirigir a suspensión
      if (!isAllowedPath && !path.startsWith("/api/")) {
        return NextResponse.redirect(new URL("/cliente/suspended", req.url));
      }
    }

    // === PROTEGER RUTAS DE ADMINISTRADOR ===
    // Cualquier ruta que comience con /admin o /dashboard requiere rol admin
    if (path.startsWith("/admin") || path.startsWith("/dashboard")) {
      if (token.role !== "admin") {
        // Si es usuario cliente, redirigir a su dashboard
        return NextResponse.redirect(new URL("/cliente/dashboard", req.url));
      }
    }

    // === PROTEGER RUTAS DE CLIENTE ===
    if (path.startsWith("/cliente") && token.role === "admin") {
      // Si admin intenta acceder a rutas de cliente, redirigir al dashboard de admin
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Permitir acceso a páginas públicas
        if (path === "/login" || path === "/register" || path === "/") {
          return true;
        }

        // Usuarios bloqueados no pueden acceder a ninguna ruta
        if (token?.status === "blocked" && token.role !== "admin") {
          return false;
        }

        // Requerir autenticación para todas las demás rutas
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",      // Proteger todas las rutas de admin
    "/dashboard/:path*",  // Proteger dashboard
    "/cliente/:path*",    // Proteger rutas de cliente
    "/login",
    "/register",
    "/",
  ],
};