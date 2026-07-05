// app/admin/books/new/page.tsx 


"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhotoUpload from "@/components/PhotoUpload";
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
} from "lucide-react";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "copiesCount" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? Number(formData.year) : null,
          copiesCount: Number(formData.copiesCount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear el libro");
      }

      if (photoFile && data.id) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photoFile);
        uploadFormData.append("type", "cover");
        uploadFormData.append("bookId", data.id);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          console.warn("Cover upload failed:", uploadData);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/books");
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
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5" />
                <span>Libro creado correctamente. Redirigiendo...</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Título *</label>
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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Autor *</label>
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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">ISBN</label>
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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Editorial</label>
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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Año</label>
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

              <div className="space-y-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Portada</label>
                <PhotoUpload onPhotoChange={handlePhotoChange} className="justify-start" />
              </div>

              <div className="space-y-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="space-y-3 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Cantidad de ejemplares *</label>
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
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin/books"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                disabled={saving}
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
