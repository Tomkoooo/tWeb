import type { FoxpostApmSelection, FoxpostParcelPoint } from "@/lib/foxpost";

export const FOXPOST_SANDBOX_APM_JSON_URL = "https://cdn.foxpost.hu/sandbox_foxplus.json";
export const FOXPOST_SANDBOX_DEFAULT_APM_ID = "hu350";

const CACHE_TTL_MS = 60 * 60 * 1000;

type SandboxApmCache = {
  fetchedAt: number;
  apms: FoxpostParcelPoint[];
};

let cache: SandboxApmCache | null = null;

export function isSandboxApmOperatorId(operatorId: string): boolean {
  const match = operatorId.match(/^hu(\d+)$/i);
  if (!match) return false;
  return Number.parseInt(match[1], 10) < 1000;
}

export function mapSandboxApmEntry(entry: FoxpostApmSelection): FoxpostParcelPoint | null {
  const id = entry.operator_id?.trim();
  if (!id || !isSandboxApmOperatorId(id)) return null;

  return {
    id,
    name: entry.name?.trim() || id,
    address: entry.address?.trim() || entry.street?.trim(),
    zip: entry.zip?.trim(),
    city: entry.city?.trim(),
    findme: entry.findme?.trim(),
    load: entry.load?.trim(),
    countryCode: entry.country?.trim()?.toUpperCase() || "HU",
  };
}

async function fetchSandboxApmEntries(): Promise<FoxpostApmSelection[]> {
  const response = await fetch(FOXPOST_SANDBOX_APM_JSON_URL, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`Sandbox APM lista betöltése sikertelen (${response.status}).`);
  }
  const data = await response.json();
  return Array.isArray(data) ? (data as FoxpostApmSelection[]) : [];
}

export async function listSandboxApms(options?: { forceRefresh?: boolean }): Promise<FoxpostParcelPoint[]> {
  const now = Date.now();
  if (!options?.forceRefresh && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.apms;
  }

  const entries = await fetchSandboxApmEntries();
  const apms = entries
    .map(mapSandboxApmEntry)
    .filter((apm): apm is FoxpostParcelPoint => apm !== null)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  cache = { fetchedAt: now, apms };
  return apms;
}

export async function getDefaultSandboxApm(): Promise<FoxpostParcelPoint> {
  const apms = await listSandboxApms();
  const preferred = apms.find((apm) => apm.id.toLowerCase() === FOXPOST_SANDBOX_DEFAULT_APM_ID);
  if (preferred) return preferred;
  if (apms[0]) return apms[0];
  throw new Error("Nincs elérhető sandbox automata (hu1000 alatti operator_id).");
}

export async function resolveSandboxApm(apmId?: string): Promise<FoxpostParcelPoint> {
  if (!apmId?.trim()) {
    return getDefaultSandboxApm();
  }

  const normalized = apmId.trim().toLowerCase();
  const apms = await listSandboxApms();
  const match = apms.find((apm) => apm.id.toLowerCase() === normalized);
  if (!match) {
    throw new Error(`Érvénytelen sandbox automata: ${apmId}. Használj hu1000 alatti operator_id-t (pl. hu350).`);
  }
  return match;
}

export function clearSandboxApmCache(): void {
  cache = null;
}
