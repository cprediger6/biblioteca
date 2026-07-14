// app/admin/loans/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, Search, BookOpen, User, Calendar, 
  ArrowLeft, Loader2, CheckCircle, XCircle,
  AlertCircle, Clock, RefreshCw, Users,
  AlertTriangle, Edit, Info
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Loan = {
  id: string;
  userId: string;
  copyId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
  };
  copy: {
    id: string;
    code: string;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string | null;
    };
  };
};

export default function LoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [returnObservations, setReturnObservations] = useState("");
  const [isDamaged, setIsDamaged] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/loans/active");
      
      if (!response.ok) {
        throw new Error("Error al cargar los préstamos");
      }
      
      const data = await response.json();
      setLoans(data.loans);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar los préstamos activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowReturnModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedLoanId) return;

    setReturning(selectedLoanId);
    setSuccessMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${selectedLoanId}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnDate: new Date().toISOString(),
          isDamaged: isDamaged,
          observations: returnObservations || "Devuelto en buen estado",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al devolver el libro");
      }

      setSuccessMessage("✅ Libro devuelto exitosamente");
      setShowReturnModal(false);
      setReturnObservations("");
      setIsDamaged(false);
      setSelectedLoanId(null);
      
      // Actualizar la lista
      await fetchLoans();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al devolver el libro");
      setTimeout(() => setError(null), 5000);
    } finally {
      setReturning(null);
    }
  };

  const getDaysLeft = (dueDate: Date) => {
    const today = new Date();
    const diff = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (loan: Loan) => {
    const daysLeft = getDaysLeft(loan.dueDate);
    
    if (loan.status === "returned") {
      return {
        label: "Devuelto",
        color: "bg-gray-100 text-gray-700",
        icon: CheckCircle,
      };
    }
    
    if (daysLeft < 0) {
      return {
        label: "Vencido",
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      };
    }
    
    if (daysLeft <= 3) {
      return {
        label: `Próximo a vencer (${daysLeft} días)`,
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      };
    }
    
    return {
      label: "Activo",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    };
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando préstamos...</p>
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📚 Gestión de Préstamos</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Administra los préstamos activos de la biblioteca
              </p>
            </div>
            <Link
              href="/admin/loans/new"
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nuevo Préstamo</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Total Préstamos Activos</p>
            <p className="text-2xl font-bold text-indigo-600">{loans.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">
              {loans.filter(l => getDaysLeft(l.dueDate) < 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-sm text-gray-500">Próximos a vencer (3 días)</p>
            <p className="text-2xl font-bold text-yellow-600">
              {loans.filter(l => getDaysLeft(l.dueDate) >= 0 && getDaysLeft(l.dueDate) <= 3).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="text-sm text-gray-500">En tiempo</p>
            <p className="text-2xl font-bold text-green-600">
              {loans.filter(l => getDaysLeft(l.dueDate) > 3).length}
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botón refrescar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={fetchLoans}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Lista de préstamos */}
        {loans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No hay préstamos activos
            </h3>
            <p className="text-gray-500 mb-6">
              Todos los libros han sido devueltos
            </p>
            <Link
              href="/admin/loans/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition"
            >
              <Plus className="w-5 h-5" />
              <span>Crear nuevo préstamo</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => {
              const statusBadge = getStatusBadge(loan);
              const StatusIcon = statusBadge.icon;
              const daysLeft = getDaysLeft(loan.dueDate);
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-all hover:shadow-xl border-l-4 ${
                    isOverdue ? "border-red-500" : "border-indigo-500"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del libro */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                        {loan.copy.book.coverImage ? (
                          <img
                            src={loan.copy.book.coverImage}
                            alt={loan.copy.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📖
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg truncate">
                          {loan.copy.book.title}
                        </h3>
                        <p className="text-sm text-gray-600">{loan.copy.book.author}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          Código: {loan.copy.code}
                        </p>
                      </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{loan.user.name}</p>
                        <p className="text-xs text-gray-500">ID: {loan.user.identification}</p>
                      </div>
                    </div>

                    {/* Fechas y estado */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        <span className={`${statusBadge.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Préstamo: {formatDate(loan.loanDate)}
                        </p>
                        <p className={`text-xs font-medium ${
                          isOverdue ? "text-red-600" : "text-gray-600"
                        }`}>
                          Devolución: {formatDate(loan.dueDate)}
                          {!isOverdue && (
                            <span className="ml-1">({daysLeft} días)</span>
                          )}
                          {isOverdue && (
                            <span className="ml-1 text-red-600">
                              (Vencido hace {Math.abs(daysLeft)} días)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Botón devolver */}
                    <button
                      onClick={() => handleReturn(loan.id)}
                      disabled={returning === loan.id}
                      className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                        isOverdue
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {returning === loan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Devolver
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de confirmación de devolución */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Devolución</h2>
                <p className="text-gray-500 text-sm mt-1">
                  ¿Estás seguro de que quieres devolver este libro?
                </p>
              </div>

              <div className="space-y-4">
                {/* Estado del ejemplar */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={isDamaged}
                      onChange={(e) => setIsDamaged(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      El ejemplar está dañado
                    </span>
                  </label>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={returnObservations}
                    onChange={(e) => setReturnObservations(e.target.value)}
                    placeholder="Estado del libro, observaciones, etc."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnObservations("");
                    setIsDamaged(false);
                    setSelectedLoanId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReturn}
                  disabled={returning === selectedLoanId}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {returning === selectedLoanId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {loans.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold">{loans.length}</span> préstamos activos
          </div>
        )}
      </div>
    </div>
  );
}