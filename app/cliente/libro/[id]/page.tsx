// app/cliente/libro/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookMarked,
  Share2,
  Printer,
  Info,
  Building2,
  Layers,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface BookDetails {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  createdAt: string;
  updatedAt: string;
}

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationMessage, setReservationMessage] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cliente/books/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("El libro no existe");
        }
        throw new Error("Error al cargar los detalles del libro");
      }
      
      const data = await response.json();
      setBook(data.book);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al cargar el libro");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (!book || book.availableCopies < 1) {
      setReservationMessage({
        type: 'error',
        message: 'No hay ejemplares disponibles para reservar'
      });
      return;
    }

    setIsReserving(true);
    setReservationMessage({ type: null, message: '' });

    try {
      const response = await fetch("/api/cliente/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar la reserva");
      }

      setReservationMessage({
        type: 'success',
        message: '¡Reserva realizada exitosamente! Tienes 7 días para recoger el libro.'
      });

      // Actualizar disponibilidad
      await fetchBookDetails();

    } catch (error) {
      console.error("Error:", error);
      setReservationMessage({
        type: 'error',
        message: error instanceof Error ? error.message : "Error al realizar la reserva"
      });
    } finally {
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del libro...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Libro no encontrado</h2>
          <p className="text-gray-600 mb-6">
            {error || "El libro que buscas no existe o ha sido eliminado"}
          </p>
          <Link
            href="/cliente/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/cliente/dashboard" className="hover:text-indigo-600 transition">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/cliente/catalogo" className="hover:text-indigo-600 transition">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{book.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Portada y disponibilidad */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <BookOpen className="w-20 h-20 text-indigo-300 mb-4" />
                    <p className="text-gray-400 text-sm">Sin imagen de portada</p>
                  </div>
                )}
              </div>

              {/* Estado de disponibilidad */}
              <div className="p-6 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Disponibilidad</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      book.availableCopies > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {book.availableCopies > 0 
                        ? `${book.availableCopies} ejemplares disponibles` 
                        : 'No disponible'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total ejemplares</span>
                    <span className="font-medium">{book.totalCopies}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Prestados actualmente</span>
                    <span className="font-medium">{book.activeLoans}</span>
                  </div>
                </div>

                <button
                  onClick={handleReserve}
                  disabled={isReserving || book.availableCopies < 1 || !session}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                >
                  {isReserving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <BookMarked className="w-5 h-5" />
                      {!session ? 'Inicia sesión para reservar' : 'Reservar libro'}
                    </>
                  )}
                </button>

                {reservationMessage.type && (
                  <div className={`mt-3 p-3 rounded-xl text-sm flex items-start gap-2 ${
                    reservationMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {reservationMessage.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{reservationMessage.message}</span>
                  </div>
                )}

                <button
                  onClick={() => window.print()}
                  className="w-full mt-3 py-2 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir información
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha - Detalles del libro */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título, autor y editorial */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {book.title}
              </h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                {book.author}
              </p>
              {(book.publisher || book.year) && (
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" />
                  {book.publisher}
                  {book.publisher && book.year && ' • '}
                  {book.year}
                </p>
              )}
            </div>

            {/* Descripción */}
            {book.description && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  Descripción
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            {/* Información adicional (ISBN) */}
            {book.isbn && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  Información adicional
                </h3>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Hash className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-medium text-gray-800">{book.isbn}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón volver */}
            <div className="flex justify-between items-center">
              <Link
                href="/cliente/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al catálogo
              </Link>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: book.title,
                      text: `Mira este libro: ${book.title} - ${book.author}`,
                      url: window.location.href,
                    });
                  }
                }}
                className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}