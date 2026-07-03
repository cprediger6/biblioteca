// app/admin/reservations/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, Search, Filter, BookOpen, User, Calendar, 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ArrowRight, Users, BookMarked, Loader2,
  Edit, Trash2
} from "lucide-react";

type ReservationWithDetails = {
  id: string;
  reserveDate: Date;
  status: string;
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

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    fulfilled: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      if (!res.ok) throw new Error("Error al cargar reservas");
      const data = await res.json();
      setReservations(data.reservations || []);
      setStats({
        total: data.reservations?.length || 0,
        pending: data.reservations?.filter((r: any) => r.status === "pending").length || 0,
        fulfilled: data.reservations?.filter((r: any) => r.status === "fulfilled").length || 0,
        cancelled: data.reservations?.filter((r: any) => r.status === "cancelled").length || 0,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.user.name.toLowerCase().includes(term) ||
        r.book.title.toLowerCase().includes(term) ||
        r.book.author.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { 
        color: "bg-yellow-100 text-yellow-700", 
        label: "Pendiente", 
        icon: Clock,
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      },
      fulfilled: { 
        color: "bg-green-100 text-green-700", 
        label: "Completada", 
        icon: CheckCircle,
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      },
      cancelled: { 
        color: "bg-gray-100 text-gray-700", 
        label: "Cancelada", 
        icon: XCircle,
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`¿Estás seguro de ${newStatus === "fulfilled" ? "completar" : "cancelar"} esta reserva?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error al actualizar");
      
      await fetchReservations();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la reserva");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta reserva?")) return;
    
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar");
      
      await fetchReservations();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la reserva");
    }
  };

  const filteredReservations = getFilteredReservations();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📋 Gestión de Reservas</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Controla las reservas de libros de los usuarios
              </p>
            </div>
            <Link
              href="/admin/reservations/new"
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nueva Reserva</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-xl">
                <BookMarked className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
              </div>
              <div className="bg-green-50 p-2 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Canceladas</p>
                <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-xl">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por usuario, libro o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white w-full sm:w-40"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="fulfilled">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {filteredReservations.length} reserva(s) encontrada(s)
          </div>
        </div>

        {/* Lista de reservas */}
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {searchTerm || filterStatus !== "all" ? "No se encontraron reservas" : "No hay reservas registradas"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== "all" ? "Intenta con otros filtros" : "Los usuarios pueden reservar libros cuando no hay ejemplares disponibles"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                href="/admin/reservations/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Reserva</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReservations.map((reservation) => {
              const { color, label, icon: Icon, bgColor, borderColor } = getStatusBadge(reservation.status);
              
              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Información */}
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                          {reservation.book.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={reservation.book.coverImage} 
                              alt={reservation.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              📖
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                            {reservation.book.title}
                          </h3>
                          <p className="text-sm text-gray-600">{reservation.book.author}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {reservation.user.name}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(reservation.reserveDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <BookOpen className="w-3 h-3 mr-1" />
                              ID: {reservation.user.identification}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado y acciones */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`${color} px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
                          <Icon className="w-3 h-3" />
                          <span>{label}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {reservation.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(reservation.id, "fulfilled")}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center space-x-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Completar</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(reservation.id, "cancelled")}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Cancelar</span>
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/reservations/${reservation.id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(reservation.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {filteredReservations.length > 0 && (
          <div className="mt-6 text-center text-xs text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredReservations.length}</span> reservas
          </div>
        )}
      </div>
    </div>
  );
}