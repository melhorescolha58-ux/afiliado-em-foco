import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeZapiQrCode, sanitizeZapiGroups } from "./zapi";
import { encryptionKeyFrom, fetchAndStoreZapiStatus, loadZapiCredentials, zapiJson, zapiRequest } from "./zapi.server";

const connectionInput = z.object({ connectionId: z.string().uuid() });

export const saveZapiCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    connectionId: z.string().uuid(),
    instanceId: z.string().trim().min(2).max(100),
    token: z.string().trim().min(2).max(512),
    clientToken: z.string().trim().min(2).max(512),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: own, error } = await context.supabase.from("connections").select("id").eq("id", data.connectionId).eq("user_id", context.userId).maybeSingle();
    if (error || !own) throw new Error("Conexão não encontrada.");
    const key = encryptionKeyFrom(process.env["WHATSAPP_ENCRYPTION_KEY"]);
    const { encryptCredentials } = await import("./marketplace-crypto.server");
    const encrypted = await encryptCredentials({ instanceId: data.instanceId, token: data.token, clientToken: data.clientToken }, context.userId, data.connectionId, key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: saveError } = await supabaseAdmin.rpc("save_zapi_connection_credentials", {
      p_user_id: context.userId,
      p_connection_id: data.connectionId,
      p_instance_id: data.instanceId,
      p_encrypted: encrypted,
    });
    if (saveError) throw new Error("Não foi possível salvar os dados da Z-API. Tente novamente.");
    return { saved: true };
  });

export const getZapiQrCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => connectionInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = encryptionKeyFrom(process.env["WHATSAPP_ENCRYPTION_KEY"]);
    const { credentials } = await loadZapiCredentials(context.supabase, context.userId, data.connectionId, key);
    const body = await zapiJson(await zapiRequest(credentials, "/qr-code")) as Record<string, unknown>;
    if (typeof body["value"] === "string") {
      const qrCode = normalizeZapiQrCode(body["value"]);
      if (!qrCode) throw new Error("A Z-API retornou um QR Code inválido.");
      return { qrCode, requiresPasskey: false, message: null as string | null };
    }
    if (body["challenge"]) {
      return { qrCode: null, requiresPasskey: true, message: "Este aparelho pediu uma verificação adicional. Conclua a conexão no painel da Z-API e depois atualize o status aqui." };
    }
    const message = typeof body["error"] === "string" ? body["error"].slice(0, 300) : "A Z-API não retornou um QR Code. Verifique se a instância já está conectada.";
    return { qrCode: null, requiresPasskey: false, message };
  });

export const checkZapiStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => connectionInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = encryptionKeyFrom(process.env["WHATSAPP_ENCRYPTION_KEY"]);
    const { credentials } = await loadZapiCredentials(context.supabase, context.userId, data.connectionId, key);
    return fetchAndStoreZapiStatus(context.userId, data.connectionId, credentials);
  });

export const importZapiGroups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => connectionInput.parse(input))
  .handler(async ({ data, context }) => {
    const key = encryptionKeyFrom(process.env["WHATSAPP_ENCRYPTION_KEY"]);
    const { credentials } = await loadZapiCredentials(context.supabase, context.userId, data.connectionId, key);
    const status = await fetchAndStoreZapiStatus(context.userId, data.connectionId, credentials);
    if (!status.connected) throw new Error("Conecte o número pelo QR Code antes de importar os grupos.");

    const groups = [];
    let truncated = false;
    for (let page = 1; page <= 20; page++) {
      const body = await zapiJson(await zapiRequest(credentials, `/groups?page=${page}&pageSize=100`));
      if (!Array.isArray(body)) throw new Error("A Z-API retornou uma lista de grupos inválida.");
      groups.push(...sanitizeZapiGroups(body));
      if (body.length < 100) break;
      if (page === 20) truncated = true;
    }

    const uniqueGroups = [...new Map(groups.map((group) => [group.phone, group])).values()];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("import_zapi_groups", {
      p_user_id: context.userId,
      p_connection_id: data.connectionId,
      p_groups: uniqueGroups,
    });
    if (error) throw new Error("Os grupos foram localizados, mas não foi possível salvá-los. Tente novamente.");
    const counts = z.object({ imported: z.number(), updated: z.number(), skipped: z.number(), total: z.number(), limit: z.number() }).parse(result);
    return { ...counts, found: uniqueGroups.length, truncated };
  });

export const sendZapiMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    connectionId: z.string().uuid(),
    groupId: z.string().uuid(),
    message: z.string().trim().min(5).max(5000),
    productId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const [{ data: group, error: groupError }, { data: product }, { data: campaign }] = await Promise.all([
      context.supabase.from("groups").select("*").eq("id", data.groupId).eq("user_id", context.userId).maybeSingle(),
      data.productId ? context.supabase.from("products").select("id,name,status").eq("id", data.productId).eq("user_id", context.userId).maybeSingle() : Promise.resolve({ data: null }),
      data.campaignId ? context.supabase.from("campaigns").select("id").eq("id", data.campaignId).eq("user_id", context.userId).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    if (groupError || !group || group.connection_id !== data.connectionId || !group.external_id) throw new Error("Grupo não encontrado ou sem identificador importado da Z-API.");
    if (!group.is_active || !group.send_available) throw new Error("Este grupo não está ativo e disponível para envio.");
    if (data.productId && (!product || product.status !== "active")) throw new Error("O produto está inativo ou não foi encontrado.");
    if (data.campaignId && !campaign) throw new Error("Campanha não encontrada.");

    const key = encryptionKeyFrom(process.env["WHATSAPP_ENCRYPTION_KEY"]);
    const { credentials } = await loadZapiCredentials(context.supabase, context.userId, data.connectionId, key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const logBase = {
      user_id: context.userId,
      product_id: product?.id ?? null,
      product_name: product?.name ?? "Oferta avulsa",
      group_id: group.id,
      group_name: group.name,
      campaign_id: campaign?.id ?? null,
      origin: "manual",
      message_body: data.message,
      is_demo: false,
    };

    try {
      const status = await fetchAndStoreZapiStatus(context.userId, data.connectionId, credentials);
      if (!status.connected) throw new Error("O número não está conectado. Leia o QR Code novamente.");
      const body = await zapiJson(await zapiRequest(credentials, "/send-text", {
        method: "POST",
        body: JSON.stringify({ phone: group.external_id, message: data.message }),
      })) as Record<string, unknown>;
      const externalId = [body["messageId"], body["zaapId"], body["id"]].find((value): value is string => typeof value === "string" && value.length > 0) ?? null;
      if (!externalId) throw new Error("A Z-API não confirmou o identificador da mensagem.");
      const { error: logError } = await supabaseAdmin.from("send_logs").insert({ ...logBase, status: "sent", external_id: externalId });
      if (logError) console.error(`Z-API message ${externalId} accepted but history insert failed: ${logError.message}`);
      return { sent: true as const, externalId, historySaved: !logError };
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : "Falha no envio pela Z-API.";
      const { error: logError } = await supabaseAdmin.from("send_logs").insert({ ...logBase, status: "failed", error_detail: message });
      if (logError) console.error(`Failed to record Z-API failure: ${logError.message}`);
      throw new Error(message);
    }
  });
