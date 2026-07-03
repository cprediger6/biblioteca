// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
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
      // Si admin intenta acceder a rutas de cliente, permitir o redirigir
      // Mejor redirigir al dashboard de admin
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