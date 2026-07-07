// components/CopySelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

interface CopyType {
  id: string;
  code: string;
  status: string;
  book: {
    id: string;
    title: string;
    author: string;
  };
}

interface CopySelectorProps {
  onSelect: (copy: CopyType | null) => void;
  selectedCopy: CopyType | null;
  placeholder?: string;
  excludeStatus?: string[];
}

export function CopySelector({
  onSelect,
  selectedCopy,
  placeholder = "Buscar ejemplar...",
  excludeStatus = ['reserved', 'loaned', 'overdue'] // Excluye reservados por defecto
}: CopySelectorProps) {
  const [search, setSearch] = useState("");
  const [copies, setCopies] = useState<CopyType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length > 2) {
      searchCopies();
    } else {
      setCopies([]);
    }
  }, [search]);

  const searchCopies = async () => {
    setLoading(true);
    try {
      // Construir URL con filtros
      let url = `/api/copies?search=${encodeURIComponent(search)}`;

      // Excluir estados no deseados (reservados, prestados, etc)
      if (excludeStatus.length > 0) {
        url += `&exclude=${excludeStatus.join(',')}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al buscar ejemplares");
      const data = await res.json();
      setCopies(data.copies || []);
      setShowResults(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (selectedCopy) onSelect(null);
          }}
          onFocus={() => search.length > 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {selectedCopy && (
        <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="font-semibold text-gray-800">{selectedCopy.book.title}</p>
          <p className="text-sm text-gray-600">Autor: {selectedCopy.book.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-indigo-600">Código: {selectedCopy.code}</span>
            <StatusBadge status={selectedCopy.status as any} size="sm" />
          </div>
        </div>
      )}

      {showResults && copies.length > 0 && !selectedCopy && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {copies.map((copy) => (
            <button
              key={copy.id}
              type="button"
              onClick={() => {
                onSelect(copy);
                setSearch(copy.book.title);
                setShowResults(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{copy.book.title}</p>
                  <p className="text-xs text-gray-500">{copy.book.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">{copy.code}</span>
                  <StatusBadge status={copy.status as any} size="sm" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && copies.length === 0 && search.length > 2 && !selectedCopy && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No se encontraron ejemplares disponibles</p>
          <p className="text-xs text-gray-400">Todos los ejemplares están reservados o prestados</p>
        </div>
      )}
    </div>
  );
}