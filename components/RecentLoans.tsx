"use client";

import { useEffect, useState } from "react";

interface LoanWithDetails {
  id: string;
  loanDate: string;
  status: string;
  user: {
    name: string;
  };
  copy: {
    book: {
      title: string;
    };
  };
}

export default function RecentLoans() {
  const [recentLoans, setRecentLoans] = useState<LoanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch("/api/loans/recent");
        const data = await response.json();
        setRecentLoans(data);
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Préstamos Recientes</h2>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">📋 Préstamos Recientes</h2>
      {recentLoans.length === 0 ? (
        <p className="text-gray-500">No hay préstamos registrados</p>
      ) : (
        <ul className="space-y-3">
          {recentLoans.map((loan: LoanWithDetails) => (
            <li key={loan.id} className="border-b pb-2">
              <p className="font-medium">{loan.user.name}</p>
              <p className="text-sm text-gray-600">
                {loan.copy.book.title} -{" "}
                {new Date(loan.loanDate).toLocaleDateString()}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  loan.status === "active"
                    ? "bg-green-100 text-green-800"
                    : loan.status === "overdue"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {loan.status === "active"
                  ? "Activo"
                  : loan.status === "overdue"
                  ? "Vencido"
                  : "Devuelto"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}