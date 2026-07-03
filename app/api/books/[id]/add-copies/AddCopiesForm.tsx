"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Loader2, CheckCircle, Printer } from "lucide-react";

interface AddCopiesFormProps {
  bookId: string;
  bookTitle: string;
  isbn: string | null;
  lastNumber: number;
}

export default function AddCopiesForm({ 
  bookId, 
  bookTitle, 
  isbn, 
  lastNumber 
}: AddCopiesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copiesCount, setCopiesCount] = useState(1);
  const [copiesCreated, setCopiesCreated] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/books/add-copies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId,
          copiesCount,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error || "No se pudieron agregar los ejemplares"}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setCopiesCreated(data.copies);
      setShowSuccess(true);
      
    } catch (error) {
      alert("Error al agregar ejemplares");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintLabels = () => {
    if (copiesCreated.length > 0) {
      window.open(`/admin/books/${bookId}/labels`, '_blank');
    }
  };

  const handleFinish = () => {
    router.push(`/admin/books/${bookId}`);
    router.refresh();
  };

  const getNextCodes = () => {
    const isbnClean = isbn ? isbn.replace(/-/g, '') : 'SINISBN';
    const start = lastNumber + 1;
    const codes = [];
    for (let i = 0; i < copiesCount; i++) {
      const num = start + i;
      codes.push(`${isbnClean}-EJ-${String(num).padStart(3, '0')}`);
    }
    return codes;
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/books/${bookId}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agregar Ejemplares</h1>
          <p className="text-gray-500 text-sm">{bookTitle}</p>
        </div>
      </div>

      {!showSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Copy className="inline w-4 h-4 mr-2 text-indigo-500" />
              Cantidad de ejemplares a agregar
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={copiesCount}
                onChange={(e) => setCopiesCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center"
              />
              <span className="text-sm text-gray-500">ejemplares</span>
            </div>
          </div>

          {/* Vista previa de códigos */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Códigos que se generarán:</h4>
            <div className="flex flex-wrap gap-2">
              {getNextCodes().map((code, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-mono">
                  {code}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Continuando la secuencia desde el último código registrado
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-100">
            <Link
              href={`/admin/books/${bookId}`}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Agregar Ejemplares</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¡Ejemplares Agregados!</h2>
          <p className="text-gray-500 mt-2">
            Se agregaron {copiesCreated.length} ejemplares correctamente
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 max-w-md mx-auto">
            {copiesCreated.map((copy) => (
              <div key={copy.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500">Código</div>
                <div className="text-sm font-mono font-bold text-indigo-600">{copy.code}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <button
              onClick={handlePrintLabels}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiquetas</span>
            </button>
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalizar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}