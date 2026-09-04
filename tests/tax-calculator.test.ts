import { describe, it, expect } from "vitest";
import { parseCfdiXml } from "@/lib/parser/cfdi-parser";
import { auditBatchCfdis } from "@/lib/audit/rules";
import { calculateFiscalSummary, generateDiotSummary } from "@/lib/audit/tax-calculator";
import { SAMPLE_CFDIS } from "@/lib/data/sample-cfdis";

describe("Calculadora y Conciliador Fiscal", () => {
  const parsed = SAMPLE_CFDIS.map((s) => parseCfdiXml(s.xml, s.fileName));
  const batch = auditBatchCfdis(parsed);

  it("debe calcular el resumen fiscal consolidado identificando ingresos y gastos", () => {
    // HUID990715XX1 es el RFC del contribuyente en las muestras
    const summary = calculateFiscalSummary(batch, "HUID990715XX1");

    expect(summary.totalComprobantes).toBe(6);
    expect(summary.totalIngresos).toBeGreaterThan(0);
    expect(summary.totalGastos).toBeGreaterThan(0);
    expect(summary.ivaTrasladadoTotal).toBeGreaterThan(0);
    expect(summary.ivaAcreditableTotal).toBeGreaterThan(0);
    expect(summary.efosDetectados).toBe(1);
    expect(summary.discrepanciasDetectadas).toBe(1);
  });

  it("debe agrupar los gastos de proveedores en formato de cédula DIOT", () => {
    const diot = generateDiotSummary(batch, "HUID990715XX1");

    expect(diot.length).toBeGreaterThan(0);
    // Debe incluir el proveedor de nube
    const cloudProvider = diot.find((p) => p.rfc === "CLO160101XYZ");
    expect(cloudProvider).toBeDefined();
    expect(cloudProvider?.totalCompras).toBe(4872);
    expect(cloudProvider?.iva16).toBe(672);
  });
});
