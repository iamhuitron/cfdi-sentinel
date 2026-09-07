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

  it("debe lanzar error si el contenido XML es inválido o vacío", () => {
    // @ts-expect-error probando error de tipado
    expect(() => parseCfdiXml("")).toThrow("Contenido XML inválido o vacío");
    // @ts-expect-error probando error de tipado
    expect(() => parseCfdiXml(null)).toThrow("Contenido XML inválido o vacío");
  });

  it("debe manejar CFDI con impuestos al 8%, 0%, exento y IEPS", () => {
    const xml = `
      <Comprobante Version="4.0" Total="1000">
        <Conceptos>
          <Concepto Importe="100">
            <Impuestos>
              <Traslados>
                <Traslado Impuesto="002" TipoFactor="Exento" Base="100" />
                <Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.080000" Importe="8" Base="100" />
                <Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.000000" Importe="0" Base="100" />
                <Traslado Impuesto="003" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="16" Base="100" />
                <Traslado Impuesto="004" TipoFactor="Tasa" TasaOCuota="0.100000" Importe="10" Base="100" />
              </Traslados>
            </Impuestos>
          </Concepto>
        </Conceptos>
      </Comprobante>
    `;
    const cfdi = parseCfdiXml(xml);
    expect(cfdi.impuestos.ivaExento).toBe(100);
    expect(cfdi.impuestos.iva8).toBe(8);
    expect(cfdi.impuestos.iva0).toBe(100); // iva0 is calculated by base
    expect(cfdi.impuestos.ieps).toBe(16);
    expect(cfdi.impuestos.traslados.find(t => t.impuesto === '004')?.impuestoNombre).toBe('004'); // default case in getImpuestoNombre
  });

  it("debe parsear Complemento de Pagos", () => {
    const xml = `
      <Comprobante Version="4.0">
        <Complemento>
          <Pagos>
            <Pago FechaPago="2023-01-01T12:00:00" FormaDePagoP="03" MonedaP="MXN" Monto="1000">
              <DoctoRelacionado IdDocumento="12345678-1234-1234-1234-123456789012" Serie="A" Folio="1" MonedaDR="MXN" NumParcialidad="1" ImpSaldoAnt="1000" ImpPagado="1000" ImpSaldoInsoluto="0" />
              <DoctoRelacionado IdDocumento="87654321-4321-4321-4321-210987654321" />
            </Pago>
          </Pagos>
        </Complemento>
      </Comprobante>
    `;
    const cfdi = parseCfdiXml(xml);
    expect(cfdi.pagos).toBeDefined();
    expect(cfdi.pagos![0].monto).toBe(1000);
    expect(cfdi.pagos![0].doctosRelacionados[0].idDocumento).toBe("12345678-1234-1234-1234-123456789012");
    expect(cfdi.pagos![0].doctosRelacionados[0].serie).toBe("A");
    expect(cfdi.pagos![0].doctosRelacionados[0].folio).toBe("1");
    expect(cfdi.pagos![0].doctosRelacionados[1].idDocumento).toBe("87654321-4321-4321-4321-210987654321");
    expect(cfdi.pagos![0].doctosRelacionados[1].serie).toBeUndefined();
  });

  it("debe manejar nodos faltantes, malformados y default fallbacks", () => {
    const xml = `
      <Comprobante>
        <!-- faltan casi todos los atributos -->
        <Emisor />
        <Receptor />
        <Conceptos>
          <Concepto AtributoCualquiera="1"></Concepto>
        </Conceptos>
        <Impuestos>
          <!-- Traslados a nivel global pero malformado -->
          <Traslados>
            <Traslado Impuesto="002" />
          </Traslados>
          <Retenciones>
            <Retencion Impuesto="001" />
          </Retenciones>
        </Impuestos>
      </Comprobante>
    `;
    const cfdi = parseCfdiXml(xml);
    expect(cfdi.version).toBe("4.0"); // fallback
    expect(cfdi.emisor.nombre).toBe("Emisor no especificado");
    expect(cfdi.receptor.nombre).toBe("Receptor no especificado");
    expect(cfdi.conceptos).toBeDefined();
    expect(cfdi.conceptos.length).toBeGreaterThan(0);
    expect(cfdi.conceptos[0].cantidad).toBe(1); // default cantidad
    expect(cfdi.conceptos[0].claveUnidad).toBe("E48");
  });
});
