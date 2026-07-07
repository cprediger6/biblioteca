// app/cliente/catalogo/page.tsx
import { prisma } from "@/lib/prisma";
import { ReserveButton } from "@/components/ReserveButton";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import {
  BookOpen,
  Eye,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  Search,
  Bell,
  Filter,
} from "lucide-react";

// Definir el tipo de libro según la estructura de la tabla
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
  createdAt: Date;
  updatedAt: Date;
};

// Componente para una fila de libros
function BookRow({
  title,
  icon,
  books,
}: {
  title: string;
  icon: React.ReactNode;
  books: Book[];
}) {
  return (
    <div className="mb-12">
      {/* Encabezado de la fila */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {books.length}
          </span>
        </div>
        <button className="text-sm text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors font-medium">
          Ver todo <ChevronRight size={16} />
        </button>
      </div>

      {/* Fila horizontal con scroll */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
        {books.map((book) => {
          const colors = [
            "from-amber-100 to-orange-100 border-amber-200",
            "from-emerald-100 to-teal-100 border-emerald-200",
            "from-rose-100 to-pink-100 border-rose-200",
            "from-violet-100 to-indigo-100 border-violet-200",
            "from-slate-100 to-gray-100 border-slate-200",
            "from-red-100 to-orange-100 border-red-200",
            "from-blue-100 to-indigo-100 border-blue-200",
            "from-green-100 to-emerald-100 border-green-200",
          ];
          const colorIndex =
            book.id.charCodeAt(book.id.length - 1) % colors.length;
          const gradientColor = colors[colorIndex];

          return (
            <div
              key={book.id}
              className="snap-start relative min-w-[200px] sm:min-w-[220px] h-[320px] rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl bg-white group"
            >
              <div
                className={`h-full w-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
              >
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Sin portada</p>
                  </div>
                )}
              </div>

              {/* Info siempre visible abajo */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent">
                <h3 className="font-bold text-gray-800 text-sm truncate">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-500 truncate">{book.author}</p>
              </div>

              {/* Overlay al hacer hover */}
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div>
                  <h3 className="font-bold text-gray-800 text-base line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600">{book.author}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {book.year && (
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                        {book.year}
                      </span>
                    )}
                    {book.publisher && (
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full truncate max-w-[120px] font-medium">
                        {book.publisher}
                      </span>
                    )}
                  </div>

                  {book.description && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Botón de reserva - ya incluye el texto y la lógica completa */}
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ReserveButton bookId={book.id} />
                  </div>
                  <FavoriteButton bookId={book.id} className="flex-shrink-0" />
                </div>
                  {/* Botón para ver detalle del libro */}
                  <Link
                    href={`/cliente/libro/${book.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                  >
                    <Eye size={16} />
                    Ver detalle
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Server Component - Obtiene los datos directamente desde la BD
export default async function CatalogoPage() {
  // Obtener todos los libros desde la base de datos
  const allBooks = await prisma.book.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Si no hay libros, mostrar mensaje
  if (!allBooks || allBooks.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No hay libros disponibles
            </h2>
            <p className="text-gray-400">
              Pronto agregaremos nuevos títulos al catálogo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dividir los libros en diferentes secciones
  const tendencias = allBooks.slice(0, 8);
  const shuffled = [...allBooks].sort(() => Math.random() - 0.5);
  const recomendados = shuffled.slice(0, 8);
  const populares = [...allBooks]
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado con búsqueda tipo hero */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 blur-2xl rounded-full" />

          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  📚 Catálogo de Libros
                </h1>
                <p className="text-white/80 mt-2 text-sm sm:text-base">
                  Explora nuestra colección y encuentra tu próxima lectura
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-white/90">
                    {allBooks.length} libros disponibles
                  </span>
                  <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-white/90">
                    Actualizado hoy
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur">
                  <Bell className="w-5 h-5 text-white" />
                </button>
                <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition backdrop-blur">
                  <Filter className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="mt-6 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 transition-all shadow-lg">
                  <Search className="absolute left-4 w-5 h-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Buscar por título, autor o género..."
                    className="w-full bg-transparent text-white placeholder-white/60 pl-12 pr-4 py-3.5 rounded-2xl outline-none text-sm font-medium"
                  />
                  <button className="mr-1.5 px-5 py-2 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-white/90 transition shadow-lg hover:shadow-xl">
                    Buscar
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-2 ml-1">
                  🔍 Prueba buscando "Cien años de soledad" o "Gabriel García Márquez"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filas de libros */}
        {tendencias.length > 0 && (
          <BookRow
            title="🔥 Tendencias"
            icon={<TrendingUp size={20} className="text-orange-500" />}
            books={tendencias}
          />
        )}

        {recomendados.length > 0 && (
          <BookRow
            title="✨ Recomendados para ti"
            icon={<Sparkles size={20} className="text-purple-500" />}
            books={recomendados}
          />
        )}

        {populares.length > 0 && (
          <BookRow
            title="⭐ Más populares"
            icon={<Clock size={20} className="text-yellow-500" />}
            books={populares}
          />
        )}
      </div>
    </div>
  );
}