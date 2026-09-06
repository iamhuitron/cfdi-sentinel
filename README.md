# CFDI Sentinel

<p align="left">
  <strong>Auditor Fiscal Digital y Conciliador de Facturas CFDI 4.0 / 3.3 en el Navegador</strong><br>
  Open-Source Client-Side System by <a href="https://github.com/iamhuitron"><strong>Ian Miguel Delgado Huitrón</strong></a> · Co-Founder at <a href="https://github.com/Xaol-Studio"><strong>@Xaol-Studio</strong></a>
</p>

<p align="left">
  <a href="https://xaol-website.vercel.app/demo/sat-sentinel.html"><img src="https://img.shields.io/badge/Live_Demo-xaol--website.vercel.app-059669?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/iamhuitron"><img src="https://img.shields.io/badge/Author-@iamhuitron-1e293b?style=flat-square&logo=github&logoColor=white" alt="Author" /></a>
  <a href="https://github.com/Xaol-Studio"><img src="https://img.shields.io/badge/Studio-@Xaol--Studio-059669?style=flat-square&logo=github&logoColor=white" alt="Studio" /></a>
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side%20In--Memory-blue?style=flat-square" alt="Privacy" />
  <img src="https://img.shields.io/badge/SAT-CFDI%204.0%20%2F%20Art.%2069--B-orange?style=flat-square" alt="SAT" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="License" /></a>
</p>

> 💡 **Ecosistema Fiscal — ¿Buscas el motor en Python o CLI para servidores y ERPs?**  
> Conoce **[CFDI SAT Engine](https://github.com/iamhuitron/cfdi-sat-engine)**: El motor complementario de línea de comandos en Python 3.10+ (cero dependencias externas) diseñado para auditorías batch masivas de miles de XMLs en procesos desatendidos, tareas cron y pipelines backend.


---

## 📌 ¿Qué es CFDI Sentinel?

**CFDI Sentinel** es una plataforma web de auditoría fiscal y analítica contable diseñada para contribuyentes, despachos contables y profesionistas en México. Permite arrastrar paquetes `.zip` o carpetas de facturas electrónicas `.xml` (CFDI 4.0 y 3.3) emitidas y recibidas del SAT para obtener una auditoría profunda e instantánea **directamente en el navegador**.

> **Garantía de Privacidad Absoluta:**  
> A diferencia de los sistemas contables tradicionales en la nube donde subes tus secretos financieros a servidores de terceros, CFDI Sentinel procesa, descomprime y audita tus archivos **100% en la memoria de tu navegador**. Ningún archivo, RFC o monto sale de tu dispositivo.

---

## ✨ Características Principales

### 1. 🔍 Extracción y Normalización XML (CFDI 4.0 & 3.3)
- Procesamiento en memoria de archivos sueltos `.xml` o archivos comprimidos `.zip` con cientos de facturas mediante `fast-xml-parser` y `jszip`.
- Compatible con todos los tipos de comprobantes fiscales:
  - **Ingreso (I):** Facturación ordinaria, honorarios y arrendamiento.
  - **Egreso (E):** Notas de crédito y bonificaciones.
  - **Nómina (N):** Recibos de sueldos y salarios.
  - **Pago (P):** Complementos de Recepción de Pagos (REP 2.0 y 1.0).

### 2. 🚨 Auditoría de Listas Negras del SAT (Art. 69-B del CFF)
- Cruce automático y fuera de línea contra la base de datos de **Empresas que Facturan Operaciones Simuladas (EFOS / Factureras)**.
- Detección inmediata si algún proveedor está catalogado por el SAT en situación:
  - **Definitivo:** Alerta crítica de riesgo legal/penal (operaciones sin efecto fiscal).
  - **Presunto:** En procedimiento de investigación administrativa.
  - **Desvirtuado / Sentencia Favorable:** Casos aclarados ante la autoridad.
- Incluye un buscador interactivo para consultar cualquier RFC directamente contra la lista negra sin necesidad de cargar comprobantes.

### 3. 🧮 Motor de Reglas Fiscales y Detección de Anomalías
- **Discrepancia Aritmética:** Valida que `Subtotal - Descuento + Traslados - Retenciones == Total` con tolerancia de centavos según las guías del Anexo 20 del SAT.
- **Validación de RFCs:** Verificación con la expresión regular oficial del SAT tanto para personas físicas (13 caracteres) como morales (12 caracteres).
- **Inconsistencia de Método y Forma de Pago:** Detecta facturas marcadas como `PUE` con forma de pago `99 (Por definir)` y facturas `PPD` pendientes de cobro/pago.
- **Timbrado Extemporáneo:** Alerta si la fecha de certificación del PAC excede el plazo legal reglamentario de 72 horas respecto a la emisión.
- **Duplicidad de Folio Fiscal:** Identificación de UUIDs repetidos en el lote para prevenir doble contabilización.

### 4. 📊 Conciliación de Impuestos y Módulo DIOT
- Cálculo exacto de:
  - **IVA Trasladado (Cobrado)** desglosado por tasa (16%, 8% fronterizo, 0%, Exento).
  - **IVA Acreditable (Pagado en gastos deducibles)** excluyendo operaciones con EFOS en firme.
  - **Retenciones de ISR** (RESICO 1.25%, servicios profesionales 10%, etc.) y retenciones de IVA.
  - **Saldo Estimado del Periodo:** IVA por enterar o saldo a favor.
- **Cédula Resumen para DIOT:** Agrupación automática de todas las compras y gastos por RFC de proveedor, calculando bases gravables para la Declaración Informativa de Operaciones con Terceros.

### 5. 📑 Exportación Contable a Excel (.xlsx)
Genera con un solo clic un libro de trabajo en Excel multipestaña que incluye:
- **Resumen Ejecutivo:** KPIs financieros, conciliación impositiva y diagnóstico de riesgo.
- **Cédula de Comprobantes:** Detalle exhaustivo línea por línea con folios, UUIDs, desgloses y alertas.
- **Cédula DIOT:** Tabla lista para la precarga y revisión de proveedores.
- **Alertas y Riesgos:** Bitácora clasificada por severidad e impacto fiscal.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) | Arquitectura modular React moderna |
| **Biblioteca UI** | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) | Interfaz editorial oscura de alta legibilidad |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Iconos vectoriales limpios y consistentes |
| **Motor de Parseo XML** | [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) | Extracción de alta velocidad sin dependencias nativas pesadas |
| **Descompresión en Navegador** | [JSZip](https://stuk.github.io/jszip/) | Descompresión client-side de paquetes `.zip` de facturas |
| **Motor de Hojas de Cálculo** | [SheetJS (xlsx)](https://sheetjs.com/) | Generación y descarga de libros Excel (.xlsx) |
| **Pruebas Automatizadas** | [Vitest](https://vitest.dev/) | Suite completa de pruebas unitarias y de integración |

---

## 📁 Estructura del Proyecto

```
cfdi-sentinel/
├── app/
│   ├── layout.tsx                # Shell de la app con tema oscuro
│   ├── page.tsx                  # Dashboard principal de auditoría
│   └── globals.css               # Estilos globales y utilidades Tailwind
├── components/
│   ├── Header.tsx                # Barra superior con sellos de privacidad y accesos
│   ├── Dropzone.tsx              # Zona drag-and-drop con extractor de ZIPs y demo
│   ├── FiscalKpiCards.tsx        # Métricas principales (Ingresos, Gastos, IVA, Estatus)
│   ├── AnomalyAlerts.tsx         # Panel de anomalías y alertas del SAT
│   ├── CfdiTable.tsx             # Tabla interactiva con filtros, búsqueda y conceptos
│   ├── DiotSummaryTable.tsx      # Cédula agrupada para la DIOT
│   └── EfoLookupModal.tsx        # Buscador directo del Art. 69-B del SAT
├── lib/
│   ├── types.ts                  # Esquemas de TypeScript para CFDI, Impuestos y Auditoría
│   ├── parser/
│   │   ├── cfdi-parser.ts        # Parser normalizador de XML CFDI 4.0 y 3.3
│   │   └── zip-reader.ts         # Descompresión y lectura de archivos en memoria
│   ├── audit/
│   │   ├── rules.ts              # Reglas de validación fiscal y anomalías
│   │   ├── efo-checker.ts        # Verificador O(1) de listas negras del SAT
│   │   └── tax-calculator.ts     # Conciliación de IVA/ISR y agregación DIOT
│   ├── export/
│   │   └── excel-exporter.ts     # Generador del libro Excel (.xlsx) multipestaña
│   └── data/
│       ├── sat-blacklist.json    # Base de datos local de EFOS del Art. 69-B
│       └── sample-cfdis.ts       # Lote sintético con 6 facturas de demostración
└── tests/
    ├── cfdi-parser.test.ts       # Pruebas de parseo de CFDI 4.0, RESICO y nómina
    ├── audit-rules.test.ts       # Pruebas de detección de EFOS y errores aritméticos
    └── tax-calculator.test.ts    # Pruebas de conciliación de impuestos y DIOT
```

---

## 🚀 Instalación y Uso Local

### Prerrequisitos
- Node.js 18+ (probado en Node.js 20 LTS)
- npm o pnpm

### Pasos

1. Clonar el repositorio:
```bash
git clone https://github.com/iamhuitron/cfdi-sentinel.git
cd cfdi-sentinel
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🧪 Pruebas Automatizadas

El proyecto incluye 10 pruebas unitarias con Vitest que verifican la precisión del parser XML, las fórmulas del SAT y la detección de listas negras:

```bash
# Ejecutar la suite completa de pruebas
npm test

# Ejecutar el chequeo de tipos de TypeScript
npx tsc --noEmit

# Compilar para producción
npm run build
```

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más información.
