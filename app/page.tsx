"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, Users, LogIn, UserPlus, 
  Sparkles, ArrowRight, CheckCircle, Star, 
  TrendingUp, Clock, Award, Shield, 
  CreditCard, Headphones, ChevronRight,
  Menu, X, Search, Crown,
  Smartphone,
  Library  // Importado correctamente
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [hoveredBook, setHoveredBook] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Beneficios principales
  const heroFeatures = [
    { icon: <Sparkles className="w-5 h-5 text-yellow-400" />, text: "Miles de libros" },
    { icon: <Star className="w-5 h-5 text-yellow-400" />, text: "4.9/5 estrellas" },
    { icon: <Users className="w-5 h-5 text-blue-400" />, text: "12K+ usuarios" },
    { icon: <Clock className="w-5 h-5 text-green-400" />, text: "Reserva en 2 min" },
  ];

  // Libros destacados
  const featuredBooks = [
    {
      id: 1,
      title: "El Principito",
      author: "Antoine de Saint-Exupéry",
      category: "Clásicos",
      rating: 4.9,
      cover: "📖",
      available: true,
      year: 1943
    },
    {
      id: 2,
      title: "Cien Años de Soledad",
      author: "Gabriel García Márquez",
      category: "Literatura",
      rating: 4.8,
      cover: "📚",
      available: true,
      year: 1967
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      category: "Ciencia Ficción",
      rating: 4.7,
      cover: "📕",
      available: false,
      year: 1949
    },
    {
      id: 4,
      title: "Don Quijote",
      author: "Miguel de Cervantes",
      category: "Clásicos",
      rating: 4.6,
      cover: "📗",
      available: true,
      year: 1605
    },
    {
      id: 5,
      title: "El Alquimista",
      author: "Paulo Coelho",
      category: "Ficción",
      rating: 4.5,
      cover: "📘",
      available: true,
      year: 1988
    },
    {
      id: 6,
      title: "La Sombra del Viento",
      author: "Carlos Ruiz Zafón",
      category: "Misterio",
      rating: 4.8,
      cover: "📙",
      available: true,
      year: 2001
    }
  ];

  // Planes de membresía
  const membershipPlans = [
    {
      id: "basic",
      name: "Básico",
      price: "$9.99",
      period: "/mes",
      description: "Ideal para empezar",
      features: [
        "Acceso a 100 libros",
        "Reservas ilimitadas",
        "Soporte por email",
        "Cancelación flexible"
      ],
      popular: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "pro",
      name: "Premium",
      price: "$19.99",
      period: "/mes",
      description: "Para lectores ávidos",
      features: [
        "Acceso a 1000+ libros",
        "Reservas prioritarias",
        "Soporte 24/7",
        "Sin límite de préstamos",
        "Acceso a novedades"
      ],
      popular: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "family",
      name: "Familiar",
      price: "$29.99",
      period: "/mes",
      description: "Para toda la familia",
      features: [
        "4 cuentas incluidas",
        "Acceso ilimitado",
        "Perfiles separados",
        "Soporte familiar",
        "Eventos exclusivos"
      ],
      popular: false,
      color: "from-green-500 to-emerald-500"
    }
  ];

  // Testimonios
  const testimonials = [
    {
      name: "María G.",
      role: "Lectora Premium",
      text: "La mejor inversión que he hecho. Los libros llegan en perfecto estado.",
      rating: 5,
      avatar: "👩",
      location: "Buenos Aires"
    },
    {
      name: "Carlos R.",
      role: "Lector Pro",
      text: "Increíble catálogo. He descubierto autores que no conocía.",
      rating: 5,
      avatar: "👨",
      location: "Madrid"
    },
    {
      name: "Ana M.",
      role: "Lectora Familiar",
      text: "Mis hijos y yo disfrutamos mucho. La membresía familiar es perfecta.",
      rating: 5,
      avatar: "👩‍👧",
      location: "Ciudad de México"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Barra de navegación */}
<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
  scrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5" : "bg-black border-b border-white/5"
}`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      <div className="flex items-center space-x-8">
        {/* Logo con imagen */}
        <Link href="/" className="flex items-center space-x-2">
       
          <div className="relative w-60 h-14 sm:w-60 sm:h-15">
            <Image
              src="/title.png"
              alt="Biblioteca+"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center space-x-6">
          <Link href="#home" className="text-sm font-medium text-white hover:text-gray-300 transition-colors">
            Inicio
          </Link>
          <Link href="#books" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Libros
          </Link>
          <Link href="#plans" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Planes
          </Link>
          <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Características
          </Link>
        </div>
      </div>

            <div className="flex items-center space-x-4">
              <button className="hidden md:flex p-2 hover:bg-white/10 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-300" />
              </button>
              
              {session ? (
                <Link
                  href={session.user?.role === "admin" ? "/dashboard" : "/cliente/dashboard"}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-full hover:shadow-2xl transition-all text-sm font-medium"
                >
                  Mi Cuenta
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowLoginOptions(!showLoginOptions)}
                    className="flex items-center space-x-2 px-6 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition-all text-sm font-medium"
                  >
                    <span>Acceder</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${showLoginOptions ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showLoginOptions && (
                    <div className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                      <div className="p-2">
                        <Link
                          href="/login"
                          onClick={() => setShowLoginOptions(false)}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-white">Cliente</p>
                            <p className="text-xs text-gray-400">Reserva y disfruta de libros</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                        </Link>
                        <Link
                          href="/login?role=admin"
                          onClick={() => setShowLoginOptions(false)}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Library className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-white">Biblioteca</p>
                            <p className="text-xs text-gray-400">Administra tu biblioteca</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                        </Link>
                        <div className="border-t border-white/10 my-2"></div>
                        <Link
                          href="/register"
                          onClick={() => setShowLoginOptions(false)}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-white">Registrarse</p>
                            <p className="text-xs text-gray-400">Comienza tu prueba gratis</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-white transition-colors" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Diseño Premium */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
          <div className="absolute top-32 left-10 text-5xl opacity-5 animate-float">✦</div>
          <div className="absolute bottom-40 right-20 text-4xl opacity-5 animate-float-delayed">✦</div>
          <div className="absolute top-1/2 left-5 text-3xl opacity-5 animate-float">✦</div>
        </div>

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
                {!session ? (
                  <>
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
                  </>
                ) : (
                  <Link
                    href={session.user?.role === "admin" ? "/dashboard" : "/cliente/dashboard"}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-300/50 transition-all hover:scale-105 text-base gap-2"
                  >
                    Ir al Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Estadísticas */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">25K+</p>
                    <p className="text-xs text-gray-500">Libros</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">12K+</p>
                    <p className="text-xs text-gray-500">Usuarios</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">4.9★</p>
                    <p className="text-xs text-gray-500">Valoración</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
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
                <div className="absolute -inset-8 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-pink-100/30 rounded-full blur-2xl"></div>
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

                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Novedades */}
      <section id="books" className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                📚 Novedades y Recomendados
              </h2>
              <p className="text-gray-400 text-sm">Los libros que están marcando tendencia</p>
            </div>
            <Link href="/cliente/books/search" className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredBooks.map((book) => (
              <div 
                key={book.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredBook(book.id)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {book.cover}
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm">{book.title}</p>
                      <p className="text-xs text-gray-300">{book.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-400 text-xs">⭐ {book.rating}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          book.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {book.available ? 'Disponible' : 'Reservado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-white line-clamp-1">{book.title}</p>
                  <p className="text-xs text-gray-400">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Planes */}
      <section id="plans" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Elige tu plan de lectura
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Encuentra el plan perfecto para ti y comienza tu viaje literario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border transition-all hover:scale-105 hover:shadow-2xl ${
                  plan.popular 
                    ? 'border-purple-500/50 shadow-purple-500/20' 
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    {plan.id === "basic" && <BookOpen className="w-8 h-8 text-white" />}
                    {plan.id === "pro" && <Crown className="w-8 h-8 text-white" />}
                    {plan.id === "family" && <Users className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={session ? "/cliente/payments" : "/register"}
                  className={`mt-8 w-full py-3 rounded-full font-semibold transition-all text-center block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {session ? 'Suscribirse' : 'Comenzar'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para leer sin límites
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Una experiencia diseñada para los amantes de la lectura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Catálogo Gigante",
                description: "Accede a miles de libros de todos los géneros y autores.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Reserva Rápida",
                description: "Reserva en 2 minutos y recoge tu libro al instante.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "App Móvil",
                description: "Gestiona tus reservas desde tu smartphone.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Perfiles Familiares",
                description: "Crea perfiles para cada miembro de tu familia.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Recomendaciones",
                description: "Recibe sugerencias personalizadas basadas en tus gustos.",
                color: "from-yellow-500 to-yellow-600"
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "Soporte 24/7",
                description: "Asistencia en vivo para resolver cualquier duda.",
                color: "from-teal-500 to-teal-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Historias reales de personas que transformaron su experiencia de lectura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
                <p className="text-xs text-gray-500 mt-3">{testimonial.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ¿Listo para comenzar tu viaje?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Únete a miles de lectores que ya disfrutan de la mejor experiencia literaria
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-12 py-4 bg-white text-black rounded-2xl font-semibold hover:shadow-2xl transition-all hover:scale-105 text-lg gap-2"
          >
            Comenzar Ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-white/60 text-sm mt-4">
            🎁 7 días de prueba gratis. Sin compromiso.
          </p>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
<footer className="bg-black border-t border-white/5">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <Link href="/" className="flex items-center space-x-2 mb-4">
       
          <div className="relative w-28 h-7 sm:w-32 sm:h-8">
            <Image
              src="/title.png"
              alt="Biblioteca+"
              fill
              className="object-contain"
            />
          </div>
        </Link>
        <p className="text-gray-400 text-sm">
          La biblioteca digital que llevas contigo.
        </p>
      </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Explorar</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Libros</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Categorías</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Autores</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Ayuda</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Biblioteca+. Todos los derechos reservados.</p>
            <p className="mt-1">Hecho con ❤️ para amantes de la lectura</p>
          </div>
        </div>
      </footer>
    </div>
  );
}