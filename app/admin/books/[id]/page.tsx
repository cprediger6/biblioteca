// app/admin/books/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, BookOpen, User, Hash,
    Building2, Calendar, FileText, Edit,
    Trash2, Copy, CheckCircle, XCircle,
    Loader2, Printer, Plus
} from "lucide-react";

type BookDetail = {
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
    copies: {
        id: string;
        code: string;
        status: string;
        location: string | null;
    }[];
};

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;

    const [book, setBook] = useState<BookDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBook();
    }, [bookId]);

    const fetchBook = async () => {
        try {
            const res = await fetch(`/api/books/${bookId}`);
            if (!res.ok) throw new Error("Error al cargar el libro");
            const data = await res.json();
            setBook(data);
        } catch (error) {
            setError("Error al cargar el libro");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar este libro?")) return;

        try {
            const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar");
            router.push("/admin/books");
            router.refresh();
        } catch (error) {
            alert("Error al eliminar el libro");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Disponible</span>;
            case "loaned":
                return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Prestado</span>;
            case "damaged":
                return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Dañado</span>;
            case "lost":
                return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Perdido</span>;
            default:
                return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando libro...</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-gray-600">{error || "Libro no encontrado"}</p>
                    <Link href="/admin/books" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Volver al listado
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">📖 {book.title}</h1>
                            <p className="text-indigo-100 text-sm sm:text-base">
                                Detalles del libro
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={`/admin/books/${book.id}/edit`}
                                className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Editar</span>
                            </Link>
                            <Link
                                href="/admin/books"
                                className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Volver</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Columna izquierda - Imagenes */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Portada</h3>
                            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                                {book.coverImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">
                                        📖
                                    </div>
                                )}
                            </div>
                        </div>

                        {book.backImage && (
                            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                                <h3 className="font-semibold text-gray-700 mb-3">Dorso</h3>
                                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={book.backImage}
                                        alt={`Dorso de ${book.title}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna derecha - Información */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Información principal */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Título</p>
                                    <p className="font-semibold text-gray-800">{book.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Autor</p>
                                    <p className="font-semibold text-gray-800">{book.author}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">ISBN</p>
                                    <p className="font-semibold text-gray-800">{book.isbn || "No disponible"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Editorial</p>
                                    <p className="font-semibold text-gray-800">{book.publisher || "No disponible"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Año de publicación</p>
                                    <p className="font-semibold text-gray-800">{book.year || "No disponible"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total de ejemplares</p>
                                    <p className="font-semibold text-gray-800">{book.copies.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        {book.description && (
                            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    Descripción
                                </h3>
                                <p className="text-gray-600 text-sm">{book.description}</p>
                            </div>
                        )}

                        {/* Ejemplares */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <Copy className="w-4 h-4 text-indigo-500" />
                                    Ejemplares
                                </h3>
                                <button
                                    onClick={() => router.push(`/admin/books/${book.id}/add-copies`)}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar ejemplares
                                </button>
                            </div>

                            {book.copies.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No hay ejemplares disponibles</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {book.copies.map((copy) => (
                                        <div key={copy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-gray-800">{copy.code}</p>
                                                {copy.location && (
                                                    <p className="text-xs text-gray-500">{copy.location}</p>
                                                )}
                                            </div>
                                            {getStatusBadge(copy.status)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar Libro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}