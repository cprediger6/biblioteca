// app/cliente/history/page.tsx
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
  History as HistoryIcon,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Bookmark,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  User,
  Library,
} from "lucide-react";

type HistoryItem = {
  id: string;
  type: 'reservation' | 'loan' | 'return';
  status: string;
  title: string;
  author: string;
  date: string;
  details: {
    reservationId?: string;
    loanId?: string;
    copyCode?: string;
    dueDate?: string;
    returnDate?: string;
  };
};

type FilterType = 'all' | 'reservation' | 'loan' | 'return';
type StatusFilterType = 'all' | 'pending' | 'approved' | 'active' | 'returned' | 'rejected' | 'cancelled';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/cliente/history");
      if (!response.ok) {
        throw new Error("Error al cargar el historial");
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("No se pudo cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (type: string, status: string) => {
    const config: Record<string, Record<string, { bg: string; text: string; label: string; icon: any }>> = {
      reservation: {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: Clock },
        approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobada', icon: CheckCircle },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazada', icon: XCircle },
        cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelada', icon: XCircle },
      },
      loan: {
        active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Activo', icon: BookOpen },
        returned: { bg: 'bg-green-100', text: 'text-green-700', label: 'Devuelto', icon: CheckCircle },
        overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencido', icon: AlertCircle },
      },
      return: {
        returned: { bg: 'bg-green-100', text: 'text-green-700', label: 'Devuelto', icon: CheckCircle },
      },
    };

    const typeConfig = config[type] || {};
    const style = typeConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: Clock };
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon size={12} />
        {style.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return <Bookmark className="w-5 h-5 text-indigo-500" />;
      case 'loan':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'return':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <HistoryIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reservation':
        return 'Reserva';
      case 'loan':
        return 'Préstamo';
      case 'return':
        return 'Devolución';
      default:
        return 'Actividad';
    }
  };

  const filteredHistory = history.filter(item => {
    // Filtro por tipo
    if (filter !== 'all' && item.type !== filter) return false;
    
    // Filtro por estado
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    
    // Búsqueda por título o autor
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(search) || 
             item.author.toLowerCase().includes(search);
    }
    
    return true;
  });

  // Estadísticas
  const totalItems = history.length;
  const reservationsCount = history.filter(i => i.type === 'reservation').length;
  const loansCount = history.filter(i => i.type === 'loan').length;
  const returnsCount = history.filter(i => i.type === 'return').length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{error}</p>
          <button
            onClick={() => fetchHistory()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <HistoryIcon className="w-8 h-8" />
                Mi Historial
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Registro completo de tus actividades en la biblioteca
              </p>
            </div>
            <Link
              href="/cliente/dashboard"
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={18} />
              Volver al dashboard
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <span className="font-semibold">{totalItems}</span>
              <span className="text-indigo-100">Total</span>
            </div>
            {reservationsCount > 0 && (
              <div className="bg-indigo-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <Bookmark size={14} />
                <span className="font-semibold">{reservationsCount}</span>
                <span className="text-indigo-100">Reservas</span>
              </div>
            )}
            {loansCount > 0 && (
              <div className="bg-blue-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <BookOpen size={14} />
                <span className="font-semibold">{loansCount}</span>
                <span className="text-indigo-100">Préstamos</span>
              </div>
            )}
            {returnsCount > 0 && (
              <div className="bg-green-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span className="font-semibold">{returnsCount}</span>
                <span className="text-indigo-100">Devoluciones</span>
              </div>
            )}
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="reservation">📌 Reservas</option>
                <option value="loan">📖 Préstamos</option>
                <option value="return">✅ Devoluciones</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">⏳ Pendiente</option>
                <option value="approved">✅ Aprobado</option>
                <option value="active">📖 Activo</option>
                <option value="returned">🔄 Devuelto</option>
                <option value="rejected">❌ Rechazado</option>
                <option value="cancelled">⛔ Cancelado</option>
              </select>

              {(searchTerm || filter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Mostrando {filteredHistory.length} de {totalItems} registros
          </div>
        </div>

        {/* Lista de historial */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <HistoryIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm || filter !== 'all' || statusFilter !== 'all' 
                ? "No se encontraron registros con estos filtros"
                : "Aún no tienes actividad"}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchTerm || filter !== 'all' || statusFilter !== 'all'
                ? "Prueba con otros filtros o términos de búsqueda"
                : "Explora el catálogo y comienza a disfrutar de tus libros"}
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
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const isExpanded = expandedItem === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
                >
                  {/* Cabecera del item - siempre visible */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                        {getStatusBadge(item.type, item.status)}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {getTypeLabel(item.type)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen size={14} className="text-gray-400" />
                            <span className="text-gray-500">Libro:</span>
                            <span className="font-medium text-gray-800">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-gray-400" />
                            <span className="text-gray-500">Autor:</span>
                            <span className="font-medium text-gray-800">{item.author}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays size={14} className="text-gray-400" />
                            <span className="text-gray-500">Fecha:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(item.date).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Library size={14} className="text-gray-400" />
                            <span className="text-gray-500">Tipo:</span>
                            <span className="font-medium text-gray-800">{getTypeLabel(item.type)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-500">Estado:</span>
                            {getStatusBadge(item.type, item.status)}
                          </div>
                          {item.details.copyCode && (
                            <div className="flex items-center gap-2 text-sm">
                              <Bookmark size={14} className="text-gray-400" />
                              <span className="text-gray-500">Código:</span>
                              <span className="font-mono text-sm text-gray-800">{item.details.copyCode}</span>
                            </div>
                          )}
                          {item.details.dueDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-500">Fecha devolución:</span>
                              <span className="font-medium text-gray-800">
                                {new Date(item.details.dueDate).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página */}
        {filteredHistory.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredHistory.length}</span> registros
            {filter !== 'all' && ` de tipo "${filter}"`}
            {statusFilter !== 'all' && ` con estado "${statusFilter}"`}
          </div>
        )}
      </div>
    </div>
  );
}