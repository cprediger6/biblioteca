// components/cliente/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    LayoutDashboard,
    LibraryBig,
    Heart,
    Bookmark,
    History,
    CreditCard,
    UserCircle,
    Crown,
    LogOut,
    Loader2,
    Menu,
    X
} from "lucide-react";

// components/cliente/layout/Sidebar.tsx
const menu = [
    {
        icon: LayoutDashboard,
        label: "Inicio",
        href: "/cliente/dashboard"
    },
    {
        icon: LibraryBig,
        label: "Catálogo",
        href: "/cliente/catalogo"
    },
    {
        icon: Heart,
        label: "Favoritos",
        href: "/cliente/favoritos"
    },
    {
        icon: Bookmark,
        label: "Reservas",
        href: "/cliente/reservas"
    },
    {
        icon: History,
        label: "Historial",
        href: "/cliente/history"
    },
    {
        icon: CreditCard,
        label: "Pagos",
        href: "/cliente/payments"  // ✅ Ya existe
    },
    {
        icon: UserCircle,
        label: "Perfil",
        href: "/cliente/profile"
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ 
                redirect: false,
                callbackUrl: "/login"
            });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setIsLoggingOut(false);
        }
    };

    const userInitial = session?.user?.name 
        ? session.user.name.charAt(0).toUpperCase() 
        : "U";

    const SidebarContent = () => (
        <>
            <div className="h-20 flex items-center px-4 md:px-8 border-b border-gray-800">
                <div className="relative w-40 h-12">
                    <Image
    src="/title.png"
    alt="Biblioteca+"
    fill
    className="object-contain"
    priority
  />
                </div>
            </div>

            <div className="flex-1 p-3 md:p-5 overflow-y-auto">
                <p className="uppercase text-xs text-gray-500 mb-4 hidden md:block">
                    Navegación
                </p>
                <nav className="space-y-1 md:space-y-2">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 md:gap-4 rounded-xl px-3 md:px-4 py-2.5 md:py-3 transition-all duration-300 text-sm md:text-base
                                    ${
                                        active
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : "hover:bg-gray-800 text-gray-300"
                                    }
                                `}
                            >
                                <Icon size={18} className="md:w-5 md:h-5 flex-shrink-0" />
                                <span className="truncate">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-6 md:mt-10 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-4 md:p-5">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Crown size={16} className="md:w-[18px] md:h-[18px]" />
                            <h2 className="font-semibold text-sm md:text-base">
                                Premium
                            </h2>
                        </div>
                        <p className="text-xs md:text-sm text-indigo-100">
                            Reserva antes que todos.
                        </p>
                        <p className="text-xs md:text-sm text-indigo-100">
                            Sin multas.
                        </p>
                        <p className="text-xs md:text-sm text-indigo-100 mb-3 md:mb-4">
                            Libros exclusivos.
                        </p>
                        <button className="w-full bg-white text-indigo-700 rounded-lg py-1.5 md:py-2 font-semibold hover:bg-gray-100 transition text-sm md:text-base">
                            Mejorar Plan
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 p-3 md:p-5">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm md:text-lg font-bold text-white flex-shrink-0">
                        {userInitial}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">
                            {session?.user?.name || "Usuario"}
                        </p>
                        <p className="text-xs text-gray-400">
                            Miembro Premium
                        </p>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-3 md:mt-5 w-full flex justify-center items-center gap-2 py-2 md:py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                    {isLoggingOut ? (
                        <>
                            <Loader2 size={16} className="md:w-[18px] md:h-[18px] animate-spin" />
                            <span className="hidden sm:inline">Cerrando sesión...</span>
                            <span className="sm:hidden">Cerrando...</span>
                        </>
                    ) : (
                        <>
                            <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                            <span className="hidden sm:inline">Cerrar sesión</span>
                            <span className="sm:hidden">Salir</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827] border-b border-gray-800">
                <div className="flex items-center justify-between px-4 h-16">
                    <div>
                        <h1 className="text-xl font-bold">
                            📚 Biblioteca+
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition"
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className={`
                hidden md:flex w-72 bg-[#111827] border-r border-gray-800 flex-col min-h-screen sticky top-0
            `}>
                <SidebarContent />
            </div>

            <div className={`
                md:hidden fixed top-0 left-0 h-full w-80 bg-[#111827] border-r border-gray-800 z-50
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                overflow-y-auto
            `}>
                <div className="pt-16">
                    <SidebarContent />
                </div>
            </div>

            <div className="md:hidden h-16" />
        </>
    );
}