// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, Users, Library } from "lucide-react";
import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const [roleParam, setRoleParam] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const role = searchParams.get("role");
    if (role === "admin") {
      setSelectedRole("admin");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // Obtener el rol del usuario desde la sesión
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      const userRole = session?.user?.role || "user";

      // Verificar que el rol coincida con el seleccionado
      if (selectedRole === "admin" && userRole !== "admin") {
        setError("No tienes permisos de administrador");
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        setLoading(false);
        return;
      }

      // Redirigir según el rol del usuario
      if (userRole === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/cliente/dashboard");
      }
      router.refresh();
    } catch (error) {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-44 sm:w-48 md:w-48 lg:w-64 h-12 sm:h-18 md:h-20">
            <Image
              src="/title3.png"
              alt="Biblioteca+"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">Bienvenido</h1>

          <p className="text-gray-500 text-sm mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Selector de rol */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "user"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <Users className={`w-6 h-6 mx-auto mb-1 ${selectedRole === "user" ? "text-blue-500" : "text-gray-400"
              }`} />
            <p className={`text-sm font-medium ${selectedRole === "user" ? "text-blue-600" : "text-gray-600"
              }`}>
              Cliente
            </p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`p-4 rounded-xl border-2 transition-all ${selectedRole === "admin"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <Library className={`w-6 h-6 mx-auto mb-1 ${selectedRole === "admin" ? "text-purple-500" : "text-gray-400"
              }`} />
            <p className={`text-sm font-medium ${selectedRole === "admin" ? "text-purple-600" : "text-gray-600"
              }`}>
              Biblioteca
            </p>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@biblioteca.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Iniciar Sesión como {selectedRole === "admin" ? "Biblioteca" : "Cliente"}</span>
            )}
          </button>


        </form>

        {/* Datos de prueba */}

      </div>
    </div>
  );
}