import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Libro no encontrado</h1>
        <p className="text-gray-500 mb-6">El libro que buscas no existe o ha sido eliminado</p>
        <Link
          href="/admin/books"
          className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a libros</span>
        </Link>
      </div>
    </div>
  );
}