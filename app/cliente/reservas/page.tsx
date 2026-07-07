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
  Info,
  ChevronDown,
  ChevronUp
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

const statusConfig = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
    label: "Pendiente",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    badgeBg: "bg-yellow-500/90"
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle,
    label: "Aprobada",
    border: "border-green-200",
    dot: "bg-green-500",
    badgeBg: "bg-green-500/90"
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
    label: "Rechazada",
    border: "border-red-200",
    dot: "bg-red-500",
    badgeBg: "bg-red-500/90"
  },
  cancelled: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: XCircle,
    label: "Cancelada",
    border: "border-gray-200",
    dot: "bg-gray-500",
    badgeBg: "bg-gray-500/90"
  }
};

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);

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

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return <Icon size={16} className={config.text} />;
  };

  // Estadísticas
  const totalCount = reservations.length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const approvedCount = reservations.filter(r => r.status === 'approved').length;
  const rejectedCount = reservations.filter(r => r.status === 'rejected').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">📋 Mis Reservas</h1>
              <p className="text-indigo-100 text-sm mt-1">
                Gestiona todas tus reservas de libros
              </p>
            </div>
            <Link
              href="/cliente/catalogo"
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <BookOpen size={18} />
              Explorar catálogo
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <span className="font-semibold">{totalCount}</span>
              <span className="text-indigo-100">Total</span>
            </div>
            {pendingCount > 0 && (
              <div className="bg-yellow-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <span className="font-semibold">{pendingCount}</span>
                <span className="text-indigo-100">Pendientes</span>
              </div>
            )}
            {approvedCount > 0 && (
              <div className="bg-green-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <span className="font-semibold">{approvedCount}</span>
                <span className="text-indigo-100">Aprobadas</span>
              </div>
            )}
            {rejectedCount > 0 && (
              <div className="bg-red-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <span className="font-semibold">{rejectedCount}</span>
                <span className="text-indigo-100">Rechazadas</span>
              </div>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 mr-2">Filtrar:</span>
            {[
              { value: "all", label: "Todas" },
              { value: "pending", label: "⏳ Pendientes" },
              { value: "approved", label: "✅ Aprobadas" },
              { value: "rejected", label: "❌ Rechazadas" },
              { value: "cancelled", label: "⛔ Canceladas" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition
                  ${
                    filter === f.value
                      ? "bg-indigo-600 text-white shadow-md"
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
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <Bookmark className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {filter !== "all" ? "No hay reservas con este estado" : "No tienes reservas"}
            </h2>
            <p className="text-gray-400 mb-6">
              {filter !== "all" 
                ? "Prueba con otro filtro para ver más reservas"
                : "Explora el catálogo y reserva tus libros favoritos"}
            </p>
            <Link
              href="/cliente/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition shadow-md"
            >
              <BookOpen size={20} />
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {reservations.map((reservation) => {
              const statusInfo = statusConfig[reservation.status as keyof typeof statusConfig];
              const isExpanded = expandedReservation === reservation.id;

              return (
                <div
                  key={reservation.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border ${statusInfo?.border || 'border-gray-100'}`}
                >
                  {/* Portada del libro */}
                  <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200">
                    {reservation.book.coverImage ? (
                      <img
                        src={reservation.book.coverImage}
                        alt={reservation.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Badge de estado */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusInfo?.bg} backdrop-blur-sm border ${statusInfo?.border}`}>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(reservation.status as keyof typeof statusConfig)}
                        <span className={`text-xs font-medium ${statusInfo?.text}`}>
                          {statusInfo?.label}
                        </span>
                      </div>
                    </div>

                    {/* Fecha de reserva */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
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

                    {/* Badge de estado simplificado en móvil */}
                    <div className="absolute top-3 left-3 sm:hidden">
                      <span className={`w-2 h-2 rounded-full ${statusInfo?.dot}`} />
                    </div>
                  </div>

                  {/* Información del libro */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-base truncate">
                          {reservation.book.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {reservation.book.author}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedReservation(isExpanded ? null : reservation.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100 flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                    
                    {reservation.book.year && (
                      <p className="text-xs text-gray-400 mt-1">
                        {reservation.book.year}
                        {reservation.book.publisher && ` • ${reservation.book.publisher}`}
                      </p>
                    )}

                    {/* Descripción expandible */}
                    {isExpanded && reservation.book.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fadeIn">
                        <p className="text-sm text-gray-600 line-clamp-4">
                          {reservation.book.description}
                        </p>
                      </div>
                    )}

                    {/* Fecha detallada en expandido */}
                    {isExpanded && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>Reservado: {new Date(reservation.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
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
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Pie de página */}
        {reservations.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{reservations.length}</span> reservas
            {filter !== "all" && ` con estado "${filter}"`}
          </div>
        )}
      </div>
    </div>
  );
}