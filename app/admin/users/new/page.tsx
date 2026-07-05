// app/admin/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, X, User, Mail, Phone,
  Shield, Lock, Loader2, CheckCircle, AlertCircle,
  CreditCard, Printer, Camera, Upload, Image as ImageIcon
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  identification: string;
  role: string;
  photo: string | null;
  createdAt: Date;
}

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    identification: "",
    role: "user",
  });

  // Validaciones individuales
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    identification: "",
  });

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      password: "",
      identification: "",
    };
    let isValid = true;

    if (!formData.name || formData.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Ingresa un email válido";
      isValid = false;
    }

    if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    if (!formData.identification || formData.identification.length < 3) {
      errors.identification = "Ingresa un número de identificación válido (mínimo 3 caracteres)";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "user-photo");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir la foto");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading photo:", error);
      setError(error instanceof Error ? error.message : "Error al subir la foto");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona una imagen válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setPhotoFile(file);
    setError("");
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Crear el usuario
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo crear el usuario");
        setLoading(false);
        return;
      }

      let userData = data.user;

      // 2. Si hay foto, subirla a Cloudinary
      if (photoFile && userData) {
        const photoUrl = await handlePhotoUpload(photoFile);
        
        if (photoUrl) {
          // 3. Actualizar el usuario con la URL de la foto
          const updateRes = await fetch(`/api/users/${userData.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              identification: userData.identification,
              role: userData.role,
              photo: photoUrl,
            }),
          });
          
          if (updateRes.ok) {
            const updatedUser = await updateRes.json();
            userData = updatedUser.user;
          }
        }
      }

      setCreatedUser(userData);
      setShowSuccessModal(true);
      setSuccess(true);
      
    } catch (error) {
      console.error("Error:", error);
      setError("Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error del campo cuando el usuario escribe
    if (e.target.name in validationErrors) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    router.push("/admin/users");
    router.refresh();
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setSuccess(false);
    setCreatedUser(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      identification: "",
      role: "user",
    });
    setValidationErrors({
      name: "",
      email: "",
      password: "",
      identification: "",
    });
    setError("");
  };

  const handlePrintCarnet = () => {
    if (createdUser) {
      // Abrir en nueva ventana para imprimir
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Carnet - ${createdUser.name}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: #f3f4f6;
                  font-family: Arial, sans-serif;
                }
                .carnet {
                  width: 85.5mm;
                  height: 54mm;
                  background: white;
                  border-radius: 4px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  padding: 4mm;
                  border: 2px solid #1a1a2e;
                }
                .card-content {
                  display: flex;
                  height: 100%;
                  gap: 6px;
                }
                .left-section {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding-right: 6px;
                }
                .photo {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: #e5e7eb;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                  margin-bottom: 4px;
                }
                .photo-img {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 2px solid #4f46e5;
                  margin-bottom: 4px;
                }
                .left-text {
                  font-size: 5px;
                  text-align: center;
                  color: #1a1a2e;
                }
                .right-section {
                  flex: 2;
                  padding-left: 6px;
                  border-left: 1px solid #e5e7eb;
                }
                .header {
                  font-size: 8px;
                  font-weight: bold;
                  color: #1a1a2e;
                  margin-bottom: 2px;
                }
                .label {
                  font-size: 5px;
                  color: #6b7280;
                  margin-top: 1px;
                }
                .value {
                  font-size: 7px;
                  font-weight: 600;
                  color: #1a1a2e;
                }
                .barcode-container {
                  margin-top: 2px;
                  text-align: center;
                }
                .barcode {
                  font-family: 'Courier New', monospace;
                  font-size: 10px;
                  letter-spacing: 2px;
                  background: #f9fafb;
                  padding: 4px;
                  border-radius: 4px;
                  display: inline-block;
                  border: 1px solid #e5e7eb;
                }
                .footer {
                  font-size: 4px;
                  color: #9ca3af;
                  text-align: center;
                  margin-top: 2px;
                }
                .role-badge {
                  font-size: 5px;
                  font-weight: bold;
                  color: white;
                  background: #4f46e5;
                  padding: 2px 8px;
                  border-radius: 2px;
                  margin-top: 2px;
                }
                .info-row {
                  display: flex;
                  gap: 4px;
                  margin-top: 1px;
                }
                .info-col {
                  flex: 1;
                }
                @media print {
                  body {
                    padding: 0;
                    background: white;
                  }
                  .carnet {
                    box-shadow: none;
                    margin: 0;
                  }
                }
              </style>
            </head>
            <body>
              <div class="carnet">
                <div class="card-content">
                  <div class="left-section">
                    ${createdUser.photo ? `
                      <img src="${createdUser.photo}" class="photo-img" alt="Foto" />
                    ` : `
                      <div class="photo">📚</div>
                    `}
                    <div class="left-text" style="font-weight:bold;font-size:5px;">
                      ${createdUser.name.split(' ')[0]}
                    </div>
                    <div class="role-badge">
                      ${createdUser.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                    </div>
                  </div>
                  <div class="right-section">
                    <div class="header">📚 Biblioteca+</div>
                    <div>
                      <div class="label">NOMBRE COMPLETO</div>
                      <div class="value">${createdUser.name}</div>
                    </div>
                    <div>
                      <div class="label">IDENTIFICACIÓN</div>
                      <div class="value">${createdUser.identification}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-col">
                        <div class="label">EMAIL</div>
                        <div class="value" style="font-size:5px;">${createdUser.email}</div>
                      </div>
                      <div class="info-col">
                        <div class="label">TELÉFONO</div>
                        <div class="value" style="font-size:5px;">${createdUser.phone || 'N/A'}</div>
                      </div>
                    </div>
                    <div class="barcode-container">
                      <div class="barcode">*${createdUser.identification}*</div>
                    </div>
                    <div class="footer">
                      Válido desde ${new Date(createdUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">👤 Nuevo Usuario</h1>
              <p className="text-indigo-100">
                Registra un nuevo usuario en la biblioteca
              </p>
            </div>
            <Link
              href="/admin/users"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </Link>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensajes de error y éxito */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && !showSuccessModal && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>¡Usuario creado exitosamente!</span>
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2 text-indigo-500" />
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
              />
              {validationErrors.name && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Foto de Perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="inline w-4 h-4 mr-2 text-indigo-500" />
                Foto de Perfil <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Preview */}
                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 bg-gray-50">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Sin foto</span>
                    </div>
                  </div>
                )}

                {/* Botón de carga */}
                <div className="flex-1">
                  <label className="cursor-pointer inline-block">
                    <div className={`px-4 py-2 rounded-xl font-medium text-sm transition flex items-center gap-2
                      ${uploading 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }
                    `}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : photoPreview ? (
                        <>
                          <Upload className="w-4 h-4" />
                          Cambiar foto
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Seleccionar foto
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    JPG, PNG o WebP • Máximo 5MB
                  </p>
                  {uploading && (
                    <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Subiendo a Cloudinary...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-2 text-indigo-500" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: juan@email.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Número de Identificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline w-4 h-4 mr-2 text-indigo-500" />
                Número de Identificación *
              </label>
              <input
                type="text"
                name="identification"
                required
                value={formData.identification}
                onChange={handleChange}
                placeholder="Ej: 1234567890"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.identification ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
              />
              {validationErrors.identification && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.identification}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                El número de identificación debe ser único para cada usuario
              </p>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-2 text-indigo-500" />
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                La contraseña debe tener al menos 6 caracteres
              </p>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-2 text-indigo-500" />
                Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: 123456789"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline w-4 h-4 mr-2 text-indigo-500" />
                Rol *
              </label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              >
                <option value="user">Usuario Regular</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
              <h4 className="font-semibold text-gray-700 mb-2">📋 Resumen</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Nombre:</span> {formData.name || "Pendiente"}</p>
                <p><span className="font-medium">Email:</span> {formData.email || "Pendiente"}</p>
                <p><span className="font-medium">Identificación:</span> {formData.identification || "Pendiente"}</p>
                <p><span className="font-medium">Rol:</span> {
                  formData.role === "admin" ? "Administrador" : "Usuario Regular"
                }</p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-gray-100">
              <Link
                href="/admin/users"
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </Link>
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span className="font-semibold">Crear Usuario</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && createdUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">¡Usuario Creado!</h2>
              <p className="text-gray-500 text-sm mt-1">
                {createdUser.name} ha sido registrado exitosamente
              </p>
            </div>

            {/* Información rápida del usuario */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre:</span>
                  <span className="font-medium text-gray-800">{createdUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-800">{createdUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Identificación:</span>
                  <span className="font-medium text-gray-800">{createdUser.identification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rol:</span>
                  <span className={`font-medium ${createdUser.role === "admin" ? "text-purple-600" : "text-blue-600"
                    }`}>
                    {createdUser.role === "admin" ? "Administrador" : "Usuario Regular"}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones del modal */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrintCarnet}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Carnet</span>
              </button>
              <button
                onClick={handleCreateAnother}
                className="flex-1 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Crear Otro</span>
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}