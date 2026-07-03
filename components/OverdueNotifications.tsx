"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface OverdueLoan {
  id: string;
  dueDate: string;
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

export default function OverdueNotifications() {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const response = await fetch("/api/loans/overdue");
        const data = await response.json();
        setOverdueLoans(data);
      } catch (error) {
        console.error("Error fetching overdue loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, []);

  const calculateDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const diff = today.getTime() - new Date(dueDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="mr-2 text-red-500" />
          ⚠️ Alertas de Vencimiento
        </h2>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <AlertTriangle className="mr-2 text-red-500" />
        ⚠️ Alertas de Vencimiento
      </h2>

      {overdueLoans.length === 0 ? (
        <p className="text-gray-500">✅ No hay préstamos vencidos</p>
      ) : (
        <ul className="space-y-3">
          {overdueLoans.map((loan: OverdueLoan) => (
            <li key={loan.id} className="p-3 bg-red-50 rounded">
              <p className="font-medium">{loan.user.name}</p>
              <p className="text-sm text-gray-600">
                {loan.copy.book.title}
              </p>
              <p className="text-sm text-red-600">
                Vencido hace {calculateDaysOverdue(loan.dueDate)} días
              </p>
              <p className="text-xs text-gray-500">
                Vencimiento: {new Date(loan.dueDate).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}