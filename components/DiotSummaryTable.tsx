"use client";

import type { DiotProvider } from "@/lib/types";

interface DiotSummaryTableProps {
  providers: DiotProvider[];
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function DiotSummaryTable({ providers }: DiotSummaryTableProps) {
  if (providers.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
        No hay operaciones con terceros o gastos deducibles registrados en este lote.
      </div>
    );
  }

  const grandTotalCompras = providers.reduce((acc, p) => acc + p.totalCompras, 0);
  const grandTotalIva16 = providers.reduce((acc, p) => acc + p.iva16, 0);
  const grandTotalIva8 = providers.reduce((acc, p) => acc + p.iva8, 0);
  const grandTotalIvaRet = providers.reduce((acc, p) => acc + p.ivaRetenido, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Cédula Resumen para DIOT (SAT)</h3>
          <p className="text-xs text-slate-400">
            Desglose de actos y actividades pagados agrupados por proveedor para la Declaración Informativa de Operaciones con Terceros.
          </p>
        </div>
        <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-xs font-mono text-sky-400">
          {providers.length} Proveedores
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-3">RFC Proveedor</th>
                <th className="py-3 px-3">Razón Social</th>
                <th className="py-3 px-3 text-right">Base 16%</th>
                <th className="py-3 px-3 text-right">IVA 16%</th>
                <th className="py-3 px-3 text-right">Base 8% / 0%</th>
                <th className="py-3 px-3 text-right">IVA Retenido</th>
                <th className="py-3 px-3 text-right font-bold text-white">Total Pagado</th>
                <th className="py-3 px-3 text-center">Facturas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {providers.map((p) => (
                <tr key={p.rfc} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-sky-400">{p.rfc}</td>
                  <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate">{p.nombre}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{fmtMoney(p.base16)}</td>
                  <td className="py-3 px-3 text-right text-emerald-400">{fmtMoney(p.iva16)}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{fmtMoney(p.base8 + p.base0 + p.baseExento)}</td>
                  <td className="py-3 px-3 text-right text-amber-400">{p.ivaRetenido > 0 ? `-${fmtMoney(p.ivaRetenido)}` : "$0.00"}</td>
                  <td className="py-3 px-3 text-right font-bold text-white">{fmtMoney(p.totalCompras)}</td>
                  <td className="py-3 px-3 text-center text-slate-400">{p.numComprobantes}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-mono font-bold text-xs text-white">
              <tr>
                <td colSpan={2} className="py-3 px-3 text-right font-sans uppercase">Totales DIOT:</td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {fmtMoney(providers.reduce((acc, p) => acc + p.base16, 0))}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400">{fmtMoney(grandTotalIva16)}</td>
                <td className="py-3 px-3 text-right text-slate-400">
                  {fmtMoney(providers.reduce((acc, p) => acc + p.base8 + p.base0 + p.baseExento, 0))}
                </td>
                <td className="py-3 px-3 text-right text-amber-400">
                  {grandTotalIvaRet > 0 ? `-${fmtMoney(grandTotalIvaRet)}` : "$0.00"}
                </td>
                <td className="py-3 px-3 text-right text-sky-400">{fmtMoney(grandTotalCompras)}</td>
                <td className="py-3 px-3 text-center text-slate-400">
                  {providers.reduce((acc, p) => acc + p.numComprobantes, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
