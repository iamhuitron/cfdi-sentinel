"use client";

import { useState } from "react";
import { AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import type { CfdiData } from "@/lib/types";

interface AnomalyAlertsProps {
  cfdis: CfdiData[];
  onSelectCfdi?: (uuid: string) => void;
}

export function AnomalyAlerts({ cfdis, onSelectCfdi }: AnomalyAlertsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Recolectar todas las alertas con el contexto de su comprobante
  const allAlerts = cfdis.flatMap((c) =>
    c.alertas.map((a) => ({
      alert: a,
      cfdi: c,
    }))
  );

  if (allAlerts.length === 0) {
    return null;
  }

  const criticalCount = allAlerts.filter((a) => a.alert.severity === "critical").length;
  const warningCount = allAlerts.filter((a) => a.alert.severity === "warning").length;

  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 overflow-hidden transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between px-4 py-3 bg-rose-500/10 hover:bg-rose-500/15 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={18} className="text-rose-400" />
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-200">
            <span>Diagnóstico de Auditoría Fiscal:</span>
            {criticalCount > 0 && (
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300 font-mono">
                {criticalCount} crítica{criticalCount > 1 ? "s" : ""}
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 font-mono">
                {warningCount} advertencia{warningCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <button type="button" className="text-rose-400 hover:text-rose-300">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="divide-y divide-rose-500/10 p-3 space-y-2 max-h-80 overflow-y-auto">
          {allAlerts.map(({ alert, cfdi }, index) => {
            const isCrit = alert.severity === "critical";
            return (
              <div
                key={`${alert.id}-${index}`}
                className="pt-2 pb-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isCrit ? (
                      <AlertOctagon size={16} className="text-rose-400" />
                    ) : alert.severity === "warning" ? (
                      <AlertTriangle size={16} className="text-amber-400" />
                    ) : (
                      <Info size={16} className="text-sky-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{alert.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">[{alert.code}]</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                        RFC: {cfdi.emisor.rfc}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{alert.description}</p>
                    {alert.impact && (
                      <p className="text-rose-300/90 font-medium text-[11px] leading-relaxed">
                        ⚠️ Impacto: {alert.impact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center font-mono">
                  <span className="text-slate-400">Total: ${cfdi.total.toFixed(2)}</span>
                  {cfdi.uuid && onSelectCfdi && (
                    <button
                      type="button"
                      onClick={() => onSelectCfdi(cfdi.uuid)}
                      className="rounded bg-slate-800 px-2 py-1 text-[10px] text-sky-400 hover:bg-slate-700 transition-colors"
                    >
                      Ver Factura
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
