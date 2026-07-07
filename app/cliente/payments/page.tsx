// app/cliente/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Plus,
  Eye,
  Trash2,
  Shield,
  Lock,
  Building2,
  Wallet,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Receipt,
  Download,
  Printer,
  Banknote,
} from "lucide-react";

type Payment = {
  id: string;
  userId: string;
  amount: number;
  method: 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type PaymentMethod = {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account';
  lastFour: string;
  brand: string;
  isDefault: boolean;
  expiryDate?: string;
  holderName?: string;
};

type FilterType = 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
type MethodFilterType = 'all' | 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilterType>('all');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchPayments();
      fetchPaymentMethods();
    }
  }, [status, router]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/cliente/payments");
      if (!response.ok) {
        throw new Error("Error al cargar los pagos");
      }
      
      const data = await response.json();
      setPayments(data.payments || []);
      
      // Calcular total pagado
      const total = data.payments
        ?.filter((p: Payment) => p.status === 'completed')
        .reduce((sum: number, p: Payment) => sum + p.amount, 0) || 0;
      setTotalPaid(total);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/cliente/payment-methods");
      if (!response.ok) throw new Error("Error al cargar métodos de pago");
      const data = await response.json();
      setPaymentMethods(data.methods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Fallido', icon: XCircle },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Reembolsado', icon: XCircle },
    };
    const style = config[status] || config.pending;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon size={12} />
        {style.label}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'debit_card':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'cash':
        return <Banknote className="w-5 h-5 text-green-500" />;
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-indigo-500" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Tarjeta de Crédito';
      case 'debit_card':
        return 'Tarjeta de Débito';
      case 'cash':
        return 'Efectivo';
      case 'bank_transfer':
        return 'Transferencia Bancaria';
      default:
        return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.status !== filter) return false;
    if (methodFilter !== 'all' && payment.method !== methodFilter) return false;
    return true;
  });

  // Estadísticas
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus pagos...</p>
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
            onClick={() => fetchPayments()}
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
                <CreditCard className="w-8 h-8" />
                Mis Pagos
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Gestiona tus pagos y métodos de pago
              </p>
            </div>
            <Link
              href="/cliente/dashboard"
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={18} />
              Volver al dashboard
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <span className="font-semibold">{formatCurrency(totalPaid)}</span>
              <span className="text-indigo-100">Total pagado</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
              <span className="font-semibold">{totalPayments}</span>
              <span className="text-indigo-100">Pagos totales</span>
            </div>
            {completedPayments > 0 && (
              <div className="bg-green-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span className="font-semibold">{completedPayments}</span>
                <span className="text-indigo-100">Completados</span>
              </div>
            )}
            {pendingPayments > 0 && (
              <div className="bg-yellow-500/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <Clock size={14} />
                <span className="font-semibold">{pendingPayments}</span>
                <span className="text-indigo-100">Pendientes</span>
              </div>
            )}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" />
                Métodos de Pago
              </h2>
              <p className="text-sm text-gray-500">Administra tus métodos de pago guardados</p>
            </div>
            <button
              onClick={() => setShowAddMethod(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Agregar método
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tienes métodos de pago guardados</p>
              <button
                onClick={() => setShowAddMethod(true)}
                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Agregar tu primer método de pago →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border-2 ${
                    method.isDefault 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-6 h-6 ${method.isDefault ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {method.brand} •••• {method.lastFour}
                        </p>
                        {method.holderName && (
                          <p className="text-xs text-gray-500">{method.holderName}</p>
                        )}
                        {method.expiryDate && (
                          <p className="text-xs text-gray-500">Expira: {method.expiryDate}</p>
                        )}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Predeterminado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Estado:</span>
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: '⏳ Pendientes' },
                  { value: 'completed', label: '✅ Completados' },
                  { value: 'failed', label: '❌ Fallidos' },
                  { value: 'refunded', label: '🔄 Reembolsados' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as FilterType)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition
                      ${
                        filter === f.value
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full sm:w-auto">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as MethodFilterType)}
                className="w-full sm:w-auto px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="all">Todos los métodos</option>
                <option value="credit_card">💳 Crédito</option>
                <option value="debit_card">💳 Débito</option>
                <option value="cash">💵 Efectivo</option>
                <option value="bank_transfer">🏦 Transferencia</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Mostrando {filteredPayments.length} de {totalPayments} pagos
          </div>
        </div>

        {/* Lista de pagos */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-6">
              <Receipt className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {filter !== 'all' || methodFilter !== 'all'
                ? "No se encontraron pagos con estos filtros"
                : "Aún no tienes pagos registrados"}
            </h2>
            <p className="text-gray-400 mb-6">
              {filter !== 'all' || methodFilter !== 'all'
                ? "Prueba con otros filtros"
                : "Los pagos aparecerán aquí cuando realices transacciones"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((payment) => {
              const isExpanded = expandedPayment === payment.id;

              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
                >
                  {/* Cabecera del pago */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedPayment(isExpanded ? null : payment.id)}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getMethodIcon(payment.method)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {payment.description}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {getMethodLabel(payment.method)} • Ref: {payment.reference}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-gray-800">
                          {formatCurrency(payment.amount)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(payment.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        {getStatusBadge(payment.status)}
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Receipt size={14} className="text-gray-400" />
                            <span className="text-gray-500">Referencia:</span>
                            <span className="font-mono text-sm text-gray-800">{payment.reference}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard size={14} className="text-gray-400" />
                            <span className="text-gray-500">Método:</span>
                            <span className="font-medium text-gray-800">{getMethodLabel(payment.method)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign size={14} className="text-gray-400" />
                            <span className="text-gray-500">Monto:</span>
                            <span className="font-bold text-gray-800">{formatCurrency(payment.amount)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-gray-500">Fecha:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(payment.createdAt).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-500">Estado:</span>
                            {getStatusBadge(payment.status)}
                          </div>
                          {payment.status === 'completed' && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle size={14} />
                              <span>Pago completado exitosamente</span>
                            </div>
                          )}
                          {payment.status === 'pending' && (
                            <div className="flex items-center gap-2 text-sm text-yellow-600">
                              <Clock size={14} />
                              <span>Pago en proceso de verificación</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm flex items-center gap-1">
                          <Download size={14} />
                          Descargar recibo
                        </button>
                        <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition text-sm flex items-center gap-1">
                          <Printer size={14} />
                          Imprimir
                        </button>
                        {payment.status === 'pending' && (
                          <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm flex items-center gap-1">
                            <Trash2 size={14} />
                            Cancelar pago
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pie de página */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-700">{filteredPayments.length}</span> pagos
            {filter !== 'all' && ` con estado "${filter}"`}
            {methodFilter !== 'all' && ` con método "${methodFilter}"`}
          </div>
        )}
      </div>

      {/* Modal para agregar método de pago */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-500" />
                Agregar Método de Pago
              </h3>
              <button
                onClick={() => setShowAddMethod(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de tarjeta
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
                  <option value="credit">Tarjeta de Crédito</option>
                  <option value="debit">Tarjeta de Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha expiración
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del titular
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultMethod"
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="defaultMethod" className="text-sm text-gray-700">
                  Establecer como método predeterminado
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                <Shield size={14} className="text-green-500 flex-shrink-0" />
                <span>Tus datos están seguros. La información de tu tarjeta está encriptada.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMethod(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
                >
                  Guardar método
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}