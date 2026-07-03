// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Library,
  UserPlus,
  Bell,
  Crown,
  UserCheck,
  BookMarked
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

// Función para verificar autenticación y rol de administrador
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login?role=admin");
  }

  if (session.user?.role !== "admin") {
    redirect("/cliente/dashboard");
  }

  return session;
}

// Tipos para los préstamos
type LoanWithDetails = {
  id: string;
  loanDate: Date;
  dueDate: Date;
  status: string;
  user: { name: string };
  copy: { book: { title: string } };
};

export default async function DashboardPage() {
  // Verificar acceso de administrador
  const session = await verifyAdminAccess();

  // Obtener estadísticas en paralelo
  const [totalBooks, totalUsers, activeLoans, overdueLoans] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.loan.count({ where: { status: "active" } }),
    prisma.loan.count({ where: { status: "overdue" } }),
  ]);

  // Obtener préstamos recientes
  const recentLoans: LoanWithDetails[] = await prisma.loan.findMany({
    take: 5,
    orderBy: { loanDate: "desc" },
    include: {
      user: { select: { name: true } },
      copy: { include: { book: { select: { title: true } } } },
    },
  });

  // Obtener préstamos vencidos
  const overdueLoansList: LoanWithDetails[] = await prisma.loan.findMany({
    where: { status: "overdue" },
    include: {
      user: { select: { name: true } },
      copy: { include: { book: { select: { title: true } } } },
    },
    take: 5,
  });

  // Calcular días de vencimiento
  const calculateDaysOverdue = (dueDate: Date) => {
    const diff = new Date().getTime() - new Date(dueDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Estadísticas para mostrar
  const stats = [
    { 
      label: "Total Libros", 
      value: totalBooks, 
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600"
    },
    { 
      label: "Usuarios Registrados", 
      value: totalUsers, 
      icon: Users,
      color: "bg-green-50 text-green-600",
      iconColor: "text-green-600"
    },
    { 
      label: "Préstamos Activos", 
      value: activeLoans, 
      icon: ClipboardList,
      color: "bg-yellow-50 text-yellow-600",
      iconColor: "text-yellow-600"
    },
    { 
      label: "Préstamos Vencidos", 
      value: overdueLoans, 
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      iconColor: "text-red-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header con gradiente - Mismo tamaño que en usuarios */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                👋 ¡Bienvenido, {session.user?.name || "Administrador"}!
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Panel de control de tu biblioteca
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Admin
            </div>
          </div>
        </div>

        {/* Estadísticas - Mismo grid que en usuarios */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mt-1 sm:mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`${stat.iconColor} w-4 h-4 sm:w-6 sm:h-6`} />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 flex items-center text-[10px] sm:text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span>+12% este mes</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones rápidas - Mismo estilo que en usuarios */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Acciones rápidas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                href: "/admin/books",
                label: "Gestionar Libros",
                icon: Library,
                color: "from-blue-500 to-blue-600"
              },
              {
                href: "/admin/books/new",
                label: "Agregar Libro",
                icon: PlusCircle,
                color: "from-green-500 to-green-600"
              },
              {
                href: "/admin/users",
                label: "Gestionar Usuarios",
                icon: UserPlus,
                color: "from-purple-500 to-purple-600"
              },
              {
                href: "/admin/loans",
                label: "Préstamos",
                icon: ClipboardList,
                color: "from-orange-500 to-orange-600"
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 hover:scale-105"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL - Mismo grid que en usuarios */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

          {/* PRÉSTAMOS RECIENTES - Mismo estilo que en usuarios */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-500" />
                Préstamos Recientes
              </h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Últimos 5
              </span>
            </div>

            {recentLoans.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm sm:text-base">No hay préstamos recientes</p>
                <p className="text-xs text-gray-400 mt-1">Los préstamos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {loan.user.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        📖 {loan.copy.book.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(loan.loanDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        loan.status === "active" 
                          ? "bg-green-100 text-green-700" 
                          : loan.status === "overdue"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {loan.status === "active" ? "🟢 Activo" : 
                         loan.status === "overdue" ? "🔴 Vencido" : "⚪ Devuelto"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/admin/loans"
              className="inline-flex mt-4 sm:mt-5 text-sm text-indigo-600 hover:text-indigo-700 items-center gap-1 font-medium"
            >
              Ver todos los préstamos →
            </Link>
          </div>

          {/* ALERTAS DE VENCIMIENTO - Mismo estilo que en usuarios */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Alertas de Vencimiento
              </h2>
              {overdueLoansList.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full animate-pulse">
                  {overdueLoansList.length} alertas
                </span>
              )}
            </div>

            {overdueLoansList.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-500 text-sm sm:text-base">No hay préstamos vencidos</p>
                <p className="text-xs text-gray-400 mt-1">Todo está al día</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {overdueLoansList.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {loan.user.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          📖 {loan.copy.book.title}
                        </p>
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                        ⏰ {calculateDaysOverdue(loan.dueDate)} días vencido
                      </span>
                    </div>
                    <div className="mt-1 sm:mt-2 flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                      <span>📅 Vencimiento:</span>
                      <span className="font-medium text-gray-700">
                        {new Date(loan.dueDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {overdueLoansList.length > 0 && (
              <Link
                href="/admin/loans?filter=overdue"
                className="inline-flex mt-4 sm:mt-5 text-sm text-red-600 hover:text-red-700 items-center gap-1 font-medium"
              >
                Ver todos los vencidos →
              </Link>
            )}
          </div>
        </div>

        {/* Footer - Mismo que en usuarios */}
        <div className="mt-6 sm:mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-4 sm:pt-6">
          <p>© {new Date().getFullYear()} Biblioteca Digital - Panel de Administración</p>
          <p className="mt-1">
            {new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })} • Última actualización
          </p>
        </div>
      </div>
    </div>
  );
}