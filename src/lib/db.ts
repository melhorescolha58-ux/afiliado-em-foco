import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { errorMessage } from "./format";

export type TableName = keyof Database["public"]["Tables"];

/** Lists the current user's rows (RLS scopes every query to the signed-in account). */
export function useRows<T extends TableName>(
  table: T,
  opts: { select?: string; order?: string; ascending?: boolean; limit?: number; enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [table, opts.select ?? "*", opts.order, opts.ascending, opts.limit],
    enabled: opts.enabled ?? true,
    queryFn: async () => {
      let q = supabase.from(table).select(opts.select ?? "*");
      q = q.order(opts.order ?? "created_at", { ascending: opts.ascending ?? false });
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Tables<T>[];
    },
  });
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user.id;
}

export function useSaveRow<T extends TableName>(table: T, invalidate: TableName[] = [], successMsg = "Salvo com sucesso") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: (Partial<TablesUpdate<T>> & { id?: string }) | Omit<TablesInsert<T>, "user_id">) => {
      const r = row as Record<string, unknown>;
      if (r["id"]) {
        const { id, ...rest } = r;
        const { data, error } = await supabase.from(table).update(rest as never).eq("id" as never, id as never).select().single();
        if (error) throw error;
        return data as unknown as Tables<T>;
      }
      const user_id = await currentUserId();
      const { data, error } = await supabase.from(table).insert({ ...r, user_id } as never).select().single();
      if (error) throw error;
      return data as unknown as Tables<T>;
    },
    onSuccess: () => {
      [table, ...invalidate].forEach((t) => qc.invalidateQueries({ queryKey: [t] }));
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (successMsg) toast.success(successMsg);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useDeleteRows<T extends TableName>(table: T, invalidate: TableName[] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from(table).delete().in("id" as never, ids as never);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      [table, ...invalidate].forEach((t) => qc.invalidateQueries({ queryKey: [t] }));
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(ids.length > 1 ? `${ids.length} itens excluídos` : "Excluído com sucesso");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export async function insertMany<T extends TableName>(table: T, rows: Omit<TablesInsert<T>, "user_id">[]) {
  const user_id = await currentUserId();
  const { error } = await supabase.from(table).insert(rows.map((r) => ({ ...r, user_id })) as never);
  if (error) throw error;
}

export { currentUserId };
