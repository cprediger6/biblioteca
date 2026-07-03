"use client";

interface DashboardStatsProps {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
}

export default function DashboardStats({
  totalBooks,
  totalUsers,
  activeLoans,
  overdueLoans,
}: DashboardStatsProps) {
  const stats = [
    { label: "📖 Libros", value: totalBooks, color: "bg-blue-500" },
    { label: "👥 Usuarios", value: totalUsers, color: "bg-green-500" },
    { label: "📋 Préstamos Activos", value: activeLoans, color: "bg-yellow-500" },
    { label: "⚠️ Préstamos Vencidos", value: overdueLoans, color: "bg-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} text-white rounded-lg shadow-lg p-6`}
        >
          <div className="text-3xl font-bold">{stat.value}</div>
          <div className="text-sm opacity-80">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}