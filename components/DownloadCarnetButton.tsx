// components/DownloadCarnetButton.tsx
"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import CarnetPDF from "./CarnetPDF";
import { Loader2, FileDown } from "lucide-react";

interface DownloadCarnetButtonProps {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    photo: string | null;
  };
  className?: string;
}

export default function DownloadCarnetButton({ user, className = "" }: DownloadCarnetButtonProps) {
  return (
    <PDFDownloadLink
      document={<CarnetPDF user={user} />}
      fileName={`carnet-${user.identification}.pdf`}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 ${className}`}
    >
      {({ loading }) => (
        <>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Descargar Carnet
            </>
          )}
        </>
      )}
    </PDFDownloadLink>
  );
}