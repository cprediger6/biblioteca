
// app/api/books/[id]/labels/LabelsWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Definir tipos
type CopySerialized = {
  id: string;
  code: string;
  status: string;
  location: string | null;
  bookId: string;
  createdAt: string;
  updatedAt: string;
};

type BookSerialized = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  createdAt: string;
  updatedAt: string;
  copies: CopySerialized[];
};

// Cargar el componente cliente de forma dinámica
const LabelsClient = dynamic(
  () => import("./LabelsClient"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando etiquetas...</p>
        </div>
      </div>
    )
  }
);

interface LabelsWrapperProps {
  book: BookSerialized;
}

export default function LabelsWrapper({ book }: LabelsWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    }>
      <LabelsClient book={book} />
    </Suspense>
  );
}