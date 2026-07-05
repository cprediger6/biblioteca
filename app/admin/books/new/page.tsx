// app/admin/books/new/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  Hash,
  Building2,
  Calendar,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

const initialFormState = {
  title: "",
  author: "",
  isbn: "",
  publisher: "",
  year: "",
  description: "",
  copiesCount: 1,
};

export default function NewBookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "copiesCount" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      // Mostrar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Si ya tenemos el bookId, subir inmediatamente
      if (bookId) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "cover");
        formData.append("bookId", bookId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al subir la imagen");
        }

        const data = await response.json();
        setCoverImage(data.url);
      } else {
        // Guardar el archivo para subir después de crear el libro
        setCoverFile(file);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error instanceof Error ? error.message : "Error al subir la imagen");
      setCoverImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    await handleImageUpload(file);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 1. Crear el libro
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? Number(formData.year) : null,
          copiesCount: Number(formData.copiesCount),
          coverImage: coverImage || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear el libro");
      }

      setBookId(data.id);

      // 2. Si hay una imagen pendiente, subirla
      if (coverFile && data.id) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", coverFile);
        uploadFormData.append("type", "cover");
        uploadFormData.append("bookId", data.id);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          console.warn("Cover upload failed:", uploadData);
        } else {
          const uploadData = await uploadRes.json();
          // Actualizar el libro con la URL de la imagen
          await fetch(`/api/books/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coverImage: uploadData.url }),
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/books");
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Error al crear el libro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">📚 Nuevo Libro</h1>
                <p className="mt-2 text-sm text-indigo-100">
                  Registra un nuevo título en la biblioteca.
                </p>
              </div>
              <Link
                href="/admin/books"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a libros
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Alertas */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Libro creado correctamente. Redirigiendo...</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Título */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Título *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Autor */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Autor *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* ISBN */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  ISBN
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Editorial */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Editorial
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Año */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Año
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min={0}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Ejemplares */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Cantidad de ejemplares *
                </label>
                <input
                  type="number"
                  name="copiesCount"
                  value={formData.copiesCount}
                  onChange={handleChange}
                  min={1}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Portada */}
              <div className="space-y-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Portada
                </label>
                
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Preview */}
                  {coverImage ? (
                    <div className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={coverImage}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-50">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Sin imagen</span>
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
                        ) : coverImage ? (
                          <>
                            <Upload className="w-4 h-4" />
                            Cambiar imagen
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Seleccionar imagen
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
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
                        Subiendo imagen a Cloudinary...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Describe el contenido del libro..."
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
              <Link
                href="/admin/books"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear libro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}