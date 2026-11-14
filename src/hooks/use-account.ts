import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Account = {
  userId: string;
  email: string | null;
  profile: Tables<"profiles"> | null;
  isAdmin: boolean;
  subscription: (Tables<"subscriptions"> & { plan: Tables<"plans"> | null }) | null;
};

export const accountQuery = queryOptions({
  queryKey: ["account"],
  queryFn: async (): Promise<Account | null> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return null;
    const [profile, roles, sub] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("subscriptions").select("*, plan:plans(*)").eq("user_id", user.id).maybeSingle(),
    ]);
    return {
      userId: user.id,
      email: user.email ?? null,
      profile: profile.data,
      isAdmin: (roles.data ?? []).some((r) => r.role === "admin"),
      subscription: (sub.data as Account["subscription"]) ?? null,
    };
  },
  staleTime: 60_000,
});

export function useAccount() {
  return useQuery(accountQuery);
}

export function groupLimit(account: Account | null | undefined): number {
  const s = account?.subscription;
  return s?.custom_max_groups ?? s?.plan?.max_groups ?? 10;
}
