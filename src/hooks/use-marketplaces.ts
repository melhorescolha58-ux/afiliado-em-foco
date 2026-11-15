import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "./use-account";

export const marketplaceQuery = queryOptions({
  queryKey: ["marketplaces"],
  queryFn: async () => {
    const { data, error } = await supabase.from("marketplaces").select("*").order("sort_order").order("name");
    if (error) throw error;
    return data;
  },
});
export const marketplaceConfigQuery = (userId: string) => queryOptions({
  queryKey: ["marketplace-configs", userId],
  queryFn: async () => {
    const { data, error } = await supabase.from("marketplace_configs").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
  },
});
export function useMarketplaces() {
  const { data: account } = useAccount();
  const catalogue = useQuery(marketplaceQuery);
  const settings = useQuery({ ...marketplaceConfigQuery(account?.userId ?? ""), enabled: !!account?.userId });
  return { catalogue: catalogue.data ?? [], configs: settings.data ?? [], isLoading: catalogue.isLoading || settings.isLoading, error: catalogue.error ?? settings.error };
}