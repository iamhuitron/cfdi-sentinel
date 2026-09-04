import * as XLSX from "xlsx";
import type { CfdiData, FiscalSummary, DiotProvider } from "@/lib/types";

export function exportFiscalAuditToExcel(
  cfdis: CfdiData[],
  summary: FiscalSummary,
  diot: DiotProvider[],
  fileName = "auditoria-fiscal-cfdi.xlsx"
): void {
  const wb = XLSX.utils.book_new();

  // 1. Hoja de Resumen Ejecutivo
  const resumenData = [
    ["CFDI SENTINEL — REPORTE DE AUDITORÍA FISCAL"],
    ["Fecha de Generación", new Date().toLocaleString("es-MX")],
    ["Total Comprobantes Auditados", summary.totalComprobantes],
    [],
    ["INDICADOR FISCAL", "MONTO (MXN)"],
    ["Total Ingresos (Facturación Emitida)", summary.totalIngresos],
    ["Total Gastos (Facturación Recibida)", summary.totalGastos],
    ["Total Nómina", summary.totalNomina],
    ["Total Complementos de Pago", summary.totalPagos],
    ["Total Notas de Crédito (Egresos)", summary.totalNotasCredito],
    [],
    ["CONCILIACIÓN DE IMPUESTOS", "MONTO (MXN)"],
    ["IVA Trasladado (Cobrado)", summary.ivaTrasladadoTotal],
    ["IVA Acreditable (Pagado deducible)", summary.ivaAcreditableTotal],
    ["IVA Retenido en Operaciones", summary.ivaRetenidoTotal],
    ["SALDO ESTIMADO DE IVA (A Cargo / [A Favor])", summary.ivaPorPagarEstimado],
    ["Retenciones de ISR Efectuadas", summary.retencionesIsrTotal],
    [],
    ["DIAGNÓSTICO DE RIESGO Y ALERTAS", "CANTIDAD"],
    ["Proveedores en Lista Negra Art. 69-B (EFOS)", summary.efosDetectados],
    ["Discrepancias Aritméticas / Duplicados", summary.discrepanciasDetectadas],
    ["Total Alertas Críticas", summary.alertasCriticas],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Ejecutivo");

  // 2. Hoja de Cédula de Comprobantes
  const comprobantesData = cfdis.map((c) => ({
    "Tipo": c.tipoDeComprobante,
    "Folio Fiscal (UUID)": c.uuid,
    "Fecha Emisión": c.fecha,
    "Serie": c.serie || "",
    "Folio": c.folio || "",
    "RFC Emisor": c.emisor.rfc,
    "Nombre Emisor": c.emisor.nombre,
    "Régimen Emisor": c.emisor.regimenFiscal,
    "RFC Receptor": c.receptor.rfc,
    "Nombre Receptor": c.receptor.nombre,
    "Uso CFDI": c.receptor.usoCFDI,
    "Método Pago": c.metodoPago || "",
    "Forma Pago": c.formaPago || "",
    "Moneda": c.moneda,
    "Subtotal": c.subtotal,
    "Descuento": c.descuento,
    "IVA 16%": c.impuestos.iva16,
    "IVA 8%": c.impuestos.iva8,
    "IVA 0% / Exento": c.impuestos.iva0 + c.impuestos.ivaExento,
    "Retención ISR": c.impuestos.retencionIsr,
    "Retención IVA": c.impuestos.retencionIva,
    "IEPS": c.impuestos.ieps,
    "Total": c.total,
    "Lista Negra EFO": c.esEfo ? `SÍ (${c.efoDetalle?.situacion})` : "NO",
    "Alertas": c.alertas.map((a) => `[${a.severity.toUpperCase()}] ${a.title}`).join(" | "),
  }));

  const wsComprobantes = XLSX.utils.json_to_sheet(comprobantesData);
  XLSX.utils.book_append_sheet(wb, wsComprobantes, "Cédula Facturas");

  // 3. Hoja de Resumen DIOT
  const diotData = diot.map((d) => ({
    "RFC Proveedor": d.rfc,
    "Nombre o Razón Social": d.nombre,
    "Tipo Tercero": d.tipoTercero,
    "Tipo Operación": d.tipoOperacion,
    "Base IVA 16%": d.base16,
    "IVA 16%": d.iva16,
    "Base IVA 8%": d.base8,
    "IVA 8%": d.iva8,
    "Base IVA 0%": d.base0,
    "Base Exenta": d.baseExento,
    "IVA Retenido": d.ivaRetenido,
    "Total Pagado": d.totalCompras,
    "Núm. Comprobantes": d.numComprobantes,
  }));

  const wsDiot = XLSX.utils.json_to_sheet(diotData);
  XLSX.utils.book_append_sheet(wb, wsDiot, "Cédula DIOT");

  // 4. Hoja de Alertas de Auditoría
  const alertasRows: Array<Record<string, string>> = [];
  for (const c of cfdis) {
    for (const a of c.alertas) {
      alertasRows.push({
        "Severidad": a.severity.toUpperCase(),
        "Código": a.code,
        "Título de Alerta": a.title,
        "Descripción": a.description,
        "Impacto Fiscal": a.impact || "N/A",
        "UUID Afectado": c.uuid,
        "RFC Emisor": c.emisor.rfc,
        "Nombre Emisor": c.emisor.nombre,
        "Total Factura": `$${c.total.toFixed(2)}`,
      });
    }
  }

  const wsAlertas = XLSX.utils.json_to_sheet(
    alertasRows.length > 0
      ? alertasRows
      : [{ "Mensaje": "No se detectaron alertas fiscales en el lote auditado." }]
  );
  XLSX.utils.book_append_sheet(wb, wsAlertas, "Alertas y Riesgos");

  // Descargar archivo en el navegador
  XLSX.writeFile(wb, fileName);
}
