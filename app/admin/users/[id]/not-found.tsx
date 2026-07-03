import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
        <div className="text-6xl mb-4">👤</div>
        <UserX className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Usuario no encontrado
        </h1>
        <p className="text-gray-500 mb-6">
          El usuario que estás buscando no existe o ha sido eliminado.
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Usuarios</span>
        </Link>
      </div>
    </div>
  );
}