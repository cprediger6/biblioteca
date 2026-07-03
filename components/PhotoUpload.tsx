// components/PhotoUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  onPhotoChange: (file: File | null, preview: string | null) => void;
  currentPhoto?: string | null;
  className?: string;
}

export default function PhotoUpload({ 
  onPhotoChange, 
  currentPhoto = null,
  className = ""
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no puede superar los 2MB");
      return;
    }

    // Validar formato
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WebP");
      return;
    }

    setError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      onPhotoChange(file, dataUrl);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("Error al leer la imagen");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        {/* Contenedor de la foto */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 hover:border-indigo-500 transition-colors">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              📚
            </div>
          )}
        </div>

        {/* Botón de remover foto */}
        {preview && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Botón de subir foto */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}
      <p className="text-xs text-gray-500 mt-1 text-center">
        Sube una foto (JPG, PNG, hasta 2MB)
      </p>
    </div>
  );
}