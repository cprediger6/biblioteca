// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        redirect("/login?role=admin");
    }

    if (session.user?.role !== "admin") {
        redirect("/cliente/dashboard");
    }

    return (
        <div className="flex min-h-screen bg-[#0b0f17]">
            <AdminSidebar />
            <div className="flex-1 min-w-0 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}