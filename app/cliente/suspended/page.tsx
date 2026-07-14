// app/cliente/suspended/page.tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  AlertCircle, 
  CreditCard, 
  Clock, 
  Calendar, 
  Mail, 
  User,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function SuspendedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ⏳ Cuenta Suspendida
          </h1>
          <p className="text-gray-600 mb-2">
            Tu cuenta ha sido suspendida por falta de pago.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Para reactivar tu cuenta y seguir disfrutando de todos los servicios,
            realiza el pago pendiente.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm text-amber-700 font-medium">
                  Tienes pagos pendientes
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Último pago: {session?.user?.lastPaymentDate 
                    ? new Date(session.user.lastPaymentDate).toLocaleDateString() 
                    : "Nunca"}
                </p>
                <p className="text-xs text-amber-600">
                  Días sin pagar: 30+
                </p>
              </div>
            </div>
          </div>

          {/* Acciones disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <Link
              href="/cliente/pagos"
              className="py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
            >
              <CreditCard className="w-5 h-5" />
              Realizar Pago
            </Link>

            <Link
              href="/cliente/dashboard"
              className="py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Ver Dashboard
            </Link>
          </div>

          {/* Información adicional */}
          <div className="border-t border-gray-100 pt-4">
            <details className="text-sm text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700 flex items-center gap-2 justify-center">
                <span>¿Qué puedo hacer mientras estoy suspendido?</span>
                <ArrowRight className="w-4 h-4" />
              </summary>
              <div className="mt-3 text-left space-y-2 text-xs">
                <p>✅ Ver tu información de perfil</p>
                <p>✅ Ver tu historial de pagos</p>
                <p>✅ Realizar pagos pendientes</p>
                <p>❌ Hacer nuevos préstamos</p>
                <p>❌ Hacer reservas de libros</p>
                <p>❌ Acceder al catálogo completo</p>
              </div>
            </details>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
              <Mail className="w-3 h-3" />
              ¿Dudas? Contacta al administrador
            </p>
            <Link 
              href="mailto:admin@biblioteca.com" 
              className="text-xs text-indigo-600 hover:text-indigo-800 transition mt-1 inline-block"
            >
              admin@biblioteca.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}