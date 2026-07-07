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

  const uploadUserPhoto = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "user-photo");
      formData.append("userId", userId);

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

      if (photoFile && userData) {
        const photoUrl = await uploadUserPhoto(photoFile, userData.id);
        
        if (photoUrl) {
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

  // Función para generar el código de barras en formato Code128
  const generateBarcodeSVG = (text: string) => {
    // Esta es una implementación simplificada para Code128
    // En producción recomendaría usar una librería como JsBarcode
    const chars = text.split('');
    const width = chars.length * 12 + 20;
    const height = 40;
    
    let bars = '';
    let x = 10;
    
    // Patrón simple para simular código de barras
    chars.forEach((char, index) => {
      const code = char.charCodeAt(0);
      const pattern = [];
      
      // Generar un patrón de barras basado en el carácter
      for (let i = 0; i < 6; i++) {
        const bit = (code >> i) & 1;
        pattern.push(bit);
      }
      
      // Agregar barras
      pattern.forEach((bit) => {
        if (bit) {
          bars += `<rect x="${x}" y="0" width="3" height="${height}" fill="black"/>`;
        }
        x += 3;
      });
      
      // Espacio entre caracteres
      x += 2;
    });
    
    return `
      <svg width="${width}" height="${height + 20}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height + 20}" fill="white"/>
        ${bars}
        <text x="${width/2}" y="${height + 15}" text-anchor="middle" font-family="monospace" font-size="10" fill="black">${text}</text>
      </svg>
    `;
  };

  const handlePrintCarnet = () => {
    if (createdUser) {
      // URL base de Vercel
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'Genrado por Biblioteca+';
      
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        const barcodeSvg = generateBarcodeSVG(createdUser.identification);
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Carnet - ${createdUser.name}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: #f0f0f0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .carnet-container {
                  width: 340px;
                  background: white;
                  border-radius: 16px;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                  overflow: hidden;
                  border: 2px solid #1a1a2e;
                }
                .carnet-header {
                  background: linear-gradient(135deg, #1a1a2e, #16213e);
                  padding: 16px 20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 3px solid #e94560;
                }
                .carnet-header .logo {
                  color: white;
                  font-size: 18px;
                  font-weight: 700;
                  letter-spacing: 1px;
                }
                .carnet-header .logo span {
                  color: #e94560;
                }
                .carnet-header .badge {
                  background: #e94560;
                  color: white;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 10px;
                  font-weight: 600;
                  letter-spacing: 0.5px;
                }
                .carnet-body {
                  padding: 20px;
                  background: white;
                }
                .carnet-body .main-info {
                  display: flex;
                  gap: 16px;
                  align-items: center;
                  margin-bottom: 16px;
                }
                .photo-container {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  overflow: hidden;
                  border: 3px solid #1a1a2e;
                  flex-shrink: 0;
                  background: #f5f5f5;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .photo-container img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
                .photo-container .placeholder {
                  font-size: 32px;
                  color: #ccc;
                }
                .user-info {
                  flex: 1;
                }
                .user-info .name {
                  font-size: 16px;
                  font-weight: 700;
                  color: #1a1a2e;
                  margin-bottom: 2px;
                }
                .user-info .role {
                  font-size: 11px;
                  font-weight: 600;
                  color: #e94560;
                  background: #fef2f2;
                  padding: 2px 10px;
                  border-radius: 12px;
                  display: inline-block;
                  margin-bottom: 4px;
                }
                .user-info .id-number {
                  font-size: 12px;
                  color: #666;
                  font-weight: 500;
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  margin-top: 12px;
                  padding-top: 12px;
                  border-top: 1px solid #eee;
                }
                .detail-item {
                  display: flex;
                  flex-direction: column;
                }
                .detail-item .label {
                  font-size: 9px;
                  color: #999;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  font-weight: 600;
                }
                .detail-item .value {
                  font-size: 12px;
                  color: #1a1a2e;
                  font-weight: 500;
                  word-break: break-all;
                }
                .barcode-section {
                  margin-top: 12px;
                  padding-top: 12px;
                  border-top: 1px solid #eee;
                  text-align: center;
                }
                .barcode-section svg {
                  max-width: 100%;
                  height: auto;
                }
                .carnet-footer {
                  background: #f8f9fa;
                  padding: 10px 20px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-top: 1px solid #eee;
                }
                .carnet-footer .validity {
                  font-size: 9px;
                  color: #999;
                }
                .carnet-footer .validity strong {
                  color: #1a1a2e;
                }
                .carnet-footer .website {
                  font-size: 9px;
                  color: #1a1a2e;
                  font-weight: 600;
                }
                .carnet-footer .website a {
                  color: #e94560;
                  text-decoration: none;
                }
                @media print {
                  body {
                    background: white;
                    padding: 0;
                  }
                  .carnet-container {
                    box-shadow: none;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                  }
                }
                @media print {
                  body { padding: 0; }
                  .carnet-container { box-shadow: none; }
                }
              </style>
            </head>
            <body>
              <div class="carnet-container">
                <div class="carnet-header">
                  <div class="logo">📚 <span>Biblioteca</span>+</div>
                  <div class="badge">${createdUser.role === 'admin' ? 'ADMIN' : 'USUARIO'}</div>
                </div>
                <div class="carnet-body">
                  <div class="main-info">
                    <div class="photo-container">
                      ${createdUser.photo ? `
                        <img src="${createdUser.photo}" alt="Foto de perfil" />
                      ` : `
                        <div class="placeholder">👤</div>
                      `}
                    </div>
                    <div class="user-info">
                      <div class="name">${createdUser.name}</div>
                      <div class="role">${createdUser.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
                      <div class="id-number">ID: ${createdUser.identification}</div>
                    </div>
                  </div>
                  <div class="details-grid">
                    <div class="detail-item">
                      <span class="label">Email</span>
                      <span class="value">${createdUser.email}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Teléfono</span>
                      <span class="value">${createdUser.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div class="barcode-section">
                    ${barcodeSvg}
                  </div>
                </div>
                <div class="carnet-footer">
                  <div class="validity">
                    Válido desde <strong>${new Date(createdUser.createdAt).toLocaleDateString('es-ES')}</strong>
                  </div>
                  <div class="website">
                    <a href="${baseUrl}" target="_blank">${baseUrl.replace('https://', '')}</a>
                  </div>
                </div>
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                  window.onafterprint = function() {
                    window.close();
                  };
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`}
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
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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

                <div className="flex-1">
                  <label className="cursor-pointer inline-block">
                    <div className="px-4 py-2 rounded-xl font-medium text-sm transition flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                      <Upload className="w-4 h-4" />
                      {photoPreview ? "Cambiar foto" : "Seleccionar foto"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.email ? "border-red-300 bg-red-50" : "border-gray-200"}`}
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.identification ? "border-red-300 bg-red-50" : "border-gray-200"}`}
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white ${validationErrors.password ? "border-red-300 bg-red-50" : "border-gray-200"}`}
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
                disabled={loading}
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
                  <span className={`font-medium ${createdUser.role === "admin" ? "text-purple-600" : "text-blue-600"}`}>
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