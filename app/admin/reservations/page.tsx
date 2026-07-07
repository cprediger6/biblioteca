// app/admin/reservations/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Barcode,
  RefreshCw
} from "lucide-react";

type Reservation = {
  id: string;
  userId: string;
  bookId: string;
  reserveDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string | null;
  };
};

type ReservationDetail = Reservation & {
  assignedCopy: {
    id: string;
    code: string;
    status: string;
  } | null;
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== "all" 
        ? `/api/reservations?status=${statusFilter}`
        : "/api/reservations";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar las reservas");
      
      const data = await response.json();
      
      // Obtener detalles de ejemplares asignados para cada reserva
      const reservationsWithCopies = await Promise.all(
        data.map(async (reservation: Reservation) => {
          // Buscar el ejemplar reservado para esta reserva
          const copyResponse = await fetch(`/api/copies?bookId=${reservation.bookId}&status=reserved`);
          const copyData = await copyResponse.json();
          const assignedCopy = copyData.copies?.[0] || null;
          
          return {
            ...reservation,
            assignedCopy,
          };
        })
      );
      
      setReservations(reservationsWithCopies);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: 'approved' | 'rejected' | 'cancelled') => {
    if (!confirm(`¿Estás seguro de ${newStatus === 'approved' ? 'aprobar' : newStatus === 'rejected' ? 'rechazar' : 'cancelar'} esta reserva?`)) {
      return;
    }

    setProcessingId(reservationId);
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la reserva");
      }

      // Recargar la lista de reservas
      await fetchReservations();
      
      // Si el modal está abierto, cerrarlo
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedReservation(null);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al procesar la reserva");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pendiente",
        border: "border-yellow-200"
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Aprobada",
        border: "border-green-200"
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Rechazada",
        border: "border-red-200"
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: XCircle,
        label: "Cancelada",
        border: "border-gray-200"
      }
    };

    const style = config[status as keyof typeof config] || config.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        <Icon size={14} />
        {style.label}
      </span>
    );
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      res.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.user.identification.includes(searchTerm);
    return matchesSearch;
  });

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📋 Reservaciones</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Gestiona las reservas de libros de los usuarios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/reservations/new"
                className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>+ Nueva Reserva</span>
              </Link>
              <button
                onClick={fetchReservations}
                className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition"
                title="Recargar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Badge de pendientes */}
          <div className="mt-4 flex items-center gap-3">
            <span className="bg-yellow-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
              <Clock size={16} />
              {pendingCount} reservas pendientes
            </span>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Buscar por usuario, identificación o libro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center text-sm sm:text-base border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">⏳ Pendientes</option>
                <option value="approved">✅ Aprobadas</option>
                <option value="rejected">❌ Rechazadas</option>
                <option value="cancelled">⛔ Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de reservas */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchReservations}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Reintentar
            </button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📋</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              {searchTerm ? "No se encontraron reservas" : "No hay reservas registradas"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "Las reservas aparecerán aquí cuando los usuarios las creen"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
              >
                {/* Cabecera de la reserva - siempre visible */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Avatar del usuario */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {reservation.user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Información del usuario y libro */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <p className="font-semibold text-gray-800 truncate">
                          {reservation.user.name}
                        </p>
                        <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                        <p className="text-sm text-gray-500 truncate">
                          <User size={14} className="inline mr-1" />
                          {reservation.user.identification}
                        </p>
                        <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                        <p className="text-sm text-gray-600 truncate flex-1">
                          <BookOpen size={14} className="inline mr-1" />
                          {reservation.book.title}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(reservation.createdAt).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {reservation.assignedCopy && (
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            <Barcode size={12} />
                            Ejemplar: {reservation.assignedCopy.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estado y acciones - siempre visibles */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(reservation.status)}
                    
                    {/* Botones de acción solo para reservas pendientes */}
                    {reservation.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'approved')}
                          disabled={processingId === reservation.id}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                        >
                          {processingId === reservation.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          <span className="hidden sm:inline">Aceptar</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'rejected')}
                          disabled={processingId === reservation.id}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                        >
                          {processingId === reservation.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span className="hidden sm:inline">Rechazar</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Botón Ver */}
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setShowDetailModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium flex items-center gap-1"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pie de página */}
        {filteredReservations.length > 0 && (
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredReservations.length}</span> reservas
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-3xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📋 Detalle de Reserva</h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Información completa de la reserva
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReservation(null);
                  }}
                  className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Estado actual</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              {/* Información del Usuario */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User size={18} className="text-indigo-500" />
                  Información del Usuario
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Nombre</span>
                    <span className="text-sm font-medium text-gray-800">{selectedReservation.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-800">{selectedReservation.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Identificación</span>
                    <span className="text-sm font-medium text-gray-800">{selectedReservation.user.identification}</span>
                  </div>
                </div>
              </div>

              {/* Información del Libro */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-500" />
                  Información del Libro
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Título</span>
                    <span className="text-sm font-medium text-gray-800">{selectedReservation.book.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Autor</span>
                    <span className="text-sm font-medium text-gray-800">{selectedReservation.book.author}</span>
                  </div>
                  {selectedReservation.assignedCopy && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ejemplar asignado</span>
                      <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
                        <Barcode size={14} />
                        {selectedReservation.assignedCopy.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la Reserva */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-pink-500" />
                  Detalles de la Reserva
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Fecha de reserva</span>
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(selectedReservation.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ID de reserva</span>
                    <span className="text-sm font-mono text-gray-600">{selectedReservation.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ID de usuario</span>
                    <span className="text-sm font-mono text-gray-600">{selectedReservation.userId.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>

              {/* Acciones del modal */}
              {selectedReservation.status === 'pending' && (
                <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedReservation.id, 'approved')}
                    disabled={processingId === selectedReservation.id}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                  >
                    {processingId === selectedReservation.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    Aceptar Reserva
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReservation.id, 'rejected')}
                    disabled={processingId === selectedReservation.id}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                  >
                    {processingId === selectedReservation.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <XCircle size={20} />
                    )}
                    Rechazar Reserva
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReservation(null);
                }}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}