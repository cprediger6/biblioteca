// app/admin/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  CreditCard,
  Lock,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Users,
  Settings,
  Bell,
  FileText,
  Printer,
  Building2,
} from "lucide-react";

type UserData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  identification: string;
  photo: string | null;
  role: string;
  createdAt: string;
  // Datos adicionales para admin
  isActive?: boolean;
  lastLogin?: string;
  totalLoans?: number;
  totalFines?: number;
};

export default function AdminProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    pendingReturns: 0,
  });

  // Estado para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Estado para foto de perfil
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Verificar que sea admin
      if (session?.user?.role !== "admin") {
        router.push("/cliente/dashboard");
        return;
      }
      fetchUserData();
      fetchAdminStats();
    }
  }, [status, router, session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/profile");
      if (!response.ok) throw new Error("Error al cargar el perfil");
      const data = await response.json();
      setUserData(data.user);
      if (data.user.photo) {
        setPhotoPreview(data.user.photo);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Error al cargar estadísticas");
      const data = await response.json();
      setAdminStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona una imagen válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setPhotoFile(file);
    setError("");
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;

    const userId = session?.user?.id || userData?.id;
    
    if (!userId) {
      setError("No se pudo obtener el ID del usuario");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("type", "user-photo");
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const textResponse = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("Error al parsear respuesta:", textResponse);
        throw new Error("Error en el servidor al procesar la imagen");
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Error al subir la foto");
      }

      await update({
        ...session,
        user: {
          ...session?.user,
          photo: responseData.url,
        },
      });

      setSuccess("Foto de perfil actualizada exitosamente");
      await fetchUserData();
      
      setPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al subir la foto");
      setPhotoPreview(userData?.photo || null);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!passwordData.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida";
      isValid = false;
    }

    if (passwordData.newPassword.length < 6) {
      errors.newPassword = "La nueva contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setPasswordErrors(errors);

    if (!isValid) return;

    setPasswordLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar la contraseña");
      }

      setSuccess("Contraseña actualizada exitosamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al cambiar la contraseña");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Perfil Administrador
              </h1>
              <p className="text-indigo-100 text-sm mt-1">
                Gestiona tu información y estadísticas del sistema
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/dashboard"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
              >
                <ArrowLeft size={18} />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2 text-sm"
              >
                <Users size={18} />
                Usuarios
              </Link>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Columna izquierda - Foto y datos básicos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Foto de perfil */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <User className="w-16 h-16 text-indigo-300" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>

                {photoFile && (
                  <button
                    onClick={uploadPhoto}
                    disabled={uploading}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar foto
                      </>
                    )}
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG o WebP • Máximo 5MB
                </p>

                <div className="mt-4 w-full pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Rol:</span>
                    <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      Administrador
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info rápida */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Información personal</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Nombre</p>
                    <p className="font-medium text-gray-800">{userData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-800">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Identificación</p>
                    <p className="font-medium text-gray-800">{userData.identification}</p>
                  </div>
                </div>
                {userData.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Teléfono</p>
                      <p className="font-medium text-gray-800">{userData.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Miembro desde</p>
                    <p className="font-medium text-gray-800">
                      {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-4">Acciones rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users/new"
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition flex items-center gap-2 text-sm"
                >
                  <User className="w-4 h-4" />
                  Crear nuevo usuario
                </Link>
                <Link
                  href="/admin/books/new"
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Agregar libro
                </Link>
                <Link
                  href="/admin/reports"
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Ver reportes
                </Link>
              </div>
            </div>
          </div>

          {/* Columna derecha - Estadísticas y cambio de contraseña */}
          <div className="lg:col-span-3 space-y-6">
            {/* Estadísticas del sistema */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-800">Estadísticas del Sistema</h2>
              </div>

              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">{adminStats.totalUsers}</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">Usuarios totales</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-700">{adminStats.totalBooks}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">Libros totales</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-700">{adminStats.activeLoans}</span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">Préstamos activos</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-2xl font-bold text-red-700">{adminStats.pendingReturns}</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">Devoluciones pendientes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cambiar contraseña */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h2>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Contraseña actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value });
                        setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                      }}
                      className={`w-full px-4 py-2 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                        passwordErrors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                        setPasswordErrors({ ...passwordErrors, newPassword: "" });
                      }}
                      className={`w-full px-4 py-2 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                        passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                        setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                      }}
                      className={`w-full px-4 py-2 pr-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                        passwordErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Repite la nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-400 text-center flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Contraseña encriptada
                  </span>
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Cambia tu contraseña regularmente
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}