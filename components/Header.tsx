"use client";

import { ShieldCheck, Lock, Search, FileSpreadsheet, RefreshCw } from "lucide-react";

interface HeaderProps {
  onOpenEfoLookup: () => void;
  onReset: () => void;
  hasData: boolean;
}

export function Header({ onOpenEfoLookup, onReset, hasData }: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-[#0f1523]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 shadow-inner">
              <ShieldCheck size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                  CFDI Sentinel
                  <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-sky-400 border border-sky-500/20">
                    4.0 / 3.3
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Auditor Fiscal y Analítica de CFDI en el Navegador · SAT Art. 69-B
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Badge de Privacidad Estricta */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Lock size={12} className="stroke-[2.5]" />
              <span>100% In-Browser · Cero Servidor</span>
            </div>

            {/* Botón Verificador EFOS */}
            <button
              type="button"
              onClick={onOpenEfoLookup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <Search size={13} />
              <span>Buscar RFC en Lista 69-B</span>
            </button>

            {hasData && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                title="Limpiar datos cargados"
              >
                <RefreshCw size={12} />
                <span>Reiniciar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
