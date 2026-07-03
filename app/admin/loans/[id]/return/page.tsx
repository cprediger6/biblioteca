// app/admin/loans/[id]/return/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, X, User, BookOpen, 
  Calendar, CheckCircle, AlertCircle, 
  Loader2, Clock, AlertTriangle
} from "lucide-react";

type LoanDetail = {
  id: string;
  loanDate: Date;
  dueDate: Date;
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
    };
  };
};

export default function ReturnLoanPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDamaged, setIsDamaged] = useState(false);
  const [observations, setObservations] = useState("");

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  const fetchLoan = async () => {
    try {
      const res = await fetch(`/api/loans/${loanId}`);
      if (!res.ok) throw new Error("Error al cargar préstamo");
      const data = await res.json();
      setLoan(data);
    } catch (error) {
      setError("Error al cargar el préstamo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/loans/${loanId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnDate,
          isDamaged,
          observations,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al devolver");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/loans");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Error al devolver el libro");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando préstamo...</p>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || "Préstamo no encontrado"}</p>
          <Link href="/admin/loans" className="text-indigo-600 hover:underline mt-4 inline-block">
            Volver a préstamos
          </Link>
        </div>
      </div>
    );
  }

  if (loan.status === "returned") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Este préstamo ya fue devuelto</p>
          <Link href="/admin/loans" className="text-indigo-600 hover:underline mt-4 inline-block">
            Volver a préstamos
          </Link>
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">🔄 Devolver Libro</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Registra la devolución del libro
              </p>
            </div>
            <Link
              href="/admin/loans"
              className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Volver</span>
            </Link>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>¡Libro devuelto exitosamente! Redirigiendo...</span>
              </div>
            )}

            {/* Información del préstamo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    Usuario
                  </h3>
                  <p className="font-semibold text-gray-800">{loan.user.name}</p>
                  <p className="text-sm text-gray-600">ID: {loan.user.identification}</p>
                  <p className="text-sm text-gray-600">{loan.user.email}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Libro
                  </h3>
                  <p className="font-semibold text-gray-800">{loan.copy.book.title}</p>
                  <p className="text-sm text-gray-600">{loan.copy.book.author}</p>
                  <p className="text-sm font-mono text-indigo-600">{loan.copy.code}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Fechas
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Préstamo:</span> {new Date(loan.loanDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vencimiento:</span> {new Date(loan.dueDate).toLocaleDateString()}
                  </p>
                  {loan.status === "overdue" && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-4 h-4" />
                      Préstamo vencido
                    </p>
                  )}
                </div>

                {/* Fecha de devolución */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2 text-indigo-500" />
                    Fecha de Devolución *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                  />
                </div>

                {/* Estado del libro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del libro
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!isDamaged}
                        onChange={() => setIsDamaged(false)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm text-gray-700">Buen estado</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isDamaged}
                        onChange={() => setIsDamaged(true)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-sm text-gray-700">Dañado</span>
                    </label>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    placeholder="Observaciones sobre la devolución..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t-2 border-gray-100">
              <Link
                href="/admin/loans"
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </Link>
              <button
                type="submit"
                disabled={saving || success}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Devolver Libro</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}