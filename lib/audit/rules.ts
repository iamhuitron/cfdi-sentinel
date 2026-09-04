import type { CfdiData, AuditAlert } from "@/lib/types";

// Expresión regular oficial del SAT para RFC (Física 13 chars, Moral 12 chars)
export const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

/**
 * Ejecuta todas las reglas de auditoría fiscal individual sobre un comprobante
 */
export function auditIndividualCfdi(cfdi: CfdiData): AuditAlert[] {
  const alerts: AuditAlert[] = [];

  // 1. Alerta de Empresa Facturadora de Operaciones Simuladas (EFO - Art. 69-B)
  if (cfdi.esEfo && cfdi.efoDetalle) {
    const sit = cfdi.efoDetalle.situacion;
    const isCritical = sit === "Definitivo" || sit === "Presunto";

    alerts.push({
      id: `${cfdi.id}-efo`,
      code: "SAT_69B_EFO",
      severity: isCritical ? "critical" : "warning",
      title: `Proveedor en Lista Negra SAT (${sit})`,
      description: `El emisor ${cfdi.emisor.rfc} (${cfdi.emisor.nombre}) está listado en el Art. 69-B del CFF como ${sit}.`,
      impact:
        sit === "Definitivo"
          ? "Riesgo legal y penal alto: Las deducciones y acreditamientos de este comprobante no tienen efectos fiscales ante el SAT."
          : "El proveedor se encuentra bajo investigación o procedimiento fiscal ante la autoridad.",
    });
  }

  // 2. Validación de Estructura de RFC
  if (!RFC_REGEX.test(cfdi.emisor.rfc)) {
    alerts.push({
      id: `${cfdi.id}-rfc-emisor`,
      code: "RFC_INVALID_EMISOR",
      severity: "warning",
      title: "RFC de Emisor No Conforme",
      description: `El RFC "${cfdi.emisor.rfc}" no cumple con la estructura alfanumérica estándar del SAT.`,
      impact: "El comprobante puede ser rechazado por sistemas contables o en declaraciones.",
    });
  }

  if (cfdi.receptor.rfc !== "XAXX010101000" && cfdi.receptor.rfc !== "XEXX010101000" && !RFC_REGEX.test(cfdi.receptor.rfc)) {
    alerts.push({
      id: `${cfdi.id}-rfc-receptor`,
      code: "RFC_INVALID_RECEPTOR",
      severity: "warning",
      title: "RFC de Receptor No Conforme",
      description: `El RFC de receptor "${cfdi.receptor.rfc}" no cumple con el estándar del SAT.`,
      impact: "Posible error de captura o timbrado con RFC inválido.",
    });
  }

  // 3. Validación Aritmética de Ecuación Fiscal
  // Total = Subtotal - Descuento + ImpuestosTrasladados - ImpuestosRetenidos
  if (cfdi.tipoDeComprobante !== "P") {
    const calcTotal =
      cfdi.subtotal -
      cfdi.descuento +
      cfdi.impuestos.totalImpuestosTrasladados -
      cfdi.impuestos.totalImpuestosRetenidos;

    const diff = Math.abs(calcTotal - cfdi.total);
    // Tolerancia de $1.00 para diferencias de redondeo de centavos por concepto del Anexo 20
    if (diff > 1.0) {
      alerts.push({
        id: `${cfdi.id}-aritmetica`,
        code: "ARITHMETIC_MISMATCH",
        severity: "critical",
        title: "Discrepancia Aritmética en Total",
        description: `El total reportado ($${cfdi.total.toFixed(2)}) no coincide con el cálculo fiscal: Subtotal ($${cfdi.subtotal.toFixed(2)}) - Descuento ($${cfdi.descuento.toFixed(2)}) + Traslados ($${cfdi.impuestos.totalImpuestosTrasladados.toFixed(2)}) - Retenciones ($${cfdi.impuestos.totalImpuestosRetenidos.toFixed(2)}) = $${calcTotal.toFixed(2)}. Diferencia: $${diff.toFixed(2)}.`,
        impact: "Posible inconsistencia en los nodos de impuestos o manipulación del XML.",
      });
    }
  }

  // 4. Inconsistencia de Forma y Método de Pago (SAT Anexo 20)
  // En PUE no se permite forma de pago 99 (Por definir)
  if (cfdi.metodoPago === "PUE" && cfdi.formaPago === "99") {
    alerts.push({
      id: `${cfdi.id}-pue-99`,
      code: "PUE_FORMA_99",
      severity: "warning",
      title: "Inconsistencia PUE con Forma 99",
      description: 'El comprobante está marcado como "PUE" (Pago en una sola exhibición) pero tiene forma de pago "99 Por definir".',
      impact: "Guía de llenado SAT: Si la operación ya fue pagada (PUE), debe registrarse el medio real de pago (Transferencia, Tarjeta, etc.).",
    });
  }

  // Si es PPD con forma distinta a 99
  if (cfdi.metodoPago === "PPD" && cfdi.formaPago && cfdi.formaPago !== "99") {
    alerts.push({
      id: `${cfdi.id}-ppd-not-99`,
      code: "PPD_FORMA_NOT_99",
      severity: "info",
      title: "PPD con Forma de Pago Asignada",
      description: `Comprobante emitido en parcialidades o diferido (PPD) pero con forma de pago "${cfdi.formaPago}". El estándar SAT requiere comúnmente clave 99 hasta la emisión del REP.`,
    });
  }

  // 5. Verificación de Timbrado Extemporáneo (> 72 horas)
  if (cfdi.fecha && cfdi.fechaTimbrado) {
    try {
      const emision = new Date(cfdi.fecha).getTime();
      const timbrado = new Date(cfdi.fechaTimbrado).getTime();
      const diffHoras = (timbrado - emision) / (1000 * 60 * 60);

      if (diffHoras > 72) {
        alerts.push({
          id: `${cfdi.id}-timbrado-extemporaneo`,
          code: "TIMBRADO_LATE",
          severity: "warning",
          title: "Timbrado Posterior al Plazo Legal (> 72h)",
          description: `El comprobante fue timbrado ${Math.round(diffHoras)} horas después de su fecha de emisión. El artículo 39 del RCFF estipula un plazo máximo de 72 horas.`,
          impact: "El PAC no debió certificar fuera de las 72 horas reglamentarias.",
        });
      }
    } catch {
      // Formato de fecha no convertible a Date estándar
    }
  }

  return alerts;
}

/**
 * Audita el lote completo de comprobantes buscando duplicados y relaciones globales
 */
export function auditBatchCfdis(cfdis: CfdiData[]): CfdiData[] {
  const uuidCount = new Map<string, number>();

  // Contabilizar frecuencias de UUID
  for (const c of cfdis) {
    if (c.uuid) {
      uuidCount.set(c.uuid, (uuidCount.get(c.uuid) || 0) + 1);
    }
  }

  return cfdis.map((cfdi) => {
    const individualAlerts = auditIndividualCfdi(cfdi);

    // Alerta de duplicidad de UUID
    if (cfdi.uuid && (uuidCount.get(cfdi.uuid) || 0) > 1) {
      individualAlerts.push({
        id: `${cfdi.id}-dup-uuid`,
        code: "DUPLICATE_UUID",
        severity: "critical",
        title: "Folio Fiscal (UUID) Duplicado",
        description: `El UUID ${cfdi.uuid} aparece en más de un archivo cargado en este lote.`,
        impact: "Riesgo de doble contabilización de ingresos o gastos.",
      });
    }

    return {
      ...cfdi,
      alertas: individualAlerts,
    };
  });
}
