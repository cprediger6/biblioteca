// app/api/books/[id]/labels/LabelsClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Barcode from "@/components/Barcode";

type Copy = {
  id: string;
  code: string;
  status: string;
  location: string | null;
  bookId: string;
  createdAt: string;
  updatedAt: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  createdAt: string;
  updatedAt: string;
  copies: Copy[];
};

interface LabelsClientProps {
  book: Book;
}

export default function LabelsClient({ book }: LabelsClientProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Preparando etiquetas...</p>
        </div>
      </div>
    );
  }

  const availableCopies = book.copies.filter((c) => c.status === "available").length;
  const loanedCopies = book.copies.filter((c) => c.status === "loaned").length;
  const overdueCopies = book.copies.filter((c) => c.status === "overdue").length;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - ocultar en impresión */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              🏷️ Etiquetas para: {book.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {book.author} {book.isbn && `• ISBN: ${book.isbn}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/books/${book.id}`}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Imprimiendo...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resumen - ocultar en impresión */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 print:hidden">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{availableCopies}</div>
            <div className="text-xs sm:text-sm text-green-600">Disponibles</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{loanedCopies}</div>
            <div className="text-xs sm:text-sm text-yellow-600">Prestados</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{overdueCopies}</div>
            <div className="text-xs sm:text-sm text-red-600">Vencidos</div>
          </div>
        </div>

        {/* Grid de etiquetas - Mejorado */}
        {book.copies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">Este libro no tiene ejemplares registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {book.copies.map((copy) => (
              <div
                key={copy.id}
                className="border rounded-xl p-3 sm:p-4 flex flex-col items-center bg-white hover:shadow-lg transition-shadow max-w-[200px] mx-auto w-full"
              >
                {/* Título del libro - más pequeño */}
                <div className="text-[8px] sm:text-[10px] text-gray-500 text-center line-clamp-2 mb-1 max-w-full leading-tight">
                  {book.title}
                </div>
                
                {/* Código de barras - tamaño ajustado */}
                <div className="my-1 sm:my-2 w-full flex justify-center">
                  <Barcode 
                    value={copy.code || copy.id.slice(0, 8)} 
                    width={1.2} 
                    height={40} 
                    fontSize={8}
                    displayValue={true}
                  />
                </div>
                
                {/* Código del ejemplar */}
                <div className="text-[8px] sm:text-[10px] font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded truncate max-w-full">
                  {copy.code || copy.id.slice(0, 8)}
                </div>
                
                {/* Estado - más compacto */}
                <div className="mt-1">
                  <span className={`text-[7px] sm:text-[9px] px-2 py-0.5 rounded-full font-medium ${
                    copy.status === "available" 
                      ? "bg-green-100 text-green-700" 
                      : copy.status === "loaned"
                      ? "bg-yellow-100 text-yellow-700"
                      : copy.status === "overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {copy.status === "available" ? "Disponible" : 
                     copy.status === "loaned" ? "Prestado" :
                     copy.status === "overdue" ? "Vencido" : 
                     "Desconocido"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer - ocultar en impresión */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-4 print:hidden">
          Códigos generados automáticamente • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}