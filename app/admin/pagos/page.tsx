// app/admin/pagos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    status: string;
    lastPaymentDate: string;
  };
};

type OverdueUser = {
  id: string;
  name: string;
  email: string;
  identification: string;
  phone: string | null;
  status: string;
  lastPaymentDate: string;
  daysOverdue: number;
  _count: {
    loans: number;
    reservations: number;
  };
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [overdueUsers, setOverdueUsers] = useState<OverdueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOverdue, setLoadingOverdue] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Formulario de registro de pago
  const [paymentForm, setPaymentForm] = useState({
    userId: "",
    amount: "",
    method: "cash",
    description: "Pago mensual de suscripción",
  });

  useEffect(() => {
    fetchPayments();
    fetchOverdueUsers();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/payments");
      if (!response.ok) throw new Error("Error al cargar pagos");
      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueUsers = async () => {
    try {
      setLoadingOverdue(true);
      const response = await fetch("/api/admin/payments/overdue");
      if (!response.ok) throw new Error("Error al cargar usuarios atrasados");
      const data = await response.json();
      setOverdueUsers(data.users);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingOverdue(false);
    }
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentForm.userId || !paymentForm.amount) {
      alert("Por favor, selecciona un usuario y un monto");
      return;
    }

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: paymentForm.userId,
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          description: paymentForm.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrar pago");
      }

      alert("✅ Pago registrado exitosamente");
      setShowRegisterModal(false);
      setPaymentForm({
        userId: "",
        amount: "",
        method: "cash",
        description: "Pago mensual de suscripción",
      });
      await fetchPayments();
      await fetchOverdueUsers();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Error al registrar pago");
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Completado" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pendiente" },
      failed: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Fallido" },
      refunded: { bg: "bg-gray-100", text: "text-gray-700", icon: XCircle, label: "Reembolsado" },
    };
    const style = config[status as keyof typeof config] || config.pending;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  const getUserStatusBadge = (status: string) => {
    const config = {
      active: { bg: "bg-green-100", text: "text-green-700", label: "Activo" },
      suspended: { bg: "bg-amber-100", text: "text-amber-700", label: "Suspendido" },
      blocked: { bg: "bg-red-100", text: "text-red-700", label: "Bloqueado" },
      inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Inactivo" },
    };
    const style = config[status as keyof typeof config] || config.active;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getOverdueBadge = (days: number) => {
    if (days > 30) {
      return { bg: "bg-red-100", text: "text-red-700", label: "CRÍTICO" };
    }
    if (days > 15) {
      return { bg: "bg-amber-100", text: "text-amber-700", label: "ATENCIÓN" };
    }
    return { bg: "bg-yellow-100", text: "text-yellow-700", label: "PENDIENTE" };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.identification.includes(searchTerm) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">💳 Gestión de Pagos</h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                Administra los pagos de los clientes
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full sm:w-auto bg-white text-indigo-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pagos</p>
                <p className="text-2xl font-bold text-indigo-600">{totalPayments}</p>
              </div>
              <div className="bg-indigo-50 p-2 rounded-xl">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 p-2 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes con deuda</p>
                <p className="text-2xl font-bold text-red-600">{overdueUsers.length}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Promedio por pago</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="bg-purple-50 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Clientes con pagos atrasados */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Clientes con Pagos Atrasados
            <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {overdueUsers.length}
            </span>
          </h2>

          {loadingOverdue ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : overdueUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p>¡Todos los clientes están al día!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-left">Identificación</th>
                    <th className="px-4 py-2 text-center">Días atrasado</th>
                    <th className="px-4 py-2 text-center">Estado</th>
                    <th className="px-4 py-2 text-center">Último pago</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueUsers.map((user) => {
                    const overdueBadge = getOverdueBadge(user.daysOverdue);
                    return (
                      <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.identification}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${overdueBadge.bg} ${overdueBadge.text}`}>
                            {user.daysOverdue} días
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getUserStatusBadge(user.status)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">
                          {user.lastPaymentDate ? formatDate(user.lastPaymentDate) : "Nunca"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setPaymentForm({
                                ...paymentForm,
                                userId: user.id,
                              });
                              setShowRegisterModal(true);
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs"
                          >
                            Registrar Pago
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lista de pagos */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Historial de Pagos
              <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                {filteredPayments.length}
              </span>
            </h2>
            <button
              onClick={fetchPayments}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por cliente o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
              <option value="refunded">Reembolsados</option>
            </select>
          </div>

          {/* Tabla de pagos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Referencia</th>
                  <th className="px-4 py-2 text-center">Monto</th>
                  <th className="px-4 py-2 text-center">Método</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                  <th className="px-4 py-2 text-center">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No hay pagos registrados
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{payment.user.name}</p>
                          <p className="text-xs text-gray-500">{payment.user.identification}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {payment.reference}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-green-600">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Registrar Pago */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">💳 Registrar Pago</h2>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {selectedUser && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="font-medium text-gray-800">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">ID: {selectedUser.identification}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            )}

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Usuario *
                </label>
                <input
                  type="text"
                  value={paymentForm.userId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, userId: e.target.value })}
                  placeholder="ID del usuario (ej: cmr...)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Busca el ID del usuario en la tabla de usuarios</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="10.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="cash">Efectivo</option>
                  <option value="credit_card">Tarjeta de Crédito</option>
                  <option value="debit_card">Tarjeta de Débito</option>
                  <option value="bank_transfer">Transferencia Bancaria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="Pago mensual de suscripción"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
              >
                Registrar Pago
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}