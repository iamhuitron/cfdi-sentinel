"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Dropzone } from "@/components/Dropzone";
import { FiscalKpiCards } from "@/components/FiscalKpiCards";
import { AnomalyAlerts } from "@/components/AnomalyAlerts";
import { CfdiTable } from "@/components/CfdiTable";
import { DiotSummaryTable } from "@/components/DiotSummaryTable";
import { EfoLookupModal } from "@/components/EfoLookupModal";
import { calculateFiscalSummary, generateDiotSummary, detectMainRfc } from "@/lib/audit/tax-calculator";
import { exportFiscalAuditToExcel } from "@/lib/export/excel-exporter";
import type { CfdiData } from "@/lib/types";
import { FileSpreadsheet, Download, Layers, Users } from "lucide-react";

export default function Home() {
  const [cfdis, setCfdis] = useState<CfdiData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"FACTURAS" | "DIOT">("FACTURAS");
  const [isEfoModalOpen, setIsEfoModalOpen] = useState(false);
  const [selectedRfc, setSelectedRfc] = useState<string | null>(null);

  // Extraer todos los RFCs participantes únicos
  const availableRfcs = useMemo(() => {
    const rfcs = new Set<string>();
    for (const c of cfdis) {
      if (c.emisor.rfc) rfcs.add(c.emisor.rfc);
      if (c.receptor.rfc && c.receptor.rfc !== "XAXX010101000") rfcs.add(c.receptor.rfc);
    }
    return Array.from(rfcs);
  }, [cfdis]);

  // RFC del contribuyente en foco
  const currentRfc = selectedRfc || detectMainRfc(cfdis);

  // Cálculos reactivos
  const summary = useMemo(() => {
    return calculateFiscalSummary(cfdis, currentRfc || undefined);
  }, [cfdis, currentRfc]);

  const diotProviders = useMemo(() => {
    return generateDiotSummary(cfdis, currentRfc || undefined);
  }, [cfdis, currentRfc]);

  const handleDataLoaded = (newCfdis: CfdiData[]) => {
    setCfdis(newCfdis);
    const top = detectMainRfc(newCfdis);
    setSelectedRfc(top);
  };

  const handleReset = () => {
    setCfdis([]);
    setSelectedRfc(null);
  };

  const handleExportExcel = () => {
    if (cfdis.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const rfcTag = currentRfc ? `_${currentRfc}` : "";
    exportFiscalAuditToExcel(cfdis, summary, diotProviders, `auditoria_fiscal${rfcTag}_${dateStr}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100">
      <Header
        onOpenEfoLookup={() => setIsEfoModalOpen(true)}
        onReset={handleReset}
        hasData={cfdis.length > 0}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {cfdis.length === 0 ? (
          <div className="space-y-8 py-6">
            <div className="max-w-3xl space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-sky-400">
                Auditoría Fiscal In-Browser
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Control y conciliación de facturas <span className="text-sky-400">CFDI 4.0</span> sin comprometer tu privacidad.
              </h2>
              <p className="text-base text-slate-400 leading-relaxed">
                Analiza carpetas completas o archivos ZIP de facturas del SAT. Detecta automáticamente proveedores en listas negras del Art. 69-B (EFOS), verifica la exactitud del IVA e ISR, identifica inconsistencias en PPD y genera cédulas en Excel listas para tu declaración.
              </p>
            </div>

            <Dropzone
              onDataLoaded={handleDataLoaded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />

            {/* Características de Confianza */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-5 space-y-2">
                <div className="text-sky-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  01 · Privacidad Absoluta
                </div>
                <h4 className="text-sm font-semibold text-white">100% Client-Side</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus XMLs se descomprimen y parsean en la memoria de tu navegador. Ningún dato fiscal o financiero viaja a ningún servidor externo.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-5 space-y-2">
                <div className="text-rose-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  02 · Art. 69-B del CFF
                </div>
                <h4 className="text-sm font-semibold text-white">Detección de EFOS</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cruce automático contra la base de Empresas que Facturan Operaciones Simuladas (Definitivos y Presuntos) para prevenir contingencias penales.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-5 space-y-2">
                <div className="text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  03 · Exportación Contable
                </div>
                <h4 className="text-sm font-semibold text-white">Cédula en Excel</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Descarga un libro de trabajo multipestaña (.xlsx) con resumen ejecutivo, conciliación de IVA, retenciones de ISR y precarga de DIOT.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tarjetas de Indicadores Clave */}
            <FiscalKpiCards
              summary={summary}
              mainRfc={currentRfc}
              availableRfcs={availableRfcs}
              onSelectMainRfc={(rfc) => setSelectedRfc(rfc)}
            />

            {/* Panel de Alertas de Auditoría */}
            <AnomalyAlerts cfdis={cfdis} />

            {/* Pestañas y Botones de Acción */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("FACTURAS")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    activeTab === "FACTURAS"
                      ? "bg-sky-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Layers size={14} />
                  <span>Cédula de Comprobantes ({cfdis.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("DIOT")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    activeTab === "DIOT"
                      ? "bg-sky-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Users size={14} />
                  <span>Resumen DIOT ({diotProviders.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95 shadow-sm"
              >
                <Download size={14} />
                <span>Exportar Cédula a Excel (.xlsx)</span>
              </button>
            </div>

            {/* Contenido de la pestaña activa */}
            {activeTab === "FACTURAS" ? (
              <CfdiTable cfdis={cfdis} />
            ) : (
              <DiotSummaryTable providers={diotProviders} />
            )}
          </div>
        )}
      </main>

      {/* Modal de búsqueda de EFOS Art. 69-B */}
      <EfoLookupModal
        isOpen={isEfoModalOpen}
        onClose={() => setIsEfoModalOpen(false)}
      />

      <footer className="border-t border-slate-800/80 bg-[#090d15] py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>CFDI Sentinel</strong> · Auditoría Fiscal & Analítica Digital 100% en Navegador
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            Next.js 15 · React 19 · TypeScript · Tailwind CSS · Fast XML Parser
          </p>
        </div>
      </footer>
    </div>
  );
}
