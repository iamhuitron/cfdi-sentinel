import { describe, it, expect } from "vitest";
import { parseCfdiXml } from "@/lib/parser/cfdi-parser";
import { auditIndividualCfdi, auditBatchCfdis, RFC_REGEX } from "@/lib/audit/rules";
import { SAMPLE_CFDIS } from "@/lib/data/sample-cfdis";

describe("Motor de Reglas de Auditoría Fiscal", () => {
  it("debe validar RFCs con la expresión regular oficial del SAT", () => {
    expect(RFC_REGEX.test("HUID990715XX1")).toBe(true); // Persona física
    expect(RFC_REGEX.test("DIG080512AB3")).toBe(true);  // Persona moral
    expect(RFC_REGEX.test("RFC_INVALIDO_123")).toBe(false);
    expect(RFC_REGEX.test("123456789012")).toBe(false);
  });

  it("debe generar alerta crítica ante un proveedor EFO del Art. 69-B", () => {
    const sample = SAMPLE_CFDIS[3];
    const cfdi = parseCfdiXml(sample.xml, sample.fileName);
    const alerts = auditIndividualCfdi(cfdi);

    const efoAlert = alerts.find((a) => a.code === "SAT_69B_EFO");
    expect(efoAlert).toBeDefined();
    expect(efoAlert?.severity).toBe("critical");
    expect(efoAlert?.title).toContain("Definitivo");
  });

  it("debe detectar discrepancias aritméticas en el cálculo del Total", () => {
    const sample = SAMPLE_CFDIS[4]; // Factura con total intencionalmente alterado a $14,500
    const cfdi = parseCfdiXml(sample.xml, sample.fileName);
    const alerts = auditIndividualCfdi(cfdi);

    const arithAlert = alerts.find((a) => a.code === "ARITHMETIC_MISMATCH");
    expect(arithAlert).toBeDefined();
    expect(arithAlert?.severity).toBe("critical");
    expect(arithAlert?.description).toContain("Diferencia:");
  });

  it("debe detectar UUIDs duplicados en un lote", () => {
    const sample = SAMPLE_CFDIS[0];
    const cfdi1 = parseCfdiXml(sample.xml, "archivo1.xml");
    const cfdi2 = parseCfdiXml(sample.xml, "archivo2.xml"); // Mismo UUID

    const audited = auditBatchCfdis([cfdi1, cfdi2]);

    expect(audited[0].alertas.some((a) => a.code === "DUPLICATE_UUID")).toBe(true);
    expect(audited[1].alertas.some((a) => a.code === "DUPLICATE_UUID")).toBe(true);
  });
});
