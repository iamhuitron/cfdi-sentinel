"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  AlertTriangle,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import type { CfdiData, TipoDeComprobante } from "@/lib/types";

interface CfdiTableProps {
  cfdis: CfdiData[];
  selectedUuid?: string | null;
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CfdiTable({ cfdis, selectedUuid }: CfdiTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(selectedUuid || null);

  // Filtrado
  const filtered = cfdis.filter((c) => {
    // Filtro por texto
    const term = searchTerm.toLowerCase();
    const matchText =
      !term ||
      c.uuid.toLowerCase().includes(term) ||
      c.emisor.rfc.toLowerCase().includes(term) ||
      c.emisor.nombre.toLowerCase().includes(term) ||
      c.receptor.rfc.toLowerCase().includes(term) ||
      c.receptor.nombre.toLowerCase().includes(term) ||
      c.conceptos.some((cp) => cp.descripcion.toLowerCase().includes(term));

    if (!matchText) return false;

    // Filtro por tipo
    if (typeFilter !== "ALL" && c.tipoDeComprobante !== typeFilter) {
      return false;
    }

    // Filtro por estatus de riesgo
    if (statusFilter === "EFO" && !c.esEfo) return false;
    if (statusFilter === "ALERT" && c.alertas.length === 0) return false;
    if (statusFilter === "CLEAN" && c.alertas.length > 0) return false;

    return true;
  });

  const getTipoBadge = (tipo: TipoDeComprobante) => {
    switch (tipo) {
      case "I":
        return <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">Ingreso</span>;
      case "E":
        return <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-400">Egreso (NC)</span>;
      case "N":
        return <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono text-purple-400">Nómina</span>;
      case "P":
        return <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-400">Pago REP</span>;
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">{tipo}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por RFC, Razón Social, UUID o Concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 focus:border-sky-500 focus:outline-none font-medium"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="I">Ingreso (I)</option>
            <option value="E">Egreso / Nota Crédito (E)</option>
            <option value="N">Nómina (N)</option>
            <option value="P">Complemento Pago (P)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300 focus:border-sky-500 focus:outline-none font-medium"
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="EFO">🚨 Listas Negras (EFOS)</option>
            <option value="ALERT">⚠️ Con Alertas Fiscales</option>
            <option value="CLEAN">✅ Sin Observaciones</option>
          </select>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 pl-4 pr-2 w-8"></th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Emisor</th>
                <th className="py-3 px-3">Receptor</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">IVA Trasladado</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No se encontraron comprobantes que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((cfdi) => {
                  const isExpanded = expandedId === cfdi.id;
                  const hasCrit = cfdi.alertas.some((a) => a.severity === "critical");
                  const hasWarn = cfdi.alertas.some((a) => a.severity === "warning");

                  return (
                    <tr key={cfdi.id} className="contents">
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : cfdi.id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-800/40 ${
                          isExpanded ? "bg-slate-800/30" : ""
                        } ${cfdi.esEfo ? "bg-rose-950/10" : ""}`}
                      >
                        <td className="py-3 pl-4 pr-2 text-slate-400">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </td>
                        <td className="py-3 px-3">{getTipoBadge(cfdi.tipoDeComprobante)}</td>
                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                          {cfdi.fecha.slice(0, 10)}
                        </td>
                        <td className="py-3 px-3 max-w-[200px] truncate">
                          <div className="font-semibold text-white truncate">{cfdi.emisor.rfc}</div>
                          <div className="text-[10px] text-slate-400 truncate font-sans">{cfdi.emisor.nombre}</div>
                        </td>
                        <td className="py-3 px-3 max-w-[200px] truncate">
                          <div className="font-semibold text-white truncate">{cfdi.receptor.rfc}</div>
                          <div className="text-[10px] text-slate-400 truncate font-sans">{cfdi.receptor.nombre}</div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {fmtMoney(cfdi.subtotal)}
                        </td>
                        <td className="py-3 px-3 text-right text-sky-400">
                          {cfdi.impuestos.iva16 > 0 ? fmtMoney(cfdi.impuestos.iva16) : "$0.00"}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          {fmtMoney(cfdi.total)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {cfdi.esEfo ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 font-sans font-semibold">
                              <ShieldAlert size={12} /> EFO Art. 69-B
                            </span>
                          ) : hasCrit ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 font-sans">
                              Discrepancia
                            </span>
                          ) : hasWarn ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-sans">
                              Observación
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-sans">
                              <CheckCircle2 size={13} /> Limpio
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Vista Detallada Expandida */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan={9} className="p-4 sm:p-6 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 font-sans">
                              <div>
                                <span className="text-xs text-slate-400">Folio Fiscal (UUID): </span>
                                <span className="font-mono text-xs font-semibold text-sky-400">{cfdi.uuid}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>Versión: <strong className="text-white">{cfdi.version}</strong></span>
                                <span>Método: <strong className="text-white">{cfdi.metodoPago || "N/A"}</strong></span>
                                <span>Forma: <strong className="text-white">{cfdi.formaPago || "N/A"}</strong></span>
                                <span>Lugar Exp.: <strong className="text-white">{cfdi.lugarExpedicion}</strong></span>
                              </div>
                            </div>

                            {/* Alertas específicas de la factura */}
                            {cfdi.alertas.length > 0 && (
                              <div className="space-y-1.5 font-sans">
                                {cfdi.alertas.map((a, i) => (
                                  <div
                                    key={i}
                                    className={`rounded-lg p-2.5 text-xs ${
                                      a.severity === "critical"
                                        ? "bg-rose-950/40 border border-rose-500/30 text-rose-200"
                                        : "bg-amber-950/30 border border-amber-500/30 text-amber-200"
                                    }`}
                                  >
                                    <div className="font-semibold">{a.title}</div>
                                    <div className="text-[11px] opacity-90 mt-0.5">{a.description}</div>
                                    {a.impact && <div className="text-[10px] text-rose-300 mt-1">⚠️ {a.impact}</div>}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tabla de Conceptos */}
                            <div className="space-y-2 font-sans">
                              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Conceptos Facturados ({cfdi.conceptos.length})
                              </h4>
                              <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
                                <table className="w-full text-xs text-left">
                                  <thead className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                                    <tr>
                                      <th className="py-2 px-3">Clave</th>
                                      <th className="py-2 px-3">Cant.</th>
                                      <th className="py-2 px-3">Descripción</th>
                                      <th className="py-2 px-3 text-right">P. Unitario</th>
                                      <th className="py-2 px-3 text-right">Importe</th>
                                      <th className="py-2 px-3 text-right">Impuestos</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                                    {cfdi.conceptos.map((cp, idx) => (
                                      <tr key={idx}>
                                        <td className="py-2 px-3 text-sky-400">{cp.claveProdServ}</td>
                                        <td className="py-2 px-3">{cp.cantidad}</td>
                                        <td className="py-2 px-3 font-sans max-w-xs">{cp.descripcion}</td>
                                        <td className="py-2 px-3 text-right">{fmtMoney(cp.valorUnitario)}</td>
                                        <td className="py-2 px-3 text-right">{fmtMoney(cp.importe)}</td>
                                        <td className="py-2 px-3 text-right text-slate-400">
                                          {cp.traslados.map((t, ti) => (
                                            <span key={ti} className="block text-[10px]">
                                              {t.impuestoNombre} ({(t.tasaOCuota * 100).toFixed(0)}%): {fmtMoney(t.importe)}
                                            </span>
                                          ))}
                                          {cp.retenciones.map((r, ri) => (
                                            <span key={ri} className="block text-[10px] text-amber-400">
                                              Ret {r.impuestoNombre}: -{fmtMoney(r.importe)}
                                            </span>
                                          ))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
