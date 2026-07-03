import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, User, Mail, Phone, Shield, Calendar, 
  BookOpen, Clock, CheckCircle, XCircle, AlertCircle,
  Crown, UserCheck, BookMarked, TrendingUp
} from "lucide-react";

// Definir tipos
type LoanWithBook = {
  id: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  userId: string;
  copyId: string;
  createdAt: Date;
  updatedAt: Date;
  copy: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string | null;
    };
  };
};

type ReservationWithBook = {
  id: string;
  reserveDate: Date;
  status: string;
  userId: string;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string | null;
  };
};

type Subscription = {
  id: string;
  userId: string;
  plan: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserWithRelations = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  loans: LoanWithBook[];
  reservations: ReservationWithBook[];
  subscriptions: Subscription | null;
};

type UserDetailProps = {
  params: {
    id: string;
  };
};

export default async function UserDetailPage({ params }: UserDetailProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      loans: {
        include: {
          copy: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  coverImage: true,
                },
              },
            },
          },
        },
        orderBy: {
          loanDate: "desc",
        },
      },
      reservations: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverImage: true,
            },
          },
        },
        orderBy: {
          reserveDate: "desc",
        },
      },
      subscriptions: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Estadísticas del usuario con tipos
  const totalLoans = user.loans.length;
  const activeLoans = user.loans.filter((loan: LoanWithBook) => loan.status === "active").length;
  const overdueLoans = user.loans.filter((loan: LoanWithBook) => loan.status === "overdue").length;
  const returnedLoans = user.loans.filter((loan: LoanWithBook) => loan.status === "returned").length;
  const totalReservations = user.reservations.length;

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: "bg-green-100 text-green-700", label: "Activo", icon: CheckCircle },
      overdue: { color: "bg-red-100 text-red-700", label: "Vencido", icon: AlertCircle },
      returned: { color: "bg-gray-100 text-gray-700", label: "Devuelto", icon: XCircle },
    };
    return config[status as keyof typeof config] || config.active;
  };

  const getReservationStatus = (status: string) => {
    const config = {
      pending: { color: "bg-yellow-100 text-yellow-700", label: "Pendiente" },
      fulfilled: { color: "bg-green-100 text-green-700", label: "Completada" },
      cancelled: { color: "bg-gray-100 text-gray-700", label: "Cancelada" },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const calculateDaysLeft = (dueDate: Date) => {
    const today = new Date();
    const diff = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getRoleInfo = (role: string) => {
    if (role === "admin") {
      return { 
        label: "Administrador", 
        icon: Crown, 
        color: "bg-purple-100 text-purple-700" 
      };
    }
    return { 
      label: "Usuario Regular", 
      icon: User, 
      color: "bg-blue-100 text-blue-700" 
    };
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-indigo-100 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user.email}
                </p>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Usuarios</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del usuario */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tarjeta de perfil */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    {user.phone}
                  </p>
                )}
                <div className={`mt-3 ${roleInfo.color} px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                  <RoleIcon className="w-4 h-4" />
                  <span>{roleInfo.label}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Miembro desde: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta de suscripción */}
            {user.subscriptions ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                  Suscripción Activa
                </h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                  <p className="font-medium text-gray-800">
                    Plan {user.subscriptions.plan === "premium" ? "Premium" : "Básico"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Válida hasta: {new Date(user.subscriptions.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estado: {user.subscriptions.active ? "✅ Activa" : "❌ Inactiva"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Crown className="w-5 h-5 text-gray-400 mr-2" />
                  Suscripción
                </h3>
                <p className="text-sm text-gray-500">Sin suscripción activa</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Historial */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas del usuario */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{totalLoans}</p>
                <p className="text-xs text-gray-500">Total Préstamos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{activeLoans}</p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{overdueLoans}</p>
                <p className="text-xs text-gray-500">Vencidos</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{totalReservations}</p>
                <p className="text-xs text-gray-500">Reservas</p>
              </div>
            </div>

            {/* Historial de préstamos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                Historial de Préstamos
              </h3>
              
              {user.loans.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Este usuario no tiene préstamos registrados
                </p>
              ) : (
                <div className="space-y-4">
                  {user.loans.map((loan: LoanWithBook) => {
                    const statusConfig = getStatusBadge(loan.status);
                    const StatusIcon = statusConfig.icon;
                    const daysLeft = loan.status === "active" ? calculateDaysLeft(loan.dueDate) : null;
                    
                    return (
                      <div key={loan.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                              {loan.copy.book.coverImage ? (
                                <img 
                                  src={loan.copy.book.coverImage} 
                                  alt={loan.copy.book.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  📖
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{loan.copy.book.title}</p>
                              <p className="text-sm text-gray-600">{loan.copy.book.author}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(loan.loanDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {daysLeft !== null && daysLeft > 0 && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {daysLeft} días
                              </span>
                            )}
                            {daysLeft !== null && daysLeft <= 0 && (
                              <span className="text-xs text-red-500 font-semibold flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Vencido
                              </span>
                            )}
                            <span className={`${statusConfig.color} px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Historial de reservas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BookMarked className="w-5 h-5 mr-2 text-purple-600" />
                Historial de Reservas
              </h3>
              
              {user.reservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Este usuario no tiene reservas registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {user.reservations.map((reservation: ReservationWithBook) => {
                    const statusConfig = getReservationStatus(reservation.status);
                    
                    return (
                      <div key={reservation.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                            {reservation.book.coverImage ? (
                              <img 
                                src={reservation.book.coverImage} 
                                alt={reservation.book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                📖
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{reservation.book.title}</p>
                            <p className="text-sm text-gray-600">{reservation.book.author}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(reservation.reserveDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`${statusConfig.color} px-3 py-1 rounded-full text-xs font-medium`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}