// app/cliente/reservas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Bookmark,
  Eye,
  Trash2,
} from "lucide-react";

type Reservation = {
  id: string;
  userId: string;
  bookId: string;
  reserveDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string | null;
    description: string | null;
    publisher: string | null;
    year: number | null;
  };
};

const statusColors = {
  pending: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-600",
    icon: Clock,
    label: "Pendiente",
  },
  approved: {
    bg: "bg-green-500/20",
    text: "text-green-600",
    icon: CheckCircle,
    label: "Aprobada",
  },
  rejected: {
    bg: "bg-red-500/20",
    text: "text-red-600",
    icon: XCircle,
    label: "Rechazada",
  },
  cancelled: {
    bg: "bg-gray-500/20",
    text: "text-gray-600",
    icon: XCircle,
    label: "Cancelada",
  },
};

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchReservations();
    }
  }, [status, router, filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const url = filter !== "all" 
        ? `/api/reservations?status=${filter}`
        : "/api/reservations";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar las reservas");
      
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    try {
      setIsCancelling(reservationId);
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cancelar la reserva");
      }

      // Actualizar la lista
      setReservations(prev => 
        prev.filter(res => res.id !== reservationId)
      );
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al cancelar la reserva");
    } finally {
      setIsCancelling(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => fetchReservations()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mis Reservas
          </h1>
          <p className="text-gray-500 text-sm">
            Gestiona todas tus reservas de libros
          </p>
          
          {/* Filtros */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { value: "all", label: "Todas" },
              { value: "pending", label: "Pendientes" },
              { value: "approved", label: "Aprobadas" },
              { value: "rejected", label: "Rechazadas" },
              { value: "cancelled", label: "Canceladas" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                  ${
                    filter === f.value
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de reservas */}
        {reservations.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No tienes reservas
            </h2>
            <p className="text-gray-400 mb-6">
              {filter !== "all" 
                ? "No hay reservas con este estado"
                : "Explora el catálogo y reserva tus libros favoritos"}
            </p>
            <Link
              href="/cliente/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg"
            >
              <BookOpen size={20} />
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => {
              const statusInfo = statusColors[reservation.status as keyof typeof statusColors];
              const StatusIcon = statusInfo?.icon || Clock;

              return (
                <div
                  key={reservation.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Portada del libro */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {reservation.book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reservation.book.coverImage}
                        alt={reservation.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badge de estado */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusInfo?.bg} backdrop-blur-sm`}>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon size={14} className={statusInfo?.text} />
                        <span className={`text-xs font-medium ${statusInfo?.text}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>

                    {/* Fecha de reserva */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-white/70" />
                        <span className="text-xs text-white/90">
                          {new Date(reservation.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del libro */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg truncate">
                      {reservation.book.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {reservation.book.author}
                    </p>
                    
                    {reservation.book.year && (
                      <p className="text-xs text-gray-400 mt-1">
                        {reservation.book.year}
                        {reservation.book.publisher && ` • ${reservation.book.publisher}`}
                      </p>
                    )}

                    {reservation.book.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {reservation.book.description}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/cliente/libro/${reservation.bookId}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        <Eye size={16} />
                        Ver libro
                      </Link>

                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => cancelReservation(reservation.id)}
                          disabled={isCancelling === reservation.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCancelling === reservation.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}