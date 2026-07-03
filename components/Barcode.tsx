// components/Barcode.tsx
"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export default function Barcode({
  value,
  width = 1.5,
  height = 50,
  displayValue = true,
  fontSize = 10,
  margin = 5,
  className = "",
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Limpiar el SVG antes de renderizar
        while (svgRef.current.firstChild) {
          svgRef.current.removeChild(svgRef.current.firstChild);
        }

        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          font: "monospace",
          textAlign: "center",
          textPosition: "bottom",
          textMargin: 2,
          margin: margin,
          background: "#ffffff",
          lineColor: "#000000",
          valid: function(valid: boolean) {
            if (!valid) {
              console.warn("Código de barras inválido:", value);
            }
          }
        });
      } catch (error) {
        console.error("Error generando código de barras:", error);
        if (svgRef.current) {
          svgRef.current.innerHTML = `
            <text x="50%" y="50%" text-anchor="middle" font-size="10" fill="red">
              Error: ${error instanceof Error ? error.message : "Código inválido"}
            </text>
          `;
        }
      }
    }
  }, [value, width, height, displayValue, fontSize, margin]);

  return (
    <svg 
      ref={svgRef} 
      className={`barcode-svg ${className}`}
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        display: 'block',
      }}
    />
  );
}