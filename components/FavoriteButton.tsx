// components/FavoriteButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";

interface FavoriteButtonProps {
  bookId: string;
  className?: string;
}

export function FavoriteButton({ bookId, className = "" }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      checkFavorite();
    } else {
      setChecking(false);
    }
  }, [status, bookId]);

  const checkFavorite = async () => {
    try {
      const response = await fetch(`/api/cliente/favoritos/check?bookId=${bookId}`);
      if (!response.ok) throw new Error("Error al verificar favorito");
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite:", error);
    } finally {
      setChecking(false);
    }
  };

  const toggleFavorite = async () => {
    if (status === "unauthenticated") {
      // Redirigir a login
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const response = await fetch(`/api/cliente/favoritos?bookId=${bookId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Error al eliminar de favoritos");
        setIsFavorite(false);
      } else {
        // Agregar a favoritos
        const response = await fetch("/api/cliente/favoritos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        });
        if (!response.ok) throw new Error("Error al agregar a favoritos");
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error al actualizar favoritos");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <button
        disabled
        className={`p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${
        isFavorite
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
      )}
    </button>
  );
}