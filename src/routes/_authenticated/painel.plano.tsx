import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatusBadge, DevNotice } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { useAccount, groupLimit } from "@/hooks/use-account";
import { useRows } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/plano")({
  head: () => ({ meta: [{ title: "Meu plano — Afiliado Automático" }, { name: "description", content: "Meu plano no painel do Afiliado Automático." }, { property: "og:title", content: "Meu plano — Afiliado Automático" }, { property: "og:description", content: "Meu plano no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PlanPage,
});

function PlanPage() {
  const { data: account } = useAccount();
  const { data: groups = [] } = useRows("groups", { select: "id" });
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: async () => (await supabase.from("plans").select("*").eq("is_active", true).order("sort_order")).data ?? [] });
  const sub = account?.subscription;
  const limit = groupLimit(account);
  return (
    <>
      <PageHeader title="Meu plano" description="Seu plano atual e o uso dos limites." />
      <DevNotice>Pagamentos (mensal e anual) chegarão em breve. Para mudar de plano agora, fale com o suporte.</DevNotice>
      <div className="surface-card p-6">
        <div className="flex items-center gap-3"><h2 className="text-2xl font-bold">{sub?.plan?.name ?? "—"}</h2>{sub && <StatusBadge status={sub.status} />}</div>
        {sub?.current_period_end && <p className="mt-1 text-sm text-muted-foreground">Válido até {formatDate(sub.current_period_end)}</p>}
        <div className="mt-4">
          <div className="flex justify-between text-sm"><span>Grupos</span><b>{groups.length} / {limit}</b></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${Math.min(100, (groups.length / limit) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {plans.map((p) => (
          <div key={p.id} className="surface-card p-5">
            <p className="font-bold">{p.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Até {p.max_groups} grupos · {p.max_connections} conexão(ões) · {p.max_automations} automações</p>
            {p.id === sub?.plan_id ? <p className="mt-3 text-sm text-primary">Plano atual</p> : <Button asChild size="sm" variant="outline" className="mt-3"><Link to="/contato">Solicitar troca</Link></Button>}
          </div>
        ))}
      </div>
    </>
  );
}
