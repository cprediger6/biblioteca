// app/admin/loans/new/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Save, X, User, BookOpen, 
  Search, Calendar, Loader2, CheckCircle, 
  AlertCircle, Users
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  identification: string;
};

type CopyType = {
  id: string;
  code: string;
  book: {
    id: string;
    title: string;
    author: string;
  };
};

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchCopy, setSearchCopy] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [copies, setCopies] = useState<CopyType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<CopyType | null>(null);
  const [showUserResults, setShowUserResults] = useState(false);
  const [showCopyResults, setShowCopyResults] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCopies, setLoadingCopies] = useState(false);
  
  const userSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copySearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });

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

  // Buscar ejemplares con debounce
  useEffect(() => {
    if (copySearchTimeout.current) {
      clearTimeout(copySearchTimeout.current);
    }

    if (searchCopy.length > 1) {
      copySearchTimeout.current = setTimeout(() => {
        searchCopies();
      }, 500);
    } else {
      setCopies([]);
      setShowCopyResults(false);
    }

    return () => {
      if (copySearchTimeout.current) {
        clearTimeout(copySearchTimeout.current);
      }
    };
  }, [searchCopy]);

  const searchUsers = async () => {
    if (searchUser.length < 2) return;
    
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/users?search=${encodeURIComponent(searchUser)}`);
      if (!res.ok) throw new Error("Error al buscar usuarios");
      const data = await res.json();
      console.log("Usuarios encontrados:", data.users); // Debug
      setUsers(data.users || []);
      setShowUserResults(true);
    } catch (error) {
      console.error("Error buscando usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const searchCopies = async () => {
    if (searchCopy.length < 2) return;
    
    setLoadingCopies(true);
    try {
      const res = await fetch(`/api/copies?search=${encodeURIComponent(searchCopy)}&available=true`);
      if (!res.ok) throw new Error("Error al buscar ejemplares");
      const data = await res.json();
      console.log("Ejemplares encontrados:", data.copies); // Debug
      setCopies(data.copies || []);
      setShowCopyResults(true);
    } catch (error) {
      console.error("Error buscando ejemplares:", error);
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedCopy) {
      setError("Debes seleccionar un usuario y un ejemplar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          copyId: selectedCopy.id,
          loanDate,
          dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear préstamo");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/loans");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Error al crear el préstamo");
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📖 Nuevo Préstamo</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Registra un nuevo préstamo de libro
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
                <span>¡Préstamo creado exitosamente! Redirigiendo...</span>
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

              {/* Buscar Ejemplar */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="inline w-4 h-4 mr-2 text-indigo-500" />
                  Buscar Ejemplar *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchCopy}
                    onChange={(e) => {
                      setSearchCopy(e.target.value);
                      setSelectedCopy(null);
                      setShowCopyResults(true);
                    }}
                    onFocus={() => {
                      if (searchCopy.length > 1) {
                        setShowCopyResults(true);
                      }
                    }}
                    placeholder="Buscar por título, autor o código..."
                    className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                  />
                  {loadingCopies && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {selectedCopy && (
                  <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="font-semibold text-gray-800">{selectedCopy.book.title}</p>
                    <p className="text-sm text-gray-600">Autor: {selectedCopy.book.author}</p>
                    <p className="text-sm font-mono text-indigo-600">Código: {selectedCopy.code}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCopy(null);
                        setSearchCopy("");
                      }}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Cambiar ejemplar
                    </button>
                  </div>
                )}

                {showCopyResults && !selectedCopy && copies.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                    {copies.map((copy) => (
                      <button
                        key={copy.id}
                        type="button"
                        onClick={() => {
                          setSelectedCopy(copy);
                          setSearchCopy(copy.book.title);
                          setShowCopyResults(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{copy.book.title}</p>
                          <p className="text-xs text-gray-500">{copy.book.author}</p>
                          <p className="text-xs font-mono text-indigo-600 mt-1">Código: {copy.code}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showCopyResults && !selectedCopy && copies.length === 0 && searchCopy.length > 1 && !loadingCopies && (
                  <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500">No se encontraron ejemplares disponibles</p>
                  </div>
                )}
              </div>

              {/* Fecha de préstamo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2 text-indigo-500" />
                  Fecha de Préstamo *
                </label>
                <input
                  type="date"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                />
              </div>

              {/* Fecha de devolución */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2 text-indigo-500" />
                  Fecha de Devolución *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={loanDate}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
              <h4 className="font-semibold text-gray-700 mb-2">📋 Resumen del Préstamo</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Usuario:</span> {selectedUser?.name || "No seleccionado"}</p>
                <p><span className="font-medium">Libro:</span> {selectedCopy?.book.title || "No seleccionado"}</p>
                <p><span className="font-medium">Código:</span> {selectedCopy?.code || "No seleccionado"}</p>
                <p><span className="font-medium">Fecha préstamo:</span> {new Date(loanDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Fecha devolución:</span> {new Date(dueDate).toLocaleDateString()}</p>
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
                disabled={loading || success}
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
                    <span className="font-semibold">Crear Préstamo</span>
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