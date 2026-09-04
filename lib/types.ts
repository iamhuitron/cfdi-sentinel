/**
 * Modelos de datos para CFDI 4.0 / 3.3 y Motor de Auditoría Fiscal
 */

export type TipoDeComprobante = "I" | "E" | "T" | "N" | "P";

export interface ImpuestoDetalle {
  impuesto: string; // '001' ISR, '002' IVA, '003' IEPS
  impuestoNombre: "ISR" | "IVA" | "IEPS" | string;
  tipoFactor: "Tasa" | "Cuota" | "Exento";
  tasaOCuota: number;
  base: number;
  importe: number;
}

export interface ConceptoItem {
  claveProdServ: string;
  noIdentificacion?: string;
  cantidad: number;
  claveUnidad: string;
  unidad?: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  descuento: number;
  objetoImp?: string;
  traslados: ImpuestoDetalle[];
  retenciones: ImpuestoDetalle[];
}

export interface ComplementoPagoDocRelacionado {
  idDocumento: string; // UUID de factura vinculada
  serie?: string;
  folio?: string;
  monedaDR: string;
  numParcialidad?: number;
  impSaldoAnt?: number;
  impPagado?: number;
  impSaldoInsoluto?: number;
}

export interface ComplementoPagoItem {
  fechaPago: string;
  formaDePagoP: string;
  monedaP: string;
  monto: number;
  doctosRelacionados: ComplementoPagoDocRelacionado[];
}

export type AuditSeverity = "critical" | "warning" | "info";

export interface AuditAlert {
  id: string;
  code: string;
  severity: AuditSeverity;
  title: string;
  description: string;
  impact?: string;
}

export interface EfoRecord {
  rfc: string;
  nombre: string;
  situacion: "Definitivo" | "Presunto" | "Desvirtuado" | "Sentencia Favorable";
  numeroOficio?: string;
  fechaPublicacionDof: string;
}

export interface CfdiData {
  id: string;
  fileName: string;
  version: "3.3" | "4.0" | string;
  serie?: string;
  folio?: string;
  fecha: string;
  formaPago?: string;
  metodoPago?: "PUE" | "PPD" | string;
  lugarExpedicion: string;
  tipoDeComprobante: TipoDeComprobante;
  moneda: string;
  tipoCambio: number;
  subtotal: number;
  descuento: number;
  total: number;
  uuid: string;
  fechaTimbrado?: string;
  rfcProvCertif?: string;
  emisor: {
    rfc: string;
    nombre: string;
    regimenFiscal: string;
  };
  receptor: {
    rfc: string;
    nombre: string;
    domicilioFiscalReceptor?: string;
    regimenFiscalReceptor?: string;
    usoCFDI: string;
  };
  conceptos: ConceptoItem[];
  impuestos: {
    totalImpuestosTrasladados: number;
    totalImpuestosRetenidos: number;
    traslados: ImpuestoDetalle[];
    retenciones: ImpuestoDetalle[];
    iva16: number;
    iva8: number;
    iva0: number;
    ivaExento: number;
    retencionIsr: number;
    retencionIva: number;
    ieps: number;
  };
  pagos?: ComplementoPagoItem[];
  alertas: AuditAlert[];
  esEfo: boolean;
  efoDetalle?: EfoRecord;
}

export interface DiotProvider {
  rfc: string;
  nombre: string;
  tipoTercero: "04" | "05" | "15"; // Proveedor Nacional, Extranjero, Global
  tipoOperacion: "03" | "06" | "85"; // Prestación de Servicios, Otros, etc.
  base16: number;
  iva16: number;
  base8: number;
  iva8: number;
  base0: number;
  baseExento: number;
  ivaRetenido: number;
  totalCompras: number;
  numComprobantes: number;
}

export interface FiscalSummary {
  totalComprobantes: number;
  totalIngresos: number;
  totalGastos: number;
  totalNomina: number;
  totalPagos: number;
  totalNotasCredito: number;
  ivaTrasladadoTotal: number;
  ivaAcreditableTotal: number;
  ivaRetenidoTotal: number;
  ivaPorPagarEstimado: number;
  retencionesIsrTotal: number;
  efosDetectados: number;
  discrepanciasDetectadas: number;
  alertasCriticas: number;
}
