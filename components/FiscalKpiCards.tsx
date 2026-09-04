"use client";

import { TrendingUp, TrendingDown, Scale, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import type { FiscalSummary } from "@/lib/types";

interface FiscalKpiCardsProps {
  summary: FiscalSummary;
  mainRfc: string | null;
  availableRfcs: string[];
  onSelectMainRfc: (rfc: string) => void;
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function FiscalKpiCards({
  summary,
  mainRfc,
  availableRfcs,
  onSelectMainRfc,
}: FiscalKpiCardsProps) {
  const isIvaFavor = summary.ivaPorPagarEstimado < 0;

  return (
    <div className="space-y-4">
      {/* Barra de contexto del Contribuyente */}
      {availableRfcs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Perspectiva Contribuyente Auditado:</span>
            <select
              value={mainRfc || ""}
              onChange={(e) => onSelectMainRfc(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono font-medium text-sky-400 focus:border-sky-500 focus:outline-none"
            >
              {availableRfcs.map((rfc) => (
                <option key={rfc} value={rfc}>
                  {rfc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Total Comprobantes: <strong className="text-white font-mono">{summary.totalComprobantes}</strong>
            </span>
            {summary.totalNotasCredito > 0 && (
              <span>
                Notas de Crédito: <strong className="text-amber-400 font-mono">{fmtMoney(summary.totalNotasCredito)}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Grid de 4 KPIs Principales */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Ingresos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingresos Facturados</span>
            <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">
            {fmtMoney(summary.totalIngresos)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            IVA Trasladado: <span className="text-emerald-400 font-mono font-medium">+{fmtMoney(summary.ivaTrasladadoTotal)}</span>
          </div>
        </div>

        {/* KPI 2: Gastos Deducibles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gastos Registrados</span>
            <div className="rounded-md bg-rose-500/10 p-1.5 text-rose-400">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-white font-mono">
            {fmtMoney(summary.totalGastos)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            IVA Acreditable: <span className="text-rose-400 font-mono font-medium">-{fmtMoney(summary.ivaAcreditableTotal)}</span>
          </div>
        </div>

        {/* KPI 3: Estimación de IVA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>IVA Estimado (Periodo)</span>
            <div className="rounded-md bg-sky-500/10 p-1.5 text-sky-400">
              <Scale size={16} />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-bold tracking-tight font-mono ${
              isIvaFavor ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {fmtMoney(Math.abs(summary.ivaPorPagarEstimado))}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {isIvaFavor ? (
              <span className="text-emerald-400">Saldo a Favor estimado</span>
            ) : (
              <span className="text-amber-400">IVA por Pagar estimado</span>
            )}
            {summary.ivaRetenidoTotal > 0 && (
              <span> · Ret: {fmtMoney(summary.ivaRetenidoTotal)}</span>
            )}
          </div>
        </div>

        {/* KPI 4: Riesgo Fiscal y EFOS */}
        <div
          className={`rounded-xl border p-4 transition-colors ${
            summary.efosDetectados > 0
              ? "border-rose-500/40 bg-rose-950/20"
              : summary.discrepanciasDetectadas > 0
              ? "border-amber-500/30 bg-amber-950/20"
              : "border-slate-800 bg-slate-900/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Riesgo Art. 69-B / Estatus</span>
            <div
              className={`rounded-md p-1.5 ${
                summary.efosDetectados > 0
                  ? "bg-rose-500/20 text-rose-400"
                  : summary.discrepanciasDetectadas > 0
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {summary.efosDetectados > 0 ? (
                <ShieldAlert size={16} />
              ) : summary.discrepanciasDetectadas > 0 ? (
                <AlertTriangle size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-bold tracking-tight font-mono ${
              summary.efosDetectados > 0
                ? "text-rose-400"
                : summary.discrepanciasDetectadas > 0
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {summary.efosDetectados > 0
              ? `${summary.efosDetectados} EFO DETECTADO`
              : summary.discrepanciasDetectadas > 0
              ? `${summary.discrepanciasDetectadas} Discrepancias`
              : "Lote Saludable"}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.efosDetectados > 0
              ? "Operaciones simuladas con riesgo penal"
              : summary.alertasCriticas > 0
              ? `${summary.alertasCriticas} alertas requieren revisión`
              : "Sin proveedores en lista negra"}
          </div>
        </div>
      </div>
    </div>
  );
}
