import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateConfiguration } from "./marketplaces";

export const saveMarketplaceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ marketplaceId: z.string().min(1).max(60), config: z.record(z.string().max(8000)), secrets: z.record(z.string().max(8000)), active: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: marketplace, error: catalogError } = await context.supabase.from("marketplaces").select("*").eq("id", data.marketplaceId).eq("is_available", true).single();
    if (catalogError || !marketplace) throw new Error("Esta loja não está disponível para configuração.");
    const { data: existing } = await context.supabase.from("marketplace_configs").select("has_secret").eq("user_id", context.userId).eq("marketplace_id", marketplace.id).maybeSingle();
    const valid = validateConfiguration(marketplace, data.config, data.secrets, existing?.has_secret ?? false);
    let encrypted: string | undefined;
    if (Object.keys(valid.secrets).length) {
      const key = process.env["MARKETPLACE_ENCRYPTION_KEY"];
      if (!key) throw new Error("O armazenamento seguro está indisponível. Tente novamente mais tarde.");
      const { encryptCredentials } = await import("./marketplace-crypto.server");
      encrypted = await encryptCredentials(valid.secrets, context.userId, marketplace.id, key);
    }
    // Caller and catalogue availability verified through RLS above. Privileged write is
    // required to keep credentials and validation fields inaccessible to browser writes.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("save_marketplace_configuration", { p_user_id: context.userId, p_marketplace_id: marketplace.id, p_config: valid.config, p_active: data.active, ...(encrypted ? { p_encrypted: encrypted } : {}) });
    if (error) throw new Error("Não foi possível salvar a configuração. Tente novamente.");
    return { saved: true };
  });

export const deleteMarketplaceConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ marketplaceId: z.string().max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: own, error: readError } = await context.supabase.from("marketplace_configs").select("id").eq("user_id", context.userId).eq("marketplace_id", data.marketplaceId).maybeSingle();
    if (readError || !own) throw new Error("Configuração não encontrada.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("marketplace_configs").delete().eq("id", own.id).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível limpar os dados.");
    return { deleted: true };
  });

export const getMarketplaceUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Acesso restrito à administração.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("marketplace_configs").select("marketplace_id,is_active");
    if (error) throw new Error("Não foi possível consultar os indicadores.");
    return (data ?? []).reduce<Record<string, { configured: number; active: number }>>((counts, row) => {
      const count = counts[row.marketplace_id] ?? { configured: 0, active: 0 };
      count.configured++; if (row.is_active) count.active++; counts[row.marketplace_id] = count; return counts;
    }, {});
  });