// app/cliente/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CreditCard,
  History,
  Search,
  Bell,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Loader2,
  Bookmark,
} from "lucide-react";

type DashboardData = {
  activeReservations: number;
  activeLoans: number;
  loanHistory: number;
  membershipDays: number;
  recentActivity: {
    id: string;
    type: 'reservation' | 'loan' | 'return';
    title: string;
    status: string;
    date: string;
  }[];
  recommendedBooks: {
    id: string;
    title: string;
    author: string;
    tag: string;
  }[];
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export default function ClienteDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/cliente/dashboard");
      if (!response.ok) {
        throw new Error("Error al cargar los datos del dashboard");
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError("No se pudieron cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !dashboardData) {
    return null;
  }

  const stats = [
    { 
      label: "Reservas activas", 
      value: dashboardData.activeReservations, 
      icon: Bookmark,
      color: "text-indigo-500",
      bg: "bg-indigo-50"
    },
    { 
      label: "En lectura", 
      value: dashboardData.activeLoans, 
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    { 
      label: "Historial", 
      value: dashboardData.loanHistory, 
      icon: History,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    { 
      label: "Membresía (días)", 
      value: dashboardData.membershipDays, 
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return <Bookmark className="w-4 h-4 text-indigo-500" />;
      case 'loan':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'return':
        return <History className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'reservation':
        return 'border-indigo-200 bg-indigo-50';
      case 'loan':
        return 'border-green-200 bg-green-50';
      case 'return':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobada' },
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Activo' },
      returned: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Devuelto' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado' },
    };
    const style = config[status] || config.pending;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 blur-2xl rounded-full" />

          <div className="flex flex-col sm:flex-row justify-between gap-6 relative">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Bienvenido, {dashboardData.user.name || "lector"}
              </h1>
              <p className="text-white/80 mt-2 text-sm sm:text-base">
                Tu biblioteca digital personalizada está lista para ti
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/cliente/catalogo"
                  className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Explorar catálogo
                </Link>

                <Link
                  href="/cliente/catalogo"
                  className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/20 transition flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar libros
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <Bell className="w-5 h-5" />
              </button>

              <div className="bg-black/30 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {dashboardData.user.role === "admin" ? "Admin" : "Premium activo"}
              </div>
            </div>
          </div>
        </div>

        {/* STATS PREMIUM */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 group"
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mt-1 sm:mt-2">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS - CORREGIDO: claves únicas */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Acciones rápidas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                id: "search",
                href: "/cliente/catalogo",
                label: "Buscar",
                icon: Search,
              },
              {
                id: "catalog",
                href: "/cliente/catalogo",
                label: "Catálogo",
                icon: BookOpen,
              },
              {
                id: "reservations",
                href: "/cliente/reservas",
                label: "Reservas",
                icon: Bookmark,
              },
              {
                id: "history",
                href: "/cliente/history",
                label: "Historial",
                icon: History,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}  // ← Clave única
                  href={item.href}
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 hover:scale-105"
                >
                  <Icon className="w-6 h-6 text-indigo-300 mb-3 group-hover:scale-110 transition" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

          {/* RECOMENDADOS */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recomendados para ti
            </h2>

            {dashboardData.recommendedBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay recomendaciones disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recommendedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="text-gray-800 text-sm sm:text-base font-semibold">{book.title}</p>
                      <p className="text-gray-500 text-xs">{book.author}</p>
                    </div>

                    <span className="text-gray-500 text-xs bg-indigo-500/20 px-3 py-1 rounded-full">
                      {book.tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVITY / RESERVAS */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Actividad reciente
            </h2>

            {dashboardData.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-xl border ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/cliente/history"
              className="inline-flex mt-5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Ver historial completo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}