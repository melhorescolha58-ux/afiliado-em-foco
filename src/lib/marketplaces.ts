import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

export const fieldSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_]{0,49}$/),
  label: z.string().min(1).max(100),
  type: z.enum(["text", "url", "secret"]),
  required: z.boolean().default(false),
  help: z.string().max(500).default(""),
});
export type MarketplaceField = z.infer<typeof fieldSchema>;
export type Marketplace = Tables<"marketplaces">;
export type MarketplaceConfig = Tables<"marketplace_configs">;
export const categories = { marketplace: "Marketplace", network: "Rede de afiliados", partner: "Programa parceiro" };
export function fieldsOf(m: Marketplace): MarketplaceField[] {
  const parsed = z.array(fieldSchema).safeParse(m.fields);
  return parsed.success ? parsed.data : [];
}
export const secureUrl = z.string().max(2000).refine((value) => {
  if (!value) return true;
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}, "Informe um link https:// válido.");
export function videoEmbed(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : ["youtube.com", "www.youtube.com"].includes(u.hostname) ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]) : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch { return null; }
}
export function configurationStatus(c?: MarketplaceConfig) {
  if (!c) return { key: "none", label: "Não configurado", variant: "muted" as const };
  if (c.validation_status === "error") return { key: "error", label: "Erro de configuração", variant: "danger" as const };
  return c.is_active ? { key: "active", label: "Ativo", variant: "success" as const } : { key: "inactive", label: "Desativado", variant: "muted" as const };
}
export function validateConfiguration(m: Marketplace, values: Record<string, string>, secrets: Record<string, string>, hasSecret: boolean) {
  const config: Record<string, string> = {};
  const protectedValues: Record<string, string> = {};
  for (const field of fieldsOf(m)) {
    const value = (field.type === "secret" ? secrets[field.key] : values[field.key])?.trim() ?? "";
    if (field.required && !value && !(field.type === "secret" && hasSecret)) throw new Error(`Preencha ${field.label}.`);
    if (value.length > (field.type === "secret" ? 8000 : 2000)) throw new Error(`${field.label}: valor muito longo.`);
    if (field.type === "url") secureUrl.parse(value);
    if (field.type === "secret") { if (value) protectedValues[field.key] = value; }
    else config[field.key] = value;
  }
  return { config, secrets: protectedValues };
}
export function usableMarketplace(m: Marketplace, c?: MarketplaceConfig) { return m.is_available && c?.is_active === true && c.validation_status !== "error"; }
export function campaignAllowsStore(ids: string[], store: string) { return !ids.length || ids.includes(store); }
export function detectMarketplace(raw: string, catalogue: Marketplace[]): string {
  try {
    const u = new URL(raw);
    if (!["https:","http:"].includes(u.protocol)) return "outra";
    return catalogue.find((m) => m.domains.some((domain) => u.hostname === domain || u.hostname.endsWith(`.${domain}`)))?.id ?? "outra";
  } catch { return "outra"; }
}