"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FolderArchive, Sparkles, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { SAMPLE_CFDIS } from "@/lib/data/sample-cfdis";
import { parseCfdiXml } from "@/lib/parser/cfdi-parser";
import { auditBatchCfdis } from "@/lib/audit/rules";
import { processFileList } from "@/lib/parser/zip-reader";
import type { CfdiData } from "@/lib/types";

interface DropzoneProps {
  onDataLoaded: (cfdis: CfdiData[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function Dropzone({ onDataLoaded, isLoading, setIsLoading }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsLoading(true);
    setProgress({ current: 0, total: files.length });

    try {
      const result = await processFileList(files, (curr, tot) => {
        setProgress({ current: curr, total: tot });
      });

      if (result.success.length > 0) {
        const audited = auditBatchCfdis(result.success);
        onDataLoaded(audited);
      } else {
        alert("No se encontraron comprobantes CFDI válidos en los archivos seleccionados.");
      }
    } catch (err: unknown) {
      console.error("Error al procesar archivos:", err);
      alert("Ocurrió un error al procesar los archivos.");
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleLoadSample = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const parsed = SAMPLE_CFDIS.map((s) => parseCfdiXml(s.xml, s.fileName));
        const audited = auditBatchCfdis(parsed);
        onDataLoaded(audited);
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
          isDragOver
            ? "border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/10"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xml,.zip"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-5">
          <UploadCloud size={32} />
        </div>

        <h3 className="text-lg font-medium text-white sm:text-xl">
          Arrastra aquí tus facturas <span className="text-sky-400 font-mono">.XML</span> o un archivo <span className="text-sky-400 font-mono">.ZIP</span>
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Audita lotes de comprobantes fiscales CFDI 4.0 y 3.3. Procesa en memoria local sin enviar datos a ningún servidor externo.
        </p>

        {isLoading && progress && (
          <div className="mt-6 w-full max-w-xs">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Procesando facturas...</span>
              <span className="font-mono">{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-150"
                style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-md transition-all hover:bg-sky-400 active:scale-95 disabled:opacity-50"
          >
            <FolderArchive size={16} />
            <span>Seleccionar Archivos</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition-all hover:bg-sky-500/20 active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>Cargar Lote de Ejemplo (6 Facturas)</span>
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>Compatible con Ingresos, Gastos, Nómina, Notas de Crédito y REP 2.0</span>
        </div>
      </div>
    </div>
  );
}
