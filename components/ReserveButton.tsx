// components/ReserveButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, CheckCircle, AlertCircle, Info, Library } from "lucide-react";

interface ReserveButtonProps {
  bookId: string;
  className?: string;
}

export function ReserveButton({ bookId, className = "" }: ReserveButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const handleReserve = async () => {
    if (!isMounted) return;

    if (isLoading) {
      setMessage({
        type: 'info',
        text: '⏳ Verificando autenticación...',
      });
      return;
    }

    if (!isAuthenticated || !session) {
      setMessage({
        type: 'info',
        text: '🔑 Inicia sesión para reservar libros',
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setMessage({
            type: 'info',
            text: '🔑 Tu sesión ha expirado. Inicia sesión nuevamente.',
          });
          setTimeout(() => {
            router.push("/login");
          }, 1500);
          return;
        }

        if (response.status === 400) {
          // Si no hay ejemplares disponibles
          if (data.hasAvailableCopies === false) {
            setMessage({
              type: 'error',
              text: '❌ No hay ejemplares disponibles para este libro.',
            });
            return;
          }
        }
        
        throw new Error(data.error || "Error al realizar la reserva");
      }

      // Reserva exitosa
      setMessage({
        type: 'success',
        text: `✅ ¡Reserva realizada con éxito! Ejemplar ${data.assignedCopy?.code || ''} asignado.`,
      });

      setTimeout(() => {
        router.push("/cliente/reservas");
        router.refresh();
      }, 2000);

    } catch (error) {
      console.error("❌ Error en reserva:", error);
      let errorMessage = "Error al realizar la reserva";
      
      if (error instanceof Error) {
        if (error.message.includes("límite máximo")) {
          errorMessage = "⚠️ Has alcanzado el límite máximo de 3 reservas activas";
        } else if (error.message.includes("Ya tienes una reserva activa")) {
          errorMessage = "📖 Ya tienes una reserva activa para este libro";
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <button
        disabled
        className={`w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed ${className}`}
      >
        <Loader2 size={16} className="animate-spin" />
        Cargando...
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleReserve}
        disabled={loading || isLoading}
        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Procesando...
          </>
        ) : isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <Bookmark size={16} />
            Reservar
          </>
        )}
      </button>

      {message && (
        <div className={`flex items-start gap-2 text-sm p-3 rounded-lg shadow-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          ) : message.type === 'info' ? (
            <Library size={16} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{message.text}</span>
        </div>
      )}
    </div>
  );
}