// app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, DollarSign, Loader2, Globe } from "lucide-react";

type Currency = {
  id: string;
  code: string;
  name: string;
  symbol: string;
  country: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Biblioteca+",
    maxLoans: 5,
    loanDays: 14,
    enableNotifications: true,
    theme: "light",
    monthlyFee: 10,
    currency: "USD",
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Error al cargar configuración");
      const data = await response.json();
      
      // Actualizar settings con los valores de la base de datos
      setSettings((prev) => ({
        ...prev,
        siteName: data.settings.siteName || prev.siteName,
        maxLoans: parseInt(data.settings.maxLoans) || prev.maxLoans,
        loanDays: parseInt(data.settings.loanDays) || prev.loanDays,
        enableNotifications: data.settings.enableNotifications === "true" || prev.enableNotifications,
        theme: data.settings.theme || prev.theme,
        monthlyFee: parseFloat(data.settings.monthlyFee) || prev.monthlyFee,
        currency: data.settings.currency || prev.currency,
      }));

      setCurrencies(data.currencies || []);
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: 'Error al cargar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            siteName: settings.siteName,
            maxLoans: String(settings.maxLoans),
            loanDays: String(settings.loanDays),
            enableNotifications: String(settings.enableNotifications),
            theme: settings.theme,
            monthlyFee: String(settings.monthlyFee),
            currency: settings.currency,
          },
        }),
      });

      if (!response.ok) throw new Error("Error al guardar configuración");
      
      setMessage({ type: 'success', text: '✅ Configuración guardada exitosamente' });
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: '❌ Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Obtener el símbolo de la moneda seleccionada
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === settings.currency);
    return currency ? currency.symbol : '$';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold">⚙️ Configuración</h1>
            <p className="text-indigo-100 text-sm">Administra la configuración del sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div
                className={`p-3 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sitio</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de préstamos</label>
                  <input
                    type="number"
                    value={settings.maxLoans}
                    onChange={(e) => setSettings({ ...settings, maxLoans: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Días de préstamo</label>
                  <input
                    type="number"
                    value={settings.loanDays}
                    onChange={(e) => setSettings({ ...settings, loanDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* ✅ Campo para la mensualidad con moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  Mensualidad
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={settings.monthlyFee}
                      onChange={(e) => setSettings({ ...settings, monthlyFee: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="10.00"
                    />
                  </div>
                  <div className="w-48">
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      {currencies.map((curr) => (
                        <option key={curr.id} value={curr.code}>
                          {curr.code} ({curr.symbol}) - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Monto mensual que se cobra a los alumnos. Moneda: <strong>{settings.currency}</strong> ({getCurrencySymbol()})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                  Habilitar notificaciones
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar configuración
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}