"use client";

import { useState } from "react";
import { X, Search, ShieldAlert, CheckCircle2, AlertOctagon, Info } from "lucide-react";
import { checkEfoRfc, getAllEfos } from "@/lib/audit/efo-checker";
import type { EfoRecord } from "@/lib/types";

interface EfoLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EfoLookupModal({ isOpen, onClose }: EfoLookupModalProps) {
  const [queryRfc, setQueryRfc] = useState("");
  const allRecords = getAllEfos();

  if (!isOpen) return null;

  const searchResult: EfoRecord | null = queryRfc.trim() ? checkEfoRfc(queryRfc) : null;

  const getSituacionBadge = (sit: EfoRecord["situacion"]) => {
    switch (sit) {
      case "Definitivo":
        return <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 font-semibold text-[11px]">Definitivo (Sin Efectos Fiscales)</span>;
      case "Presunto":
        return <span className="rounded bg-amber-500/20 text-amber-300 px-2 py-0.5 font-semibold text-[11px]">Presunto (Bajo Procedimiento)</span>;
      case "Desvirtuado":
        return <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-semibold text-[11px]">Desvirtuado (Aclarado ante SAT)</span>;
      default:
        return <span className="rounded bg-sky-500/20 text-sky-300 px-2 py-0.5 font-semibold text-[11px]">{sit}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldAlert size={20} className="text-rose-400" />
            <span>Consultor SAT Art. 69-B (EFOS / Factureras)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Ingresa un RFC para verificar:</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ej. GOC9303256A2..."
              value={queryRfc}
              onChange={(e) => setQueryRfc(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-4 py-2.5 font-mono text-sm uppercase text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Resultado de búsqueda directa */}
        {queryRfc.trim().length >= 10 && (
          <div className="rounded-xl border p-4 transition-all">
            {searchResult ? (
              <div className="space-y-2 border-rose-500/40 bg-rose-950/20 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{searchResult.rfc}</span>
                  {getSituacionBadge(searchResult.situacion)}
                </div>
                <div className="text-xs font-medium text-slate-200">{searchResult.nombre}</div>
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4">
                  <span>Oficio: {searchResult.numeroOficio || "Publicación Oficial"}</span>
                  <span>Publicación DOF: {searchResult.fechaPublicacionDof}</span>
                </div>
                <p className="text-[11px] text-rose-300 mt-2">
                  ⚠️ <strong>Riesgo:</strong> Cualquier CFDI emitido por este RFC no produce ni produjo efecto fiscal alguno conforme al Art. 69-B del CFF.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-xs p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <CheckCircle2 size={16} />
                <span>
                  El RFC <strong>{queryRfc}</strong> no se encuentra en los registros de empresas con operaciones simuladas.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Ejemplos de prueba de la base */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            RFCs de muestra indexados en la base local ({allRecords.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {allRecords.map((r) => (
              <button
                key={r.rfc}
                type="button"
                onClick={() => setQueryRfc(r.rfc)}
                className="text-left rounded-lg border border-slate-800 bg-slate-800/40 p-2 text-xs hover:border-slate-700 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-sky-400">{r.rfc}</span>
                  <span className="text-[10px] text-slate-400">{r.situacion}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{r.nombre}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
