// app/cliente/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Sidebar from "@/components/cliente/layout/Sidebar";
import { SessionProvider } from "next-auth/react";

export default async function ClienteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session) {
        redirect("/login");
    }

    // Si es administrador, redirigir al dashboard de admin
    if (session.user?.role === "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen bg-[#0b0f17]">
            <Sidebar />
            <div className="flex-1 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}