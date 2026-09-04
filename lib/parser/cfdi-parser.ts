import { XMLParser } from "fast-xml-parser";
import type {
  CfdiData,
  ConceptoItem,
  ImpuestoDetalle,
  TipoDeComprobante,
  ComplementoPagoItem,
  ComplementoPagoDocRelacionado,
} from "@/lib/types";
import { checkEfoRfc } from "@/lib/audit/efo-checker";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
});

function toNum(val: unknown, fallback = 0): number {
  if (val === undefined || val === null || val === "") return fallback;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

function ensureArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function getImpuestoNombre(code: string): "ISR" | "IVA" | "IEPS" | string {
  switch (code) {
    case "001":
      return "ISR";
    case "002":
      return "IVA";
    case "003":
      return "IEPS";
    default:
      return code;
  }
}

/**
 * Parsea un archivo XML de CFDI 4.0 o 3.3 y lo normaliza en CfdiData
 */
export function parseCfdiXml(xmlContent: string, fileName = "factura.xml"): CfdiData {
  if (!xmlContent || typeof xmlContent !== "string") {
    throw new Error("Contenido XML inválido o vacío");
  }

  const parsed = parser.parse(xmlContent);
  const comp = parsed.Comprobante;

  if (!comp) {
    throw new Error("El archivo XML no contiene el nodo raíz <Comprobante>");
  }

  // 1. Datos Generales del Comprobante
  const version = String(comp.Version || comp.version || "4.0");
  const serie = comp.Serie || comp.serie || undefined;
  const folio = comp.Folio || comp.folio || undefined;
  const fecha = String(comp.Fecha || comp.fecha || "");
  const formaPago = comp.FormaPago || comp.formaPago || undefined;
  const metodoPago = (comp.MetodoPago || comp.metodoPago || undefined) as "PUE" | "PPD" | undefined;
  const lugarExpedicion = String(comp.LugarExpedicion || comp.lugarExpedicion || "");
  const tipoDeComprobante = (String(comp.TipoDeComprobante || comp.tipoDeComprobante || "I")).toUpperCase() as TipoDeComprobante;
  const moneda = String(comp.Moneda || comp.moneda || "MXN");
  const tipoCambio = toNum(comp.TipoCambio || comp.tipoCambio, 1);
  const subtotal = toNum(comp.SubTotal || comp.subTotal, 0);
  const descuento = toNum(comp.Descuento || comp.descuento, 0);
  const total = toNum(comp.Total || comp.total, 0);

  // 2. Emisor y Receptor
  const emisorNode = comp.Emisor || {};
  const receptorNode = comp.Receptor || {};

  const emisor = {
    rfc: String(emisorNode.Rfc || emisorNode.rfc || "").trim().toUpperCase(),
    nombre: String(emisorNode.Nombre || emisorNode.nombre || "Emisor no especificado"),
    regimenFiscal: String(emisorNode.RegimenFiscal || emisorNode.regimenFiscal || ""),
  };

  const receptor = {
    rfc: String(receptorNode.Rfc || receptorNode.rfc || "").trim().toUpperCase(),
    nombre: String(receptorNode.Nombre || receptorNode.nombre || "Receptor no especificado"),
    domicilioFiscalReceptor: receptorNode.DomicilioFiscalReceptor || receptorNode.domicilioFiscalReceptor || undefined,
    regimenFiscalReceptor: receptorNode.RegimenFiscalReceptor || receptorNode.regimenFiscalReceptor || undefined,
    usoCFDI: String(receptorNode.UsoCFDI || receptorNode.usoCFDI || "G03"),
  };

  // 3. Timbre Fiscal Digital (UUID)
  const complementoNode = comp.Complemento || {};
  const tfd = complementoNode.TimbreFiscalDigital || {};
  const uuid = String(tfd.UUID || tfd.uuid || "").trim().toUpperCase();
  const fechaTimbrado = tfd.FechaTimbrado || tfd.fechaTimbrado || undefined;
  const rfcProvCertif = tfd.RfcProvCertif || tfd.rfcProvCertif || undefined;

  // 4. Conceptos
  const conceptosRaw = ensureArray(comp.Conceptos?.Concepto);
  const conceptos: ConceptoItem[] = conceptosRaw.map((c: Record<string, unknown>) => {
    const trasladosC: ImpuestoDetalle[] = [];
    const retencionesC: ImpuestoDetalle[] = [];

    const impNode = c.Impuestos as Record<string, unknown> | undefined;
    if (impNode) {
      const trasRaw = ensureArray((impNode.Traslados as Record<string, unknown>)?.Traslado as Record<string, unknown> | Record<string, unknown>[]);
      for (const t of trasRaw) {
        const impCode = String(t.Impuesto || "");
        trasladosC.push({
          impuesto: impCode,
          impuestoNombre: getImpuestoNombre(impCode),
          tipoFactor: (t.TipoFactor || "Tasa") as "Tasa" | "Cuota" | "Exento",
          tasaOCuota: toNum(t.TasaOCuota, 0),
          base: toNum(t.Base, 0),
          importe: toNum(t.Importe, 0),
        });
      }

      const retRaw = ensureArray((impNode.Retenciones as Record<string, unknown>)?.Retencion as Record<string, unknown> | Record<string, unknown>[]);
      for (const r of retRaw) {
        const impCode = String(r.Impuesto || "");
        retencionesC.push({
          impuesto: impCode,
          impuestoNombre: getImpuestoNombre(impCode),
          tipoFactor: (r.TipoFactor || "Tasa") as "Tasa" | "Cuota" | "Exento",
          tasaOCuota: toNum(r.TasaOCuota, 0),
          base: toNum(r.Base, 0),
          importe: toNum(r.Importe, 0),
        });
      }
    }

    return {
      claveProdServ: String(c.ClaveProdServ || ""),
      noIdentificacion: c.NoIdentificacion ? String(c.NoIdentificacion) : undefined,
      cantidad: toNum(c.Cantidad, 1),
      claveUnidad: String(c.ClaveUnidad || "E48"),
      unidad: c.Unidad ? String(c.Unidad) : undefined,
      descripcion: String(c.Descripcion || ""),
      valorUnitario: toNum(c.ValorUnitario, 0),
      importe: toNum(c.Importe, 0),
      descuento: toNum(c.Descuento, 0),
      objetoImp: c.ObjetoImp ? String(c.ObjetoImp) : undefined,
      traslados: trasladosC,
      retenciones: retencionesC,
    };
  });

  // 5. Impuestos Globales y Desglose
  const impuestosNode = comp.Impuestos || {};
  const trasladosGlobales: ImpuestoDetalle[] = [];
  const retencionesGlobales: ImpuestoDetalle[] = [];

  let iva16 = 0;
  let iva8 = 0;
  let iva0 = 0;
  let ivaExento = 0;
  let retencionIsr = 0;
  let retencionIva = 0;
  let ieps = 0;

  // Analizar traslados a nivel concepto o global
  const trasGlobalRaw = ensureArray((impuestosNode.Traslados as Record<string, unknown>)?.Traslado as Record<string, unknown> | Record<string, unknown>[]);
  for (const t of trasGlobalRaw) {
    const impCode = String(t.Impuesto || "");
    const tasa = toNum(t.TasaOCuota, 0);
    const importe = toNum(t.Importe, 0);
    const base = toNum(t.Base, 0);

    trasladosGlobales.push({
      impuesto: impCode,
      impuestoNombre: getImpuestoNombre(impCode),
      tipoFactor: (t.TipoFactor || "Tasa") as "Tasa" | "Cuota" | "Exento",
      tasaOCuota: tasa,
      base,
      importe,
    });
  }

  // Si no había traslados globales explícitos, sumar de los conceptos
  const sourceTraslados = trasladosGlobales.length > 0 ? trasladosGlobales : conceptos.flatMap((c) => c.traslados);

  for (const t of sourceTraslados) {
    if (t.impuesto === "002") {
      // IVA
      if (t.tipoFactor === "Exento") {
        ivaExento += t.base;
      } else if (Math.abs(t.tasaOCuota - 0.16) < 0.005) {
        iva16 += t.importe;
      } else if (Math.abs(t.tasaOCuota - 0.08) < 0.005) {
        iva8 += t.importe;
      } else if (t.tasaOCuota === 0) {
        iva0 += t.base;
      }
    } else if (t.impuesto === "003") {
      ieps += t.importe;
    }
  }

  // Analizar retenciones
  const retGlobalRaw = ensureArray((impuestosNode.Retenciones as Record<string, unknown>)?.Retencion as Record<string, unknown> | Record<string, unknown>[]);
  for (const r of retGlobalRaw) {
    const impCode = String(r.Impuesto || "");
    const importe = toNum(r.Importe, 0);

    retencionesGlobales.push({
      impuesto: impCode,
      impuestoNombre: getImpuestoNombre(impCode),
      tipoFactor: "Tasa",
      tasaOCuota: toNum(r.TasaOCuota, 0),
      base: toNum(r.Base, 0),
      importe,
    });
  }

  const sourceRetenciones = retencionesGlobales.length > 0 ? retencionesGlobales : conceptos.flatMap((c) => c.retenciones);

  for (const r of sourceRetenciones) {
    if (r.impuesto === "001") {
      retencionIsr += r.importe;
    } else if (r.impuesto === "002") {
      retencionIva += r.importe;
    }
  }

  const totalImpuestosTrasladados = toNum(
    impuestosNode.TotalImpuestosTrasladados,
    iva16 + iva8 + ieps
  );
  const totalImpuestosRetenidos = toNum(
    impuestosNode.TotalImpuestosRetenidos,
    retencionIsr + retencionIva
  );

  // 6. Complemento de Pagos 2.0 / 1.0 (si aplica)
  const pagosNode = complementoNode.Pagos || {};
  const pagosRaw = ensureArray<any>(pagosNode.Pago || pagosNode.pago);
  const pagos: ComplementoPagoItem[] = pagosRaw.map((p: any) => {
    const drRaw = ensureArray<any>(p.DoctoRelacionado || p.doctoRelacionado);
    const docs: ComplementoPagoDocRelacionado[] = drRaw.map((dr: any) => ({
      idDocumento: String(dr.IdDocumento || dr.idDocumento || ""),
      serie: dr.Serie ? String(dr.Serie) : undefined,
      folio: dr.Folio ? String(dr.Folio) : undefined,
      monedaDR: String(dr.MonedaDR || "MXN"),
      numParcialidad: dr.NumParcialidad ? toNum(dr.NumParcialidad) : undefined,
      impSaldoAnt: dr.ImpSaldoAnt ? toNum(dr.ImpSaldoAnt) : undefined,
      impPagado: dr.ImpPagado ? toNum(dr.ImpPagado) : undefined,
      impSaldoInsoluto: dr.ImpSaldoInsoluto ? toNum(dr.ImpSaldoInsoluto) : undefined,
    }));

    return {
      fechaPago: String(p.FechaPago || p.fechaPago || ""),
      formaDePagoP: String(p.FormaDePagoP || p.formaDePagoP || "03"),
      monedaP: String(p.MonedaP || p.monedaP || "MXN"),
      monto: toNum(p.Monto || p.monto, 0),
      doctosRelacionados: docs,
    };
  });

  // 7. Auditoría de Lista Negra SAT (EFO)
  const efoDetalle = checkEfoRfc(emisor.rfc) || undefined;
  const esEfo = Boolean(efoDetalle);

  return {
    id: uuid || `${fileName}-${Date.now()}`,
    fileName,
    version,
    serie,
    folio,
    fecha,
    formaPago,
    metodoPago,
    lugarExpedicion,
    tipoDeComprobante,
    moneda,
    tipoCambio,
    subtotal,
    descuento,
    total,
    uuid,
    fechaTimbrado,
    rfcProvCertif,
    emisor,
    receptor,
    conceptos,
    impuestos: {
      totalImpuestosTrasladados,
      totalImpuestosRetenidos,
      traslados: sourceTraslados,
      retenciones: sourceRetenciones,
      iva16: Number(iva16.toFixed(2)),
      iva8: Number(iva8.toFixed(2)),
      iva0: Number(iva0.toFixed(2)),
      ivaExento: Number(ivaExento.toFixed(2)),
      retencionIsr: Number(retencionIsr.toFixed(2)),
      retencionIva: Number(retencionIva.toFixed(2)),
      ieps: Number(ieps.toFixed(2)),
    },
    pagos: pagos.length > 0 ? pagos : undefined,
    alertas: [],
    esEfo,
    efoDetalle,
  };
}
