// app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PrintCarnetButton from "@/components/PrintCarnetButton";
import { 
  Plus, Search, Filter, User, Mail, Phone, 
  Calendar, Edit, Trash2,
  Users, UserCheck, Crown, Download, X,
  UserX
} from "lucide-react";
import DeleteUserButton from "@/components/DeleteUserButton";
import { UserStatusToggle } from "@/components/UserStatusToggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

type UserWithCounts = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  identification: string;
  role: string;
  createdAt: Date;
  _count: {
    loans: number;
    reservations: number;
  };
};

interface SearchParams {
  search?: string;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Verificar autenticación y rol
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  // Obtener parámetros de búsqueda
  const params = await searchParams;
  const searchTerm = params.search?.trim() || "";

  // Construir condiciones de búsqueda
  let whereClause = {};
  
  if (searchTerm) {
    whereClause = {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { identification: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };
  }

  // ✅ Usar include en lugar de select para evitar problemas con campos que pueden no existir
  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      _count: {
        select: {
          loans: true,
          reservations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Estadísticas (siempre basadas en todos los usuarios, no solo los filtrados)
  const allUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          loans: true,
        },
      },
    },
  });

  const totalUsers = allUsers.length;
  const adminUsers = allUsers.filter(u => u.role === "admin").length;
  const regularUsers = allUsers.filter(u => u.role === "user").length;
  const usersWithLoans = allUsers.filter(u => u._count.loans > 0).length;
  
  // ✅ Manejar status de forma segura - si no existe, usar "active" por defecto
  // @ts-ignore - El campo puede no existir en producción
  const activeUsers = allUsers.filter(u => (u.status || "active") === "active").length;
  // @ts-ignore - El campo puede no existir en producción
  const suspendedUsers = allUsers.filter(u => (u.status || "active") === "suspended").length;

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return { 
        color: "bg-purple-100 text-purple-700", 
        label: "Administrador", 
        icon: Crown 
      };
    }
    return { 
      color: "bg-blue-100 text-blue-700", 
      label: "Usuario", 
      icon: User 
    };
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { 
        color: "bg-green-100 text-green-700", 
        label: "Activo",
        icon: UserCheck
      },
      suspended: { 
        color: "bg-amber-100 text-amber-700", 
        label: "Suspendido",
        icon: UserX
      },
      blocked: { 
        color: "bg-red-100 text-red-700", 
        label: "Bloqueado",
        icon: UserX
      },
      inactive: { 
        color: "bg-gray-100 text-gray-700", 
        label: "Inactivo",
        icon: UserX
      },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">👥 Gestión de Usuarios</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Administra los usuarios de tu biblioteca
              </p>
            </div>
            <Link
              href="/admin/users/new"
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nuevo Usuario</span>
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Total Usuarios</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{totalUsers}</p>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-xl">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Activos</p>
                <p className="text-xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{activeUsers}</p>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-xl">
                <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Suspendidos</p>
                <p className="text-xl sm:text-3xl font-bold text-amber-600 mt-1 sm:mt-2">{suspendedUsers}</p>
              </div>
              <div className="bg-amber-50 p-2 sm:p-3 rounded-xl">
                <UserX className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium">Con Préstamos</p>
                <p className="text-xl sm:text-3xl font-bold text-indigo-600 mt-1 sm:mt-2">{usersWithLoans}</p>
              </div>
              <div className="bg-indigo-50 p-2 sm:p-3 rounded-xl">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <form action="/admin/users" method="GET" className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Buscar por nombre, email, identificación o teléfono..."
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
              {searchTerm && (
                <Link
                  href="/admin/users"
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </Link>
              )}
            </div>
          </form>
          
          {/* Indicador de resultados */}
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
              {users.length === 0 ? (
                <span className="text-red-500">❌ No se encontraron usuarios para "<strong>{searchTerm}</strong>"</span>
              ) : (
                <span className="text-green-600">✅ Se encontraron <strong>{users.length}</strong> usuarios para "<strong>{searchTerm}</strong>"</span>
              )}
            </div>
          )}
        </div>

        {/* Lista de usuarios */}
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">👥</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
              {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {searchTerm 
                ? `No hay usuarios que coincidan con "${searchTerm}"` 
                : "Comienza a registrar usuarios en tu biblioteca"}
            </p>
            {searchTerm ? (
              <Link
                href="/admin/users"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Limpiar búsqueda</span>
              </Link>
            ) : (
              <Link
                href="/admin/users/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Crear primer usuario</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {users.map((user) => {
                const { color, label, icon: RoleIcon } = getRoleBadge(user.role);
                // ✅ Manejar status de forma segura - si no existe, usar "active" por defecto
                // @ts-ignore - El campo puede no existir en producción
                const userStatus = user.status || "active";
                const statusBadge = getStatusBadge(userStatus);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Header con gradiente según rol y estado */}
                    <div className={`h-20 sm:h-24 bg-gradient-to-r ${
                      user.role === "admin" 
                        ? "from-purple-500 to-pink-500" 
                        : userStatus === "suspended"
                        ? "from-amber-500 to-orange-500"
                        : "from-blue-500 to-indigo-500"
                    } relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 sm:p-4">
                          {user.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={user.photo} 
                              alt={user.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 p-2 sm:p-3 flex gap-1">
                        <span className={`${color} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center space-x-1`}>
                          <RoleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{label}</span>
                        </span>
                        <span className={`${statusBadge.color} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center space-x-1`}>
                          <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">
                        {user.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center truncate">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1 truncate">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          {user.phone}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center mt-1 truncate">
                        <span className="font-medium mr-1">ID:</span>
                        {user.identification}
                      </p>
                      
                      {/* Estadísticas del usuario */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="text-center bg-gray-50 rounded-xl p-2 sm:p-3">
                          <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                            {user._count.loans}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Préstamos</p>
                        </div>
                        <div className="text-center bg-gray-50 rounded-xl p-2 sm:p-3">
                          <p className="text-lg sm:text-2xl font-bold text-purple-600">
                            {user._count.reservations}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Reservas</p>
                        </div>
                      </div>

                      {/* Fecha de registro */}
                      <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400 flex items-center">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        Registrado: {new Date(user.createdAt).toLocaleDateString()}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Ver Detalles
                        </Link>
                        
                        <PrintCarnetButton 
                          user={user}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                        />
                        
                        <UserStatusToggle 
                          userId={user.id}
                          userName={user.name}
                          // @ts-ignore - El campo puede no existir en producción
                          currentStatus={user.status || "active"}
                        />
                        
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                          title="Editar Usuario"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                        
                        <DeleteUserButton userId={user.id} userName={user.name} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie de página */}
            <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
              {searchTerm ? (
                <>
                  Mostrando <span className="font-semibold text-gray-700">{users.length}</span> resultados 
                  para "<span className="font-semibold text-indigo-600">{searchTerm}</span>"
                </>
              ) : (
                <>
                  Mostrando <span className="font-semibold text-gray-700">{users.length}</span> usuarios 
                  registrados en la biblioteca
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}