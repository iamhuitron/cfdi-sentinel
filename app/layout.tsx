import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CFDI Sentinel · Auditor Fiscal y Analítica 4.0 Local-First",
  description:
    "Auditoría y conciliación de facturas CFDI 4.0/3.3 en el navegador. Detección de EFOS Art. 69-B del SAT, cálculo exacto de IVA/ISR y exportación contable a Excel 100% privado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
