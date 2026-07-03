// components/AdminGuard.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Si la sesión está cargando, no hacer nada
    if (status === "loading") return;

    // Si no hay sesión, redirigir al login
    if (!session) {
      router.push("/login");
      return;
    }

    // Verificar si el usuario es administrador
    if (session.user?.role !== "admin") {
      // Redirigir al dashboard de cliente
      router.push("/cliente/dashboard");
      return;
    }

    // Si es administrador, permitir acceso
    setIsAuthorized(true);
  }, [session, status, router]);

  // Mostrar loading mientras se verifica
  if (status === "loading" || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}