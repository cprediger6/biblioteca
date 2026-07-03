"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, Sparkles, BookOpen, Users, 
  Star, Clock, ChevronRight, Menu, X,
  Library, LogIn, UserPlus
} from "lucide-react";

export default function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Datos de estadísticas
  const stats = [
    { value: "12K+", label: "Usuarios Activos", icon: Users },
    { value: "25K+", label: "Libros Disponibles", icon: BookOpen },
    { value: "4.9★", label: "Valoración Media", icon: Star },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
        
        {/* Elementos flotantes decorativos */}
        <div className="absolute top-32 left-10 text-5xl opacity-5 animate-float">✦</div>
        <div className="absolute bottom-40 right-20 text-4xl opacity-5 animate-float-delayed">✦</div>
        <div className="absolute top-1/2 left-5 text-3xl opacity-5 animate-float">✦</div>
      </div>

      {/* Navbar con efecto glass */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100/20" 
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/30">
                <span className="text-white text-xl">📚</span>
              </div>
              <span className={`text-2xl font-bold transition-colors duration-500 ${
                scrolled ? "text-gray-800" : "text-gray-800"
              }`}>
                Book<span className="text-blue-500">ly</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-500 transition-colors font-medium">
                Inicio
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-500 transition-colors font-medium">
                Libros
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-500 transition-colors font-medium">
                Planes
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-500 transition-colors font-medium">
                Características
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-300/50 transition-all hover:scale-105"
              >
                Comenzar Gratis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl shadow-lg border-t border-gray-100/20">
            <div className="px-4 py-6 space-y-4">
              <Link href="#" className="block text-gray-700 hover:text-blue-500 transition-colors font-medium">
                Inicio
              </Link>
              <Link href="#" className="block text-gray-700 hover:text-blue-500 transition-colors font-medium">
                Libros
              </Link>
              <Link href="#" className="block text-gray-700 hover:text-blue-500 transition-colors font-medium">
                Planes
              </Link>
              <Link href="#" className="block text-gray-700 hover:text-blue-500 transition-colors font-medium">
                Características
              </Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-2.5 text-center text-gray-700 font-medium border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-2.5 text-center text-white font-medium bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg shadow-blue-200/40"
                >
                  Comenzar Gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Contenido Principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Columna Izquierda - Texto */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 font-medium">
                Nueva forma de leer
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-800">
              Descubre el placer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                de la lectura
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
              Accede a miles de libros, reserva en segundos y disfruta de la mejor 
              experiencia literaria desde cualquier lugar.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-300/50 transition-all hover:scale-105 text-base gap-2"
              >
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-gray-600 font-semibold rounded-full border-2 border-gray-200 hover:border-blue-300 hover:text-blue-500 hover:shadow-lg transition-all text-base gap-2"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </Link>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center gap-8 pt-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {["👩", "👨", "👩‍🦰", "👨‍🦱", "👩‍🦳"].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-white flex items-center justify-center text-lg shadow-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">+12,000 usuarios confían</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Elemento Visual */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Círculo decorativo de fondo */}
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 rounded-full blur-2xl"></div>
              
              {/* Círculo con gradiente */}
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100/30 shadow-2xl shadow-blue-200/20">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { emoji: "📖", label: "Libros", count: "25K+" },
                    { emoji: "👥", label: "Lectores", count: "12K+" },
                    { emoji: "⭐", label: "Valoración", count: "4.9" },
                    { emoji: "🚀", label: "Reservas", count: "3.2K/mes" },
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/70 transition-all hover:scale-105 cursor-default shadow-sm"
                    >
                      <div className="text-4xl mb-2">{item.emoji}</div>
                      <p className="text-2xl font-bold text-gray-800">{item.count}</p>
                      <p className="text-sm text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Mensaje flotante */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl px-6 py-3 shadow-xl border border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">¡Nuevos libros!</p>
                      <p className="text-xs text-gray-500">+150 esta semana</p>
                    </div>
                  </div>
                </div>

                {/* Círculo flotante */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}