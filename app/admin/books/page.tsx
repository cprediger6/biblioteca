// app/admin/books/page.tsx
import { prisma } from "@/lib/prisma";
import Barcode from "@/components/Barcode";
import Link from "next/link";
import { 
  Plus, Search, BookOpen, Copy, Edit, Trash2, Eye, 
  TrendingUp, Filter, Image as ImageIcon, Barcode as BarcodeIcon
} from "lucide-react";

// Definir tipos
type BookWithCopies = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  copies: {
    id: string;
    code: string; // Asegurarse de que existe
    status: string;
    location: string | null;
    bookId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  _count: {
    copies: number;
  };
};

type CopyStatus = {
  status: string;
};

export default async function BooksPage() {
  const books: BookWithCopies[] = await prisma.book.findMany({
    include: {
      copies: true, // Incluir todas las columnas de Copy
      _count: {
        select: {
          copies: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const availableCopies = (copies: CopyStatus[]) => {
    return copies.filter(c => c.status === "available").length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📖 Gestión de Libros</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Administra tu colección literaria
              </p>
            </div>
            <Link
              href="/admin/books/new"
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nuevo Libro</span>
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Buscar libros por título, autor o ISBN..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center text-sm sm:text-base">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Grid de libros */}
        {books.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              No hay libros registrados
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              Comienza agregando tu primer libro a la biblioteca
            </p>
            <Link
              href="/admin/books/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Agregar primer libro</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {books.map((book: BookWithCopies) => {
              const available = availableCopies(book.copies);
              const total = book._count.copies;
              const availability = total > 0 ? Math.round((available / total) * 100) : 0;
              
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Cover con imagen o placeholder */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={`Portada de ${book.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl sm:text-7xl opacity-20 group-hover:opacity-30 transition-opacity">
                        📖
                      </div>
                    )}
                    
                    {/* Badge de ejemplares */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-gray-700 shadow-lg flex items-center space-x-1">
                      <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{total}</span>
                    </div>

                    {/* Badge de imagen si tiene portada */}
                    {book.coverImage && (
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-xs text-white flex items-center space-x-1">
                        <ImageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>Portada</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 sm:mb-3">{book.author}</p>
                    
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {book.year && (
                        <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs text-gray-600">
                          {book.year}
                        </span>
                      )}
                      {book.isbn && (
                        <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs text-gray-600 truncate max-w-[70px] sm:max-w-[100px]">
                          ISBN: {book.isbn}
                        </span>
                      )}
                    </div>

                    {/* Barra de disponibilidad */}
                    <div className="mb-3 sm:mb-4">
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                        <span className="flex items-center">
                          <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mr-1 ${
                            availability > 50 ? 'bg-green-500' :
                            availability > 25 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></span>
                          Disponibilidad
                        </span>
                        <span>{available}/{total} ejemplares</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            availability > 50 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            availability > 25 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${availability}%` }}
                        />
                      </div>
                    </div>

                    {/* Códigos de los ejemplares */}
                    {book.copies.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mb-1.5">
                          <BarcodeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="font-medium">Ejemplares:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {book.copies.map((copy) => (
                            <div 
                              key={copy.id} 
                              className="bg-gray-50 border border-gray-200 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center gap-1"
                              title={`Estado: ${copy.status}`}
                            >
                              <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 truncate max-w-[60px] sm:max-w-[80px]">
                                {copy.code && copy.code !== 'undefined' ? copy.code : copy.id.slice(0, 8)}
                              </span>
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                copy.status === 'available' ? 'bg-green-500' :
                                copy.status === 'loaned' ? 'bg-yellow-500' :
                                copy.status === 'overdue' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-0.5 sm:space-x-1">
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                        <Link
                          href={`/admin/books/${book.id}/edit`}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                        <button 
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 truncate max-w-[70px] sm:max-w-none">
                        <TrendingUp className="inline w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página */}
        {books.length > 0 && (
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{books.length}</span> libros 
            en tu biblioteca
          </div>
        )}
      </div>
    </div>
  );
}