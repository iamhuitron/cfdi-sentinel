import { describe, it, expect } from "vitest";
import { parseCfdiXml } from "@/lib/parser/cfdi-parser";
import { SAMPLE_CFDIS } from "@/lib/data/sample-cfdis";

describe("CFDI 4.0 XML Parser", () => {
  it("debe parsear correctamente una factura de ingreso con IVA 16%", () => {
    const sample = SAMPLE_CFDIS[0];
    const cfdi = parseCfdiXml(sample.xml, sample.fileName);

    expect(cfdi.version).toBe("4.0");
    expect(cfdi.serie).toBe("F");
    expect(cfdi.folio).toBe("1001");
    expect(cfdi.tipoDeComprobante).toBe("I");
    expect(cfdi.subtotal).toBe(25000);
    expect(cfdi.total).toBe(29000);
    expect(cfdi.emisor.rfc).toBe("HUID990715XX1");
    expect(cfdi.receptor.rfc).toBe("DIG080512AB3");
    expect(cfdi.uuid).toBe("4A2B891E-9C21-4E80-87F1-D7A04B3E0001");
    expect(cfdi.impuestos.iva16).toBe(4000);
    expect(cfdi.conceptos).toHaveLength(1);
    expect(cfdi.conceptos[0].claveProdServ).toBe("81111508");
  });

  it("debe procesar retenciones de ISR y de IVA en régimen RESICO", () => {
    const sample = SAMPLE_CFDIS[1];
    const cfdi = parseCfdiXml(sample.xml, sample.fileName);

    expect(cfdi.subtotal).toBe(18000);
    expect(cfdi.impuestos.iva16).toBe(2880);
    expect(cfdi.impuestos.retencionIsr).toBe(225);
    expect(cfdi.impuestos.retencionIva).toBe(1920);
    expect(cfdi.total).toBe(18735);
  });

  it("debe identificar a un emisor que se encuentra en la lista negra del SAT (EFO)", () => {
    const sample = SAMPLE_CFDIS[3]; // G-9901_ALERTA_EFO_69B.xml
    const cfdi = parseCfdiXml(sample.xml, sample.fileName);

    expect(cfdi.esEfo).toBe(true);
    expect(cfdi.efoDetalle).toBeDefined();
    expect(cfdi.efoDetalle?.rfc).toBe("GOC9303256A2");
    expect(cfdi.efoDetalle?.situacion).toBe("Definitivo");
  });

  it("debe lanzar error controlado si el XML está vacío o no es un CFDI válido", () => {
    expect(() => parseCfdiXml("<archivo>invalido</archivo>")).toThrow(
      "El archivo XML no contiene el nodo raíz <Comprobante>"
    );
  });
});
