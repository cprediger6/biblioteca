// app/cliente/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CreditCard,
  History,
  Search,
  Bell,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ClienteDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin h-12 w-12 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const stats = [
    { label: "Reservas activas", value: 2, icon: BookOpen },
    { label: "En lectura", value: 1, icon: Clock },
    { label: "Historial", value: 5, icon: History },
    { label: "Membresía (días)", value: 45, icon: Calendar },
  ];

  const recommendations = [
    { title: "El Principito", author: "Saint-Exupéry", tag: "Tendencia" },
    { title: "1984", author: "George Orwell", tag: "Recomendado" },
    { title: "Cien Años de Soledad", author: "G. G. Márquez", tag: "Clásico" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HERO PREMIUM */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

          <div className="flex flex-col sm:flex-row justify-between gap-6 relative">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Bienvenido, {session.user?.name || "lector"}
              </h1>
              <p className="text-white/80 mt-2 text-sm sm:text-base">
                Tu biblioteca digital personalizada está lista para ti
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href="/cliente/catalogo"
                  className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:scale-105 transition"
                >
                  Explorar catálogo
                </Link>

                <Link
                  href="/cliente/books/search"
                  className="bg-white/10 backdrop-blur px-4 py-2 rounded-xl hover:bg-white/20 transition"
                >
                  Buscar libros
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                <Bell className="w-5 h-5" />
              </button>

              <div className="bg-black/30 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Premium activo
              </div>
            </div>
          </div>
        </div>

        {/* STATS PREMIUM */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 group"
              >
                <Icon className="w-5 h-5 text-indigo-400 mb-3" />
                <p className="text-[10px] sm:text-sm text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mt-1 sm:mt-2">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS (tipo app moderna) */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Acciones rápidas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                href: "/cliente/books/search",
                label: "Buscar",
                icon: Search,
              },
              {
                href: "/cliente/catalogo",
                label: "Catálogo",
                icon: BookOpen,
              },
              {
                href: "/cliente/payments",
                label: "Pagos",
                icon: CreditCard,
              },
              {
                href: "/cliente/history",
                label: "Historial",
                icon: History,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 hover:scale-105"
                >
                  <Icon className="w-6 h-6 text-indigo-300 mb-3 group-hover:scale-110 transition" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

          {/* RECOMENDADOS */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recomendados para ti
            </h2>

            <div className="space-y-3">
              {recommendations.map((b) => (
                <div
                  key={b.title}
                  className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div>
                    <p className=" text-gray-500 text-sm sm:text-base font-semibold">{b.title}</p>
                    <p className="text-gray-500 text-xs">{b.author}</p>
                  </div>

                  <span className="text-gray-500 text-xs bg-indigo-500/20 px-3 py-1 rounded-full">
                    {b.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVITY / RESERVAS */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Tu actividad
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-gray-800 font-semibold">El Principito</p>
                <p className="text-xs text-gray-800">
                  Disponible para retiro
                </p>
              </div>

              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="font-semibold text-gray-800">1984</p>
                <p className="text-xs text-gray-800">
                  En preparación
                </p>
              </div>
            </div>

            <Link
              href="/cliente/history"
              className="inline-flex mt-5 text-sm text-indigo-300 hover:text-indigo-200"
            >
              Ver historial completo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}