import type { Json } from "@/integrations/supabase/types";

export type ZapiGroup = { name: string; phone: string; isGroup: true };

export function zapiMetadata(metadata: Json): { instanceId: string | null; hasCredentials: boolean } {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return { instanceId: null, hasCredentials: false };
  const value = metadata as { instance_id?: unknown; has_credentials?: unknown };
  return {
    instanceId: typeof value.instance_id === "string" ? value.instance_id : null,
    hasCredentials: value.has_credentials === true,
  };
}

export function normalizeZapiQrCode(value: string): string | null {
  const trimmed = value.trim();
  if (/^data:image\/(?:png|jpeg|jpg);base64,[a-z0-9+/=\s]+$/i.test(trimmed)) return trimmed;
  if (/^[a-z0-9+/=\s]+$/i.test(trimmed) && trimmed.length > 100) return `data:image/png;base64,${trimmed}`;
  return null;
}

export function sanitizeZapiGroups(value: unknown): ZapiGroup[] {
  if (!Array.isArray(value)) throw new Error("A Z-API retornou uma lista de grupos inválida.");
  const groups = new Map<string, ZapiGroup>();
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim().slice(0, 120) : "";
    const phone = typeof row.phone === "string" ? row.phone.trim().slice(0, 160) : "";
    if (row.isGroup !== true || !name || !phone) continue;
    groups.set(phone, { name, phone, isGroup: true });
  }
  return [...groups.values()];
}
