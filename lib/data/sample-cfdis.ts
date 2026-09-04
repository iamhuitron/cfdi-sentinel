/**
 * Lote sintético pero fiel al estándar CFDI 4.0 del SAT para pruebas y demostración instantánea
 */

export const SAMPLE_CFDIS = [
  // 1. Ingreso ordinario PUE con IVA 16% (Consultoría y Desarrollo)
  {
    fileName: "F-1001_Desarrollo_Software.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="F" Folio="1001" Fecha="2025-02-10T11:20:00" FormaPago="03" SubTotal="25000.00" Descuento="0.00" Moneda="MXN" Total="29000.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="54700">
  <cfdi:Emisor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" RegimenFiscal="612"/>
  <cfdi:Receptor Rfc="DIG080512AB3" Nombre="DIGITAL SOLUCIONES EMPRESARIALES SA DE CV" DomicilioFiscalReceptor="06700" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="81111508" Cantidad="1" ClaveUnidad="E48" Descripcion="Desarrollo e implementación de arquitectura de software y optimizadores" ValorUnitario="25000.00" Importe="25000.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="25000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="4000.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="4000.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="25000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="4000.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="4A2B891E-9C21-4E80-87F1-D7A04B3E0001" FechaTimbrado="2025-02-10T11:22:15" RfcProvCertif="SAT970701NN3"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },

  // 2. Ingreso RESICO con retención de ISR (1.25%) y retención de IVA (10.6667%)
  {
    fileName: "F-1002_Servicios_Fiscales_RESICO.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="F" Folio="1002" Fecha="2025-02-15T14:30:00" FormaPago="03" SubTotal="18000.00" Descuento="0.00" Moneda="MXN" Total="18735.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="54700">
  <cfdi:Emisor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" RegimenFiscal="626"/>
  <cfdi:Receptor Rfc="KOR190412MN5" Nombre="KOREA MEXICO TRADE CONSULTING SA DE CV" DomicilioFiscalReceptor="03100" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111500" Cantidad="1" ClaveUnidad="E48" Descripcion="Auditoría contable y conciliación de CFDI 4.0 para personas morales" ValorUnitario="18000.00" Importe="18000.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="18000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="2880.00"/>
        </cfdi:Traslados>
        <cfdi:Retenciones>
          <cfdi:Retencion Base="18000.00" Impuesto="001" TipoFactor="Tasa" TasaOCuota="0.012500" Importe="225.00"/>
          <cfdi:Retencion Base="18000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.106667" Importe="1920.00"/>
        </cfdi:Retenciones>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="2880.00" TotalImpuestosRetenidos="2145.00">
    <cfdi:Retenciones>
      <cfdi:Retencion Impuesto="001" Importe="225.00"/>
      <cfdi:Retencion Impuesto="002" Importe="1920.00"/>
    </cfdi:Retenciones>
    <cfdi:Traslados>
      <cfdi:Traslado Base="18000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="2880.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="6C3D902F-1A34-4F91-98B2-E8B15C4F0002" FechaTimbrado="2025-02-15T14:32:00" RfcProvCertif="SAT970701NN3"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },

  // 3. Gasto legítimo deducible: Proveedor tecnológico seguro
  {
    fileName: "G-8821_Servidores_Cloud.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="INV" Folio="8821" Fecha="2025-02-05T09:00:00" FormaPago="04" SubTotal="4200.00" Descuento="0.00" Moneda="MXN" Total="4872.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="06600">
  <cfdi:Emisor Rfc="CLO160101XYZ" Nombre="CLOUD INFRASTRUCTURE SERVICES MEXICO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" DomicilioFiscalReceptor="54700" RegimenFiscalReceptor="612" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="81112105" Cantidad="1" ClaveUnidad="E48" Descripcion="Infraestructura de servidores dedicados y almacenamiento en la nube para aplicaciones" ValorUnitario="4200.00" Importe="4200.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="4200.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="672.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="672.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="4200.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="672.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="7E4A013A-2B45-4A92-89C3-F9C26D5A0003" FechaTimbrado="2025-02-05T09:05:00" RfcProvCertif="PAC010101PAC"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },

  // 4. ALERTA CRÍTICA: Gasto emitido por un EFO en LISTA NEGRA (Art. 69-B Definitivo)
  {
    fileName: "G-9901_ALERTA_EFO_69B.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="A" Folio="9901" Fecha="2025-02-18T16:45:00" FormaPago="03" SubTotal="35000.00" Descuento="0.00" Moneda="MXN" Total="40600.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="06720">
  <cfdi:Emisor Rfc="GOC9303256A2" Nombre="GRUPO COMERCIALIZADOR DEL CENTRO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" DomicilioFiscalReceptor="54700" RegimenFiscalReceptor="612" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="80101500" Cantidad="1" ClaveUnidad="E48" Descripcion="Consultoría en gestión de procesos y auditoría administrativa corporativa" ValorUnitario="35000.00" Importe="35000.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="35000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="5600.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="5600.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="35000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="5600.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="8F5B124B-3C56-4B03-90D4-0AD37E6B0004" FechaTimbrado="2025-02-18T16:47:00" RfcProvCertif="PAC010101PAC"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },

  // 5. ALERTA ARITMÉTICA: Inconsistencia entre suma de impuestos y total
  {
    fileName: "F-5502_ALERTA_DISCREPANCIA_TOTAL.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="ERR" Folio="5502" Fecha="2025-02-22T12:00:00" FormaPago="03" SubTotal="10000.00" Descuento="0.00" Moneda="MXN" Total="14500.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="54700">
  <cfdi:Emisor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" RegimenFiscal="612"/>
  <cfdi:Receptor Rfc="TES090909AAA" Nombre="TECNOLOGIAS EDUCATIVAS DEL SURESTE SA DE CV" DomicilioFiscalReceptor="97000" RegimenFiscalReceptor="601" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="86141500" Cantidad="1" ClaveUnidad="E48" Descripcion="Capacitación y talleres de informática para docentes" ValorUnitario="10000.00" Importe="10000.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="10000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="1600.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="1600.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="10000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="1600.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="9A6C235C-4D67-4C14-01E5-1BE48F7C0005" FechaTimbrado="2025-02-22T12:02:00" RfcProvCertif="SAT970701NN3"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },

  // 6. Egreso: Nota de crédito sobre factura
  {
    fileName: "NC-201_Descuento_Volumen.xml",
    xml: `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="4.0" Serie="NC" Folio="201" Fecha="2025-02-25T17:00:00" FormaPago="03" SubTotal="2000.00" Descuento="0.00" Moneda="MXN" Total="2320.00" TipoDeComprobante="E" Exportacion="01" MetodoPago="PUE" LugarExpedicion="54700">
  <cfdi:Emisor Rfc="HUID990715XX1" Nombre="IAN MIGUEL DELGADO HUITRON" RegimenFiscal="612"/>
  <cfdi:Receptor Rfc="DIG080512AB3" Nombre="DIGITAL SOLUCIONES EMPRESARIALES SA DE CV" DomicilioFiscalReceptor="06700" RegimenFiscalReceptor="601" UsoCFDI="G02"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Bonificación comercial por volumen en servicios de consultoría técnica" ValorUnitario="2000.00" Importe="2000.00" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="2000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="320.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="320.00">
    <cfdi:Traslados>
      <cfdi:Traslado Base="2000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="320.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="0B7D346D-5E78-4D25-12F6-2CF59A8D0006" FechaTimbrado="2025-02-25T17:05:00" RfcProvCertif="SAT970701NN3"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`,
  },
];
