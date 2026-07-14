// components/UserStatusToggle.tsx
"use client";

import { useState } from "react";
import { UserCheck, UserX, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface UserStatusToggleProps {
  userId: string;
  userName: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

export function UserStatusToggle({ 
  userId, 
  userName, 
  currentStatus, 
  onStatusChange 
}: UserStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isActive = currentStatus === "active";

  const handleToggle = async () => {
    const newStatus = isActive ? "suspended" : "active";
    const action = isActive ? "desactivar" : "activar";
    
    if (!confirm(`¿Estás seguro de ${action} al usuario "${userName}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `Error al ${action} el usuario`);
      }

      setSuccess(`Usuario ${action}do exitosamente`);

      if (onStatusChange) {
        onStatusChange();
      }

      // Recargar después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al cambiar el estado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block group">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
          isActive
            ? "text-green-600 hover:bg-green-50 hover:text-green-700"
            : "text-red-600 hover:bg-red-50 hover:text-red-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isActive ? "Desactivar usuario" : "Activar usuario"}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
        ) : isActive ? (
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </button>

      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isActive ? "Desactivar" : "Activar"}
      </span>

      {error && (
        <div className="absolute top-full mt-1 left-0 right-0 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-1 z-10 min-w-[200px]">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="absolute top-full mt-1 left-0 right-0 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-1 z-10 min-w-[200px]">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}