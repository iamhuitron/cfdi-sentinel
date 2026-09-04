import rawBlacklist from "@/lib/data/sat-blacklist.json";
import type { EfoRecord } from "@/lib/types";

// Índice en memoria para búsqueda O(1)
const blacklistMap = new Map<string, EfoRecord>();

for (const record of rawBlacklist as EfoRecord[]) {
  blacklistMap.set(record.rfc.trim().toUpperCase(), record);
}

/**
 * Consulta si un RFC está registrado en las listas del Art. 69-B del CFF
 */
export function checkEfoRfc(rfc: string): EfoRecord | null {
  if (!rfc) return null;
  const clean = rfc.trim().toUpperCase();
  return blacklistMap.get(clean) ?? null;
}

/**
 * Devuelve todos los registros de la lista negra del SAT disponibles
 */
export function getAllEfos(): EfoRecord[] {
  return rawBlacklist as EfoRecord[];
}

/**
 * Determina si la situación del EFO representa un riesgo fiscal inminente
 * (Definitivo o Presunto implican operaciones no deducibles o bajo investigación)
 */
export function isRiskSituation(situacion: EfoRecord["situacion"]): boolean {
  return situacion === "Definitivo" || situacion === "Presunto";
}
