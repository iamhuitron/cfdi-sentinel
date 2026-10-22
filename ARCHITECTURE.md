# 🏛️ CFDI Sentinel Architecture & System Topology

Privacy-first, client-side fiscal auditing web application and SAT Article 69-B (EFOS) blacklist sentinel for Mexican CFDI 4.0 XML invoices and bulk ZIP files. Built with Next.js 15, TypeScript, Tailwind CSS, Fast XML Parser, SheetJS, and Vitest.

---

## 1. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) & React 19 | Client-rendered privacy-first architecture (zero server telemetry) |
| **Language** | TypeScript 5 (Strict Mode) | Full type definitions for CFDI 4.0 vouchers, taxes, and EFOS states |
| **Parsing Engine** | `fast-xml-parser` & `jszip` | In-memory XML traversal, namespace handling, and chunked ZIP decompression |
| **Regulatory Engine** | SAT Art. 69-B / Anexo 20 | O(1) hash cross-referencing against official SAT blacklists and tax math rules |
| **Export & Reporting**| SheetJS (`xlsx`) | Formatted multi-tab Excel workbooks (audit trail, DIOT, EFOS alerts) |
| **Testing** | Vitest | Unit tests covering Anexo 20 tolerance limits, tax math, and EFO detection |

---

## 2. System Topology & Component Graph

```mermaid
flowchart TD
    subgraph ClientDrop["User Ingestion"]
        Files["CFDI 4.0 XML Files / Bulk ZIPs"]
        Dropzone["Dropzone Component (components/Dropzone.tsx)"]
    end

    subgraph MemoryEngine["Client-Side Processing Engine (lib/)"]
        ZipReader["ZIP Decompressor (lib/parser/zip-reader.ts)"]
        XmlParser["CFDI Parser (lib/parser/cfdi-parser.ts)"]
        AuditRules["Anexo 20 Math & Duplicate Auditor (lib/audit/rules.ts)"]
        EfoChecker["SAT Art. 69-B Checker (lib/audit/efo-checker.ts)"]
        TaxCalc["DIOT & VAT Reconciler (lib/audit/tax-calculator.ts)"]
    end

    subgraph DataStore["In-Memory State"]
        Blacklist["Official SAT Blacklist (lib/data/sat-blacklist.json)"]
        AuditedInvoices["Parsed & Validated Invoice State"]
    end

    subgraph UIComponents["Analytical UI (components/)"]
        KPIs["Fiscal KPI Cards (components/FiscalKpiCards.tsx)"]
        Alerts["Anomaly Alerts Banner (components/AnomalyAlerts.tsx)"]
        Table["Interactive CFDI Table (components/CfdiTable.tsx)"]
        Diot["DIOT Compliance Summary (components/DiotSummaryTable.tsx)"]
        Modal["EFO Lookup Inspector (components/EfoLookupModal.tsx)"]
    end

    subgraph Export["Deliverables"]
        Excel["Multi-Sheet Excel Workbook (.xlsx)"]
    end

    Files --> Dropzone
    Dropzone --> ZipReader
    ZipReader --> XmlParser
    XmlParser --> AuditedInvoices
    AuditedInvoices --> AuditRules
    AuditedInvoices --> EfoChecker
    Blacklist --> EfoChecker
    AuditedInvoices --> TaxCalc
    AuditRules --> Alerts
    EfoChecker --> Modal
    TaxCalc --> KPIs
    TaxCalc --> Diot
    AuditedInvoices --> Table
    Table --> Excel
```

---

## 3. Data Processing Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Accountant as Tax Auditor / Business Owner
    participant Browser as Browser UI (Dropzone)
    participant Worker as In-Memory Parser (JSZip / Fast XML)
    participant EFO as SAT 69-B Hash Map
    participant Rules as Anexo 20 Engine
    participant UI as Dashboard View

    Accountant->>Browser: Drops 500 CFDI XMLs / ZIP file
    Browser->>Worker: Decompress and parse XML nodes (0 server calls)
    Worker->>Worker: Extract UUID, RFC Emisor/Receptor, Conceptos, Impuestos
    Worker->>EFO: Check RFC against Art. 69-B blacklist (Definitivo / Presunto)
    Worker->>Rules: Validate |Subtotal - Descuento + Traslados - Retenciones - Total| <= $0.01
    Worker->>Rules: Check for duplicate UUIDs across batch
    Worker-->>UI: Populate React state with audited vouchers
    UI->>UI: Render Net VAT, DIOT breakdown, and red EFOS alerts
    Accountant->>UI: Clicks "Exportar Auditoría a Excel"
    UI->>Browser: Generate and download formatted .xlsx workbook
```

---

## 4. Directory Structure & Module Breakdown

```
cfdi-sentinel/
├── app/                      # Next.js App Router entrypoints
│   ├── globals.css           # Tailwind CSS styles and custom UI tokens
│   ├── layout.tsx            # Root layout and metadata
│   └── page.tsx              # Main dashboard compiling Dropzone, KPIs, and Tables
├── components/               # React UI components
│   ├── Dropzone.tsx          # Drag-and-drop XML/ZIP file ingestion
│   ├── FiscalKpiCards.tsx    # Total revenue, expenses, Net VAT, and risk counters
│   ├── AnomalyAlerts.tsx     # Color-coded banners for tax drift and blacklisted suppliers
│   ├── CfdiTable.tsx         # Filterable, sortable table of all processed invoices
│   ├── DiotSummaryTable.tsx  # Taxpayer DIOT VAT rate breakdown (16%, 8%, 0%, Exento)
│   ├── EfoLookupModal.tsx    # Modal to inspect legal status of flagged suppliers
│   └── Header.tsx            # Top branding and status bar
├── lib/                      # Core business and domain logic
│   ├── parser/               # XML and ZIP file decoders
│   │   ├── cfdi-parser.ts    # CFDI 4.0 schema parser, namespace handling, dates
│   │   └── zip-reader.ts     # In-memory ZIP archive decompression
│   ├── audit/                # Regulatory and algorithmic rules
│   │   ├── efo-checker.ts    # O(1) RFC lookup against SAT Art. 69-B records
│   │   ├── rules.ts          # Anexo 20 arithmetic tolerance, duplicate UUID detection
│   │   └── tax-calculator.ts # VAT transfer/withholding reconciliation & DIOT formulas
│   ├── export/               # Workbook builders
│   │   └── excel-exporter.ts # SheetJS multi-tab Excel workbook generator
│   ├── data/                 # Datasets
│   │   └── sat-blacklist.json# Offline snapshot of official SAT EFOS list
│   └── types.ts              # Strict TypeScript definitions
├── tests/                    # Vitest unit test suite
│   ├── audit-rules.test.ts   # Anexo 20 tolerance and duplication tests
│   ├── cfdi-parser.test.ts   # Node extraction and date parsing assertions
│   └── tax-calculator.test.ts# DIOT aggregation and VAT calculation tests
├── vitest.config.ts          # Vitest testing configuration
└── package.json              # Project dependencies and scripts
```
