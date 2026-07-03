// app/api/books/[id]/labels/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LabelsWrapper from "./LabelsWrapper";

// Definir tipos
type Copy = {
  id: string;
  code: string;
  status: string;
  location: string | null;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CopySerialized = {
  id: string;
  code: string;
  status: string;
  location: string | null;
  bookId: string;
  createdAt: string;
  updatedAt: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverImage: string | null;
  backImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  copies: Copy[];
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

interface LabelsPageProps {
  params: {
    id: string;
  };
}

export default async function LabelsPage({ params }: LabelsPageProps) {
  const book: Book | null = await prisma.book.findUnique({
    where: { id: params.id },
    include: {
      copies: {
        select: {
          id: true,
          code: true,
          status: true,
          location: true,
          bookId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Serializar fechas para el cliente
  const serializedBook: BookSerialized = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    copies: book.copies.map((copy: Copy) => ({
      ...copy,
      createdAt: copy.createdAt.toISOString(),
      updatedAt: copy.updatedAt.toISOString(),
    })),
  };

  return <LabelsWrapper book={serializedBook} />;
}