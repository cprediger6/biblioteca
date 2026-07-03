// app/admin/reservations/new/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, X, User, BookOpen, Calendar,
  Loader2, Users, CheckCircle, AlertCircle,
  Search
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  identification: string;
};

type BookType = {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  copies: {
    id: string;
    status: string;
  }[];
};

export default function NewReservationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchBook, setSearchBook] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [books, setBooks] = useState<BookType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [showUserResults, setShowUserResults] = useState(false);
  const [showBookResults, setShowBookResults] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  
  const userSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Buscar usuarios con debounce
  useEffect(() => {
    if (userSearchTimeout.current) {
      clearTimeout(userSearchTimeout.current);
    }

    if (searchUser.length > 1) {
      userSearchTimeout.current = setTimeout(() => {
        searchUsers();
      }, 500);
    } else {
      setUsers([]);
      setShowUserResults(false);
    }

    return () => {
      if (userSearchTimeout.current) {
        clearTimeout(userSearchTimeout.current);
      }
    };
  }, [searchUser]);

  // Buscar libros con debounce
  useEffect(() => {
    if (bookSearchTimeout.current) {
      clearTimeout(bookSearchTimeout.current);
    }

    if (searchBook.length > 1) {
      bookSearchTimeout.current = setTimeout(() => {
        searchBooks();
      }, 500);
    } else {
      setBooks([]);
      setShowBookResults(false);
    }

    return () => {
      if (bookSearchTimeout.current) {
        clearTimeout(bookSearchTimeout.current);
      }
    };
  }, [searchBook]);

  const searchUsers = async () => {
    if (searchUser.length < 2) return;
    
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(searchUser)}`);
      if (!res.ok) throw new Error("Error al buscar usuarios");
      const data = await res.json();
      setUsers(data.users || []);
      setShowUserResults(true);
    } catch (error) {
      console.error("Error buscando usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const searchBooks = async () => {
    if (searchBook.length < 2) return;
    
    setLoadingBooks(true);
    try {
      const res = await fetch(`/api/books?search=${encodeURIComponent(searchBook)}`);
      if (!res.ok) throw new Error("Error al buscar libros");
      const data = await res.json();
      setBooks(data.books || []);
      setShowBookResults(true);
    } catch (error) {
      console.error("Error buscando libros:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const getAvailableCopies = (book: BookType) => {
    return book.copies.filter(c => c.status === "available").length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedBook) {
      setError("Debes seleccionar un usuario y un libro");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          bookId: selectedBook.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.hasAvailableCopies) {
          const confirmLoan = confirm(
            `Hay ${data.availableCopies} ejemplares disponibles de "${selectedBook.title}".\n\n` +
            `¿Deseas crear un préstamo directamente en lugar de una reserva?`
          );
          if (confirmLoan) {
            // Redirigir a crear préstamo con los datos prellenados
            router.push(`/admin/loans/new?userId=${selectedUser.id}&bookId=${selectedBook.id}`);
          }
          return;
        }
        throw new Error(data.error || "Error al crear la reserva");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/reservations");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📋 Nueva Reserva</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Registra una nueva reserva de libro
              </p>
            </div>
            <Link
              href="/admin/reservations"
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
                <span>¡Reserva creada exitosamente! Redirigiendo...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buscar Usuario */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2 text-indigo-500" />
                  Buscar Usuario *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => {
                      setSearchUser(e.target.value);
                      setSelectedUser(null);
                      setShowUserResults(true);
                    }}
                    onFocus={() => {
                      if (searchUser.length > 1) {
                        setShowUserResults(true);
                      }
                    }}
                    placeholder="Buscar por nombre o identificación..."
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                  />
                  {loadingUsers && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                
                {selectedUser && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">ID: {selectedUser.identification}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchUser("");
                      }}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Cambiar usuario
                    </button>
                  </div>
                )}

                {showUserResults && !selectedUser && users.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchUser(user.name);
                          setShowUserResults(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">ID: {user.identification}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showUserResults && !selectedUser && users.length === 0 && searchUser.length > 1 && !loadingUsers && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500">No se encontraron usuarios</p>
                  </div>
                )}
              </div>

              {/* Buscar Libro */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="inline w-4 h-4 mr-2 text-indigo-500" />
                  Buscar Libro *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchBook}
                    onChange={(e) => {
                      setSearchBook(e.target.value);
                      setSelectedBook(null);
                      setShowBookResults(true);
                    }}
                    onFocus={() => {
                      if (searchBook.length > 1) {
                        setShowBookResults(true);
                      }
                    }}
                    placeholder="Buscar por título o autor..."
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                  />
                  {loadingBooks && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {selectedBook && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="font-semibold text-gray-800">{selectedBook.title}</p>
                    <p className="text-sm text-gray-600">Autor: {selectedBook.author}</p>
                    <p className="text-sm text-gray-600">
                      Ejemplares disponibles: {getAvailableCopies(selectedBook)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBook(null);
                        setSearchBook("");
                      }}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Cambiar libro
                    </button>
                  </div>
                )}

                {showBookResults && !selectedBook && books.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {books.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => {
                          setSelectedBook(book);
                          setSearchBook(book.title);
                          setShowBookResults(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{book.title}</p>
                          <p className="text-xs text-gray-500">{book.author}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {getAvailableCopies(book)} ejemplares disponibles
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showBookResults && !selectedBook && books.length === 0 && searchBook.length > 1 && !loadingBooks && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500">No se encontraron libros</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            {selectedBook && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <h4 className="font-semibold text-gray-700 mb-2">📖 Información del Libro</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Título:</span> {selectedBook.title}</p>
                  <p><span className="font-medium">Autor:</span> {selectedBook.author}</p>
                  <p><span className="font-medium">Ejemplares disponibles:</span> {
                    getAvailableCopies(selectedBook)
                  }</p>
                  {getAvailableCopies(selectedBook) > 0 && (
                    <div className="flex items-center text-green-600 mt-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">Hay ejemplares disponibles. Considera hacer un préstamo directo.</span>
                    </div>
                  )}
                  {getAvailableCopies(selectedBook) === 0 && (
                    <div className="flex items-center text-yellow-600 mt-2">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">No hay ejemplares disponibles. La reserva se creará correctamente.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resumen */}
            {selectedUser && selectedBook && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 Resumen de la Reserva</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Usuario:</span> {selectedUser.name}</p>
                  <p><span className="font-medium">Libro:</span> {selectedBook.title}</p>
                  <p><span className="font-medium">Fecha de reserva:</span> {new Date().toLocaleDateString()}</p>
                  <p><span className="font-medium">Estado:</span> Pendiente</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t-2 border-gray-100">
              <Link
                href="/admin/reservations"
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </Link>
              <button
                type="submit"
                disabled={loading || success || !selectedUser || !selectedBook}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span className="font-semibold">Crear Reserva</span>
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