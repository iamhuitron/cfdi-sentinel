import JSZip from "jszip";
import { parseCfdiXml } from "./cfdi-parser";
import type { CfdiData } from "@/lib/types";

export interface ExtractedXml {
  fileName: string;
  content: string;
}

/**
 * Lee un archivo ZIP o XML directamente desde un objeto File del navegador
 */
export async function extractXmlsFromFile(file: File): Promise<ExtractedXml[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xml")) {
    const text = await file.text();
    return [{ fileName: file.name, content: text }];
  }

  if (name.endsWith(".zip")) {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const results: ExtractedXml[] = [];

    const entries = Object.entries(loadedZip.files);
    for (const [path, zipEntry] of entries) {
      // Ignorar directorios y archivos de sistema de macOS
      if (zipEntry.dir || path.includes("__MACOSX") || !path.toLowerCase().endsWith(".xml")) {
        continue;
      }

      const content = await zipEntry.async("text");
      results.push({
        fileName: path.split("/").pop() || path,
        content,
      });
    }

    return results;
  }

  return [];
}

/**
 * Procesa una lista de archivos (XMLs y ZIPs combinados) y devuelve los CfdiData parseados
 */
export async function processFileList(
  files: File[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: CfdiData[]; errors: { file: string; error: string }[] }> {
  const xmlList: ExtractedXml[] = [];

  // 1. Extraer todos los XMLs de archivos directos o ZIPs
  for (const f of files) {
    try {
      const extracted = await extractXmlsFromFile(f);
      xmlList.push(...extracted);
    } catch (err: unknown) {
      console.error(`Error leyendo ${f.name}:`, err);
    }
  }

  const success: CfdiData[] = [];
  const errors: { file: string; error: string }[] = [];

  // 2. Parsear cada XML extraído
  for (let i = 0; i < xmlList.length; i++) {
    const item = xmlList[i];
    try {
      const cfdi = parseCfdiXml(item.content, item.fileName);
      success.push(cfdi);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ file: item.fileName, error: msg });
    }

    if (onProgress) {
      onProgress(i + 1, xmlList.length);
    }
  }

  return { success, errors };
}
