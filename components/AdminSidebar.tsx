// components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    LayoutDashboard,
    LibraryBig,
    Users,
    ClipboardList,
    CalendarCheck,
    BookOpen,
    PlusCircle,
    Settings,
    Crown,
    LogOut,
    Loader2,
    Menu,
    X,
    UserCircle,
    User,
} from "lucide-react";

const menu = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard"
    },
    {
        icon: LibraryBig,
        label: "Libros",
        href: "/admin/books"
    },
    {
        icon: PlusCircle,
        label: "Agregar Libro",
        href: "/admin/books/new"
    },
    {
        icon: Users,
        label: "Usuarios",
        href: "/admin/users"
    },
    {
        icon: UserCircle,
        label: "Mi Perfil",
        href: "/admin/profile"
    },
    {
        icon: ClipboardList,
        label: "Préstamos",
        href: "/admin/loans"
    },
    {
        icon: CalendarCheck,
        label: "Reservaciones",
        href: "/admin/reservations"
    },
    {
        icon: Settings,
        label: "Configuración",
        href: "/admin/settings"
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ 
                redirect: false,
                callbackUrl: "/login"
            });
            router.push("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setIsLoggingOut(false);
        }
    };

    const toggleMobile = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const closeMobile = () => {
        setIsMobileOpen(false);
    };

    // Función para verificar si un item está activo
    const isItemActive = (item: { href: string }) => {
        // Para "Agregar Libro", solo activo si es exactamente esa ruta
        if (item.href === "/admin/books/new") {
            return pathname === item.href;
        }
        // Para "Libros", activo si está en /admin/books pero NO en /admin/books/new
        if (item.href === "/admin/books") {
            return pathname === item.href || 
                   (pathname.startsWith("/admin/books") && pathname !== "/admin/books/new");
        }
        // Para "Mi Perfil", activo si está en /admin/profile
        if (item.href === "/admin/profile") {
            return pathname === item.href || pathname.startsWith("/admin/profile");
        }
        // Para los demás, usar startsWith
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    // Obtener iniciales del nombre del usuario
    const getUserInitials = () => {
        if (session?.user?.name) {
            return session.user.name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return 'A';
    };

    // Obtener nombre del usuario
    const getUserName = () => {
        if (session?.user?.name) {
            return session.user.name;
        }
        return 'Administrador';
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 lg:px-8 border-b border-gray-800">
                <Link href="/admin/dashboard" className="flex items-center space-x-2" onClick={closeMobile}>
                    <div className="relative w-32 sm:w-40 md:w-48 lg:w-56 h-8 sm:h-10 md:h-12">
                        <Image
                            src="/title.png"
                            alt="Biblioteca+"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>

            {/* Menu */}
            <div className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto">
                <p className="uppercase text-xs text-gray-500 mb-3 sm:mb-4 px-2">
                    Administración
                </p>
                <nav className="space-y-1 sm:space-y-2">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobile}
                                className={`flex items-center gap-3 sm:gap-4 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-300 text-sm sm:text-base
                                    ${
                                        active
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : "hover:bg-gray-800 text-gray-300"
                                    }
                                `}
                            >
                                <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="truncate">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Premium Admin */}
                <div className="mt-6 sm:mt-8 lg:mt-10 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <Crown size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <h2 className="font-semibold text-sm sm:text-base">
                                Admin Pro
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-indigo-100">
                            Gestión completa
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-100">
                            Control total
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-100 mb-3 sm:mb-4">
                            Estadísticas avanzadas
                        </p>
                        <Link 
                            href="/admin/profile"
                            onClick={closeMobile}
                            className="block w-full bg-white text-indigo-700 rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition text-center"
                        >
                            Ver Perfil
                        </Link>
                    </div>
                </div>
            </div>

            {/* Usuario y Logout */}
            <div className="border-t border-gray-800 p-3 sm:p-4 lg:p-5">
                <Link 
                    href="/admin/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-3 hover:bg-gray-800/50 rounded-xl p-2 transition-colors"
                >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-base sm:text-lg font-bold flex-shrink-0 text-white">
                        {session?.user?.photo ? (
                            <img 
                                src={session.user.photo} 
                                alt="Foto de perfil"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getUserInitials()
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate text-white">
                            {getUserName()}
                        </p>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                            <User size={12} />
                            Administrador
                        </p>
                    </div>
                </Link>

                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-3 sm:mt-4 lg:mt-5 w-full flex justify-center items-center gap-2 py-2 sm:py-2.5 lg:py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                    {isLoggingOut ? (
                        <>
                            <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                            <span className="text-xs sm:text-sm">Cerrando sesión...</span>
                        </>
                    ) : (
                        <>
                            <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                            <span className="text-xs sm:text-sm">Cerrar sesión</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );

    if (!isMobile) {
        return (
            <div className="w-56 sm:w-64 md:w-72 bg-[#111827] border-r border-gray-800 flex flex-col min-h-screen sticky top-0 flex-shrink-0">
                <SidebarContent />
            </div>
        );
    }

    return (
        <>
            <button
                onClick={toggleMobile}
                className="fixed top-4 left-4 z-50 p-2 bg-[#111827] rounded-xl border border-gray-800 text-white hover:bg-gray-800 transition-colors md:hidden"
            >
                <Menu size={24} />
            </button>

            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobile}
                />
            )}

            <div className={`fixed top-0 left-0 h-full w-72 bg-[#111827] border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out md:hidden ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    <button
                        onClick={closeMobile}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    
                    <div className="flex-1 overflow-y-auto pt-4">
                        <SidebarContent />
                    </div>
                </div>
            </div>
        </>
    );
}