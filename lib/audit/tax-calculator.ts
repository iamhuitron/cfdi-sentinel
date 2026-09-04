import type { CfdiData, FiscalSummary, DiotProvider } from "@/lib/types";

/**
 * Detecta automáticamente el RFC del contribuyente principal basado en la frecuencia de emisión/recepción
 */
export function detectMainRfc(cfdis: CfdiData[]): string | null {
  if (cfdis.length === 0) return null;

  const count = new Map<string, number>();
  for (const c of cfdis) {
    if (c.emisor.rfc) {
      count.set(c.emisor.rfc, (count.get(c.emisor.rfc) || 0) + 1);
    }
    if (c.receptor.rfc && c.receptor.rfc !== "XAXX010101000") {
      count.set(c.receptor.rfc, (count.get(c.receptor.rfc) || 0) + 1);
    }
  }

  let topRfc: string | null = null;
  let maxCount = 0;
  for (const [rfc, c] of count.entries()) {
    if (c > maxCount) {
      maxCount = c;
      topRfc = rfc;
    }
  }

  return topRfc;
}

/**
 * Calcula los KPIs y el resumen fiscal consolidado
 */
export function calculateFiscalSummary(
  cfdis: CfdiData[],
  mainRfc?: string
): FiscalSummary {
  let totalIngresos = 0;
  let totalGastos = 0;
  let totalNomina = 0;
  let totalPagos = 0;
  let totalNotasCredito = 0;

  let ivaTrasladadoTotal = 0;
  let ivaAcreditableTotal = 0;
  let ivaRetenidoTotal = 0;
  let retencionesIsrTotal = 0;

  let efosDetectados = 0;
  let discrepanciasDetectadas = 0;
  let alertasCriticas = 0;

  const targetRfc = (mainRfc || detectMainRfc(cfdis) || "").trim().toUpperCase();

  for (const cfdi of cfdis) {
    const isEmisor = targetRfc ? cfdi.emisor.rfc === targetRfc : false;
    const isReceptor = targetRfc ? cfdi.receptor.rfc === targetRfc : false;

    // Conteo de alertas
    for (const a of cfdi.alertas) {
      if (a.severity === "critical") alertasCriticas++;
      if (a.code === "SAT_69B_EFO") efosDetectados++;
      if (a.code === "ARITHMETIC_MISMATCH" || a.code === "DUPLICATE_UUID") {
        discrepanciasDetectadas++;
      }
    }

    // Clasificación por Tipo de Comprobante
    if (cfdi.tipoDeComprobante === "N") {
      totalNomina += cfdi.total;
    } else if (cfdi.tipoDeComprobante === "P") {
      totalPagos += cfdi.total;
    } else if (cfdi.tipoDeComprobante === "E") {
      totalNotasCredito += cfdi.total;
      // Si emitimos la nota de crédito, reduce el ingreso
      if (isEmisor) {
        totalIngresos -= cfdi.total;
        ivaTrasladadoTotal -= cfdi.impuestos.iva16 + cfdi.impuestos.iva8;
      }
    } else if (cfdi.tipoDeComprobante === "I") {
      // Si tenemos un RFC objetivo, separamos rigurosamente ingresos y gastos
      if (targetRfc) {
        if (isEmisor) {
          totalIngresos += cfdi.total;
          ivaTrasladadoTotal += cfdi.impuestos.iva16 + cfdi.impuestos.iva8;
          retencionesIsrTotal += cfdi.impuestos.retencionIsr;
          ivaRetenidoTotal += cfdi.impuestos.retencionIva;
        } else if (isReceptor) {
          totalGastos += cfdi.total;
          // El IVA de un EFO en definitivo no es acreditable
          if (!cfdi.esEfo || cfdi.efoDetalle?.situacion !== "Definitivo") {
            ivaAcreditableTotal += cfdi.impuestos.iva16 + cfdi.impuestos.iva8;
          }
        } else {
          // Si no coincide con ninguno, sumamos como ingreso genérico
          totalIngresos += cfdi.total;
          ivaTrasladadoTotal += cfdi.impuestos.iva16 + cfdi.impuestos.iva8;
        }
      } else {
        // Modo genérico sin RFC seleccionado
        totalIngresos += cfdi.total;
        ivaTrasladadoTotal += cfdi.impuestos.iva16 + cfdi.impuestos.iva8;
        retencionesIsrTotal += cfdi.impuestos.retencionIsr;
        ivaRetenidoTotal += cfdi.impuestos.retencionIva;
      }
    }
  }

  // IVA por enterar (trasladado - acreditable - retenciones que le practicaron)
  const ivaPorPagarEstimado = Number(
    (ivaTrasladadoTotal - ivaAcreditableTotal - ivaRetenidoTotal).toFixed(2)
  );

  return {
    totalComprobantes: cfdis.length,
    totalIngresos: Number(totalIngresos.toFixed(2)),
    totalGastos: Number(totalGastos.toFixed(2)),
    totalNomina: Number(totalNomina.toFixed(2)),
    totalPagos: Number(totalPagos.toFixed(2)),
    totalNotasCredito: Number(totalNotasCredito.toFixed(2)),
    ivaTrasladadoTotal: Number(ivaTrasladadoTotal.toFixed(2)),
    ivaAcreditableTotal: Number(ivaAcreditableTotal.toFixed(2)),
    ivaRetenidoTotal: Number(ivaRetenidoTotal.toFixed(2)),
    ivaPorPagarEstimado,
    retencionesIsrTotal: Number(retencionesIsrTotal.toFixed(2)),
    efosDetectados,
    discrepanciasDetectadas,
    alertasCriticas,
  };
}

/**
 * Agrupa los gastos de proveedores en el formato de la DIOT (Declaración Informativa de Operaciones con Terceros)
 */
export function generateDiotSummary(
  cfdis: CfdiData[],
  mainRfc?: string
): DiotProvider[] {
  const targetRfc = (mainRfc || detectMainRfc(cfdis) || "").trim().toUpperCase();
  const providerMap = new Map<string, DiotProvider>();

  // Filtrar gastos: recibidos por el receptor o comprobantes tipo I donde el emisor no sea el targetRfc
  const gastos = cfdis.filter((c) => {
    if (c.tipoDeComprobante !== "I" && c.tipoDeComprobante !== "E") return false;
    if (targetRfc) {
      return c.receptor.rfc === targetRfc || c.emisor.rfc !== targetRfc;
    }
    return true;
  });

  for (const g of gastos) {
    const rfc = g.emisor.rfc;
    const existing = providerMap.get(rfc) || {
      rfc,
      nombre: g.emisor.nombre,
      tipoTercero: rfc.length === 12 || rfc.length === 13 ? "04" : "05",
      tipoOperacion: "03",
      base16: 0,
      iva16: 0,
      base8: 0,
      iva8: 0,
      base0: 0,
      baseExento: 0,
      ivaRetenido: 0,
      totalCompras: 0,
      numComprobantes: 0,
    };

    // Bases e importes
    let b16 = 0;
    let b8 = 0;
    let b0 = 0;
    let bEx = 0;

    for (const c of g.conceptos) {
      for (const t of c.traslados) {
        if (t.impuesto === "002") {
          if (t.tipoFactor === "Exento") bEx += t.base;
          else if (Math.abs(t.tasaOCuota - 0.16) < 0.005) b16 += t.base;
          else if (Math.abs(t.tasaOCuota - 0.08) < 0.005) b8 += t.base;
          else if (t.tasaOCuota === 0) b0 += t.base;
        }
      }
    }

    // Si los conceptos no tenían desglose explícito de base, aproximar por el subtotal
    if (b16 === 0 && g.impuestos.iva16 > 0) {
      b16 = g.impuestos.iva16 / 0.16;
    }

    const sign = g.tipoDeComprobante === "E" ? -1 : 1;

    existing.base16 += sign * b16;
    existing.iva16 += sign * g.impuestos.iva16;
    existing.base8 += sign * b8;
    existing.iva8 += sign * g.impuestos.iva8;
    existing.base0 += sign * b0;
    existing.baseExento += sign * bEx;
    existing.ivaRetenido += sign * g.impuestos.retencionIva;
    existing.totalCompras += sign * g.total;
    existing.numComprobantes += 1;

    providerMap.set(rfc, existing);
  }

  return Array.from(providerMap.values())
    .map((p) => ({
      ...p,
      base16: Number(p.base16.toFixed(2)),
      iva16: Number(p.iva16.toFixed(2)),
      base8: Number(p.base8.toFixed(2)),
      iva8: Number(p.iva8.toFixed(2)),
      base0: Number(p.base0.toFixed(2)),
      baseExento: Number(p.baseExento.toFixed(2)),
      ivaRetenido: Number(p.ivaRetenido.toFixed(2)),
      totalCompras: Number(p.totalCompras.toFixed(2)),
    }))
    .sort((a, b) => b.totalCompras - a.totalCompras);
}
