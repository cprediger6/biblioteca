// components/ReserveButton.tsx (con opción forzar)
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ReserveButtonProps {
  bookId: string;
  className?: string;
}

export function ReserveButton({ bookId, className = "" }: ReserveButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleReserve = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
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
        // Si hay ejemplares disponibles, preguntar si quiere forzar la reserva
        if (data.hasAvailableCopies) {
          if (confirm(`Hay ${data.availableCopies} ejemplar(es) disponible(s). ¿Deseas hacer una reserva de todas formas?`)) {
            // Reintentar con force=true
            const forceResponse = await fetch("/api/reservations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ bookId, force: true }),
            });
            
            const forceData = await forceResponse.json();
            
            if (!forceResponse.ok) {
              throw new Error(forceData.error || "Error al realizar la reserva");
            }
            
            setMessage({
              type: 'success',
              text: '✅ ¡Reserva realizada con éxito! Redirigiendo...',
            });
            
            setTimeout(() => {
              router.push("/cliente/reservas");
            }, 2000);
            
            return;
          }
          return;
        }
        throw new Error(data.error || "Error al realizar la reserva");
      }

      setMessage({
        type: 'success',
        text: '✅ ¡Reserva realizada con éxito! Redirigiendo...',
      });

      setTimeout(() => {
        router.push("/cliente/reservas");
      }, 2000);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Error al realizar la reserva",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleReserve}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Bookmark size={16} />
            Reservar
          </>
        )}
      </button>

      {message && (
        <div className={`flex items-start gap-2 text-xs p-2.5 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          ) : message.type === 'info' ? (
            <Info size={14} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}