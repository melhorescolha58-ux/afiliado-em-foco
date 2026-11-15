import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/integrations/supabase/types";
import { decryptCredentials } from "./marketplace-crypto.server";

export type ZapiCredentials = { instanceId: string; token: string; clientToken: string };
export type ZapiStatus = { connected: boolean; smartphoneConnected: boolean; providerMessage: string | null };

export async function loadZapiCredentials(
  supabase: SupabaseClient<Database>,
  userId: string,
  connectionId: string,
  encryptionKey: string,
): Promise<{ connection: Tables<"connections">; credentials: ZapiCredentials }> {
  const { data: connection, error } = await supabase.from("connections").select("*").eq("id", connectionId).eq("user_id", userId).maybeSingle();
  if (error || !connection) throw new Error("Conexão não encontrada.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: stored, error: credentialError } = await supabaseAdmin.from("connection_credentials").select("encrypted_payload").eq("connection_id", connectionId).maybeSingle();
  if (credentialError || !stored) throw new Error("Configure os dados da instância Z-API primeiro.");
  let values: Record<string, string>;
  try {
    values = await decryptCredentials(stored.encrypted_payload, userId, connectionId, encryptionKey);
  } catch {
    throw new Error("Não foi possível ler os dados protegidos. Salve as credenciais da Z-API novamente.");
  }
  const instanceId = values.instanceId?.trim();
  const token = values.token?.trim();
  const clientToken = values.clientToken?.trim();
  if (!instanceId || !token || !clientToken) throw new Error("As credenciais da Z-API estão incompletas. Salve-as novamente.");
  return { connection, credentials: { instanceId, token, clientToken } };
}

export async function zapiRequest(credentials: ZapiCredentials, path: string, init: RequestInit = {}) {
  const url = `https://api.z-api.io/instances/${encodeURIComponent(credentials.instanceId)}/token/${encodeURIComponent(credentials.token)}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Client-Token", credentials.clientToken);
  headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers, signal: AbortSignal.timeout(20_000), cache: "no-store" });
}

export async function zapiJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!response.ok) {
    console.error(`Z-API request failed [${response.status}]: ${text.slice(0, 500)}`);
    const detail = text.replace(/\s+/g, " ").trim().slice(0, 240);
    throw new Error(`A Z-API recusou a solicitação (${response.status})${detail ? `: ${detail}` : "."}`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("A Z-API retornou uma resposta inválida.");
  }
}

export async function fetchAndStoreZapiStatus(
  userId: string,
  connectionId: string,
  credentials: ZapiCredentials,
): Promise<ZapiStatus> {
  const body = await zapiJson(await zapiRequest(credentials, "/status")) as Record<string, unknown>;
  const connected = body.connected === true;
  const smartphoneConnected = body.smartphoneConnected === true;
  const providerMessage = typeof body.error === "string" ? body.error.slice(0, 300) : null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("connections").update({
    status: connected ? "connected" : "disconnected",
    last_error: connected ? null : providerMessage,
    last_checked_at: new Date().toISOString(),
  }).eq("id", connectionId).eq("user_id", userId);
  if (error) throw new Error("A Z-API respondeu, mas não foi possível atualizar o status da conexão.");
  return { connected, smartphoneConnected, providerMessage };
}

export function encryptionKeyFrom(value: string | undefined): string {
  if (!value) throw new Error("O armazenamento protegido está indisponível. Tente novamente mais tarde.");
  return value;
}
