// app/cliente/favoritos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Bookmark,
  X,
  Calendar,
  User,
  Library,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type FavoriteBook = {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  description: string | null;
  publisher: string | null;
  year: number | null;
  isbn: string | null;
  createdAt: string;
  favoriteId: string;
  favoriteCreatedAt: string;
};

export default function FavoritosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/cliente/favoritos");
      if (!response.ok) {
        throw new Error("Error al cargar tus favoritos");
      }
      
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("No se pudieron cargar tus favoritos");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (bookId: string, favoriteId: string) => {
    try {
      setRemovingId(favoriteId);
      
      const response = await fetch(`/api/cliente/favoritos?bookId=${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar de favoritos");
      }

      // Actualizar la lista
      setFavorites(prev => prev.filter(fav => fav.id !== bookId));
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Error al eliminar de favoritos");
    } finally {
      setRemovingId(null);
    }
  };

  const toggleFavorite = async (bookId: string) => {
    // Esta función se usa cuando el usuario hace clic en el corazón desde la lista
    // para eliminar de favoritos
    const favorite = favorites.find(f => f.id === bookId);
    if (favorite) {
      await removeFavorite(bookId, favorite.favoriteId);
    }
  };

  const filteredFavorites = favorites.filter(book => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return book.title.toLowerCase().includes(search) ||
           book.author.toLowerCase().includes(search) ||
           (book.description && book.description.toLowerCase().includes(search));
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus favoritos...</p>
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
            onClick={() => fetchFavorites()}
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
                <Heart className="w-8 h-8 fill-white/20" />
                Mis Favoritos
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Tus libros favoritos guardados
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cliente/catalogo"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
              >
                <Library size={18} />
                Explorar catálogo
              </Link>
              <Link
                href="/cliente/dashboard"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={18} />
                Volver
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <Heart className="w-4 h-4 fill-white/30" />
              <span className="font-semibold">{favorites.length}</span>
              <span className="text-indigo-100">libros favoritos</span>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar en tus favoritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition text-sm"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            {filteredFavorites.length} de {favorites.length} libros favoritos
          </div>
        </div>

        {/* Lista de favoritos */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {searchTerm ? "No se encontraron resultados" : "Aún no tienes favoritos"}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? "Prueba con otros términos de búsqueda"
                : "Explora el catálogo y guarda tus libros favoritos"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredFavorites.map((book) => {
              const isExpanded = expandedBook === book.id;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group relative"
                >
                  {/* Botón eliminar favorito - siempre visible */}
                  <button
                    onClick={() => removeFavorite(book.id, book.favoriteId)}
                    disabled={removingId === book.favoriteId}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition shadow-md disabled:opacity-50"
                    title="Eliminar de favoritos"
                  >
                    {removingId === book.favoriteId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    )}
                  </button>

                  {/* Portada */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Badge de favorito */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-indigo-500/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-white" />
                        Favorito
                      </span>
                    </div>

                    {/* Fecha de agregado */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <span className="text-xs text-white/90 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(book.favoriteCreatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{book.author}</p>
                      </div>
                      <button
                        onClick={() => setExpandedBook(isExpanded ? null : book.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100 flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {book.year && (
                      <p className="text-xs text-gray-400 mt-1">
                        {book.year}
                        {book.publisher && ` • ${book.publisher}`}
                      </p>
                    )}

                    {/* Descripción expandible */}
                    {isExpanded && book.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fadeIn">
                        <p className="text-xs text-gray-600 line-clamp-4">
                          {book.description}
                        </p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Link
                        href={`/cliente/libro/${book.id}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-100 transition text-xs font-medium"
                      >
                        <Eye size={14} />
                        Ver detalles
                      </Link>
                      <button
                        onClick={() => removeFavorite(book.id, book.favoriteId)}
                        disabled={removingId === book.favoriteId}
                        className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                      >
                        {removingId === book.favoriteId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        <span className="hidden sm:inline">Quitar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página */}
        {filteredFavorites.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredFavorites.length}</span> libros favoritos
          </div>
        )}
      </div>
    </div>
  );
}