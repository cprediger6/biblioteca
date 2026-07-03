"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, Search, Filter, BookOpen, User, Calendar, 
  Clock, CheckCircle, XCircle, AlertCircle, 
  ArrowRight, Users, BookMarked, Loader2
} from "lucide-react";

type LoanWithDetails = {
  id: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  copy: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string | null;
    };
  };
};

type LoansClientProps = {
  loans: LoanWithDetails[];
};

export default function LoansClient({ loans: initialLoans }: LoansClientProps) {
  const router = useRouter();
  const [loans, setLoans] = useState(initialLoans);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estadísticas
  const totalLoans = loans.length;
  const activeLoans = loans.filter(l => l.status === "active").length;
  const overdueLoans = loans.filter(l => l.status === "overdue").length;
  const returnedLoans = loans.filter(l => l.status === "returned").length;

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: "bg-green-100 text-green-700", label: "Activo", icon: CheckCircle },
      overdue: { color: "bg-red-100 text-red-700", label: "Vencido", icon: AlertCircle },
      returned: { color: "bg-gray-100 text-gray-700", label: "Devuelto", icon: XCircle },
    };
    const { color, label, icon: Icon } = config[status as keyof typeof config] || config.active;
    return { color, label, Icon };
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const diff = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleReturn = async (loanId: string) => {
    if (!confirm("¿Estás seguro de que quieres registrar la devolución de este libro?")) {
      return;
    }

    setLoading(loanId);
    try {
      const res = await fetch("/api/loans/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loanId }),
      });

      if (res.ok) {
        setLoans(prevLoans =>
          prevLoans.map(loan =>
            loan.id === loanId
              ? { ...loan, status: "returned", returnDate: new Date().toISOString() }
              : loan
          )
        );
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || "No se pudo procesar la devolución"}`);
      }
    } catch (error) {
      alert("Error al procesar la devolución");
    } finally {
      setLoading(null);
    }
  };

  // Filtrar préstamos por búsqueda
  const filteredLoans = loans.filter(loan =>
    loan.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.copy.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.copy.book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📋 Gestión de Préstamos</h1>
              <p className="text-indigo-100">
                Controla los préstamos y devoluciones de libros
              </p>
            </div>
            <Link
              href="/admin/loans/new"
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Préstamo</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Préstamos</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{totalLoans}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <BookMarked className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Préstamos Activos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{activeLoans}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Préstamos Vencidos</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueLoans}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Devueltos</p>
                <p className="text-3xl font-bold text-gray-600 mt-2">{returnedLoans}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar préstamos por usuario o libro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Lista de préstamos */}
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No hay préstamos registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza a gestionar los préstamos de tu biblioteca
            </p>
            <Link
              href="/admin/loans/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Crear primer préstamo</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => {
              const { color, label, Icon } = getStatusBadge(loan.status);
              const daysLeft = loan.status === "active" ? calculateDaysLeft(loan.dueDate) : null;
              const isReturning = loading === loan.id;
              
              return (
                <div
                  key={loan.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del libro */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                        {loan.copy.book.coverImage ? (
                          <img 
                            src={loan.copy.book.coverImage} 
                            alt={loan.copy.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            📖
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {loan.copy.book.title}
                        </h3>
                        <p className="text-sm text-gray-600">{loan.copy.book.author}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {loan.user.name}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(loan.loanDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                      {/* Días restantes */}
                      {daysLeft !== null && daysLeft > 0 && loan.status === "active" && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{daysLeft} días</span>
                        </div>
                      )}
                      {daysLeft !== null && daysLeft <= 0 && loan.status === "active" && (
                        <div className="flex items-center space-x-1 text-sm text-red-500 font-semibold">
                          <AlertCircle className="w-4 h-4" />
                          <span>Vencido</span>
                        </div>
                      )}

                      {/* Badge de estado */}
                      <span className={`${color} px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                      </span>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        {loan.status !== "returned" && (
                          <button
                            onClick={() => handleReturn(loan.id)}
                            disabled={isReturning}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isReturning ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Procesando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Devolver</span>
                              </>
                            )}
                          </button>
                        )}
                        <Link
                          href={`/admin/loans/${loan.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página */}
        {filteredLoans.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredLoans.length}</span> préstamos
          </div>
        )}
      </div>
    </div>
  );
}