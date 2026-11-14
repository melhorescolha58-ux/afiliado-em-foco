import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, CalendarClock, CheckCircle2, Clock, Megaphone, Plug, Send, ShoppingBag, Users, Workflow, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatusBadge, EmptyState, DemoNotice } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { formatDateTime, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({ meta: [{ title: "Dashboard — Afiliado Automático" }] }),
  component: Dashboard,
});

async function count(table: "groups" | "connections" | "campaigns" | "automation_rules" | "send_logs" | "queue_items" | "products", filter?: (q: any) => any) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [groups, connected, campaigns, products, sentDemo, sentReal, failed, scheduled, pending, automations, upcoming, recent, connections] = await Promise.all([
        count("groups"),
        count("connections", (q) => q.eq("status", "connected")),
        count("campaigns"),
        count("products"),
        count("send_logs", (q) => q.eq("status", "demo")),
        count("send_logs", (q) => q.eq("status", "sent")),
        count("send_logs", (q) => q.eq("status", "failed")),
        count("queue_items", (q) => q.eq("status", "scheduled")),
        count("queue_items", (q) => q.in("status", ["waiting", "processing"])),
        count("automation_rules", (q) => q.eq("is_active", true)),
        supabase.from("queue_items").select("id, scheduled_at, message_body, status, queue:queues(name)").in("status", ["scheduled", "waiting"]).gte("scheduled_at", new Date().toISOString()).order("scheduled_at").limit(6),
        supabase.from("send_logs").select("id, created_at, product_name, group_name, status, origin").order("created_at", { ascending: false }).limit(6),
        supabase.from("connections").select("id, name, status, phone_number").order("created_at").limit(5),
      ]);
      return {
        groups, connected, campaigns, products, sentDemo, sentReal, failed, scheduled, pending, automations,
        upcoming: upcoming.data ?? [], recent: recent.data ?? [], connections: connections.data ?? [],
      };
    },
  });
}

function Dashboard() {
  const { data: account } = useAccount();
  const { data, isLoading } = useDashboard();
  const v = (n?: number) => (isLoading ? "…" : (n ?? 0).toLocaleString("pt-BR"));
  const firstName = account?.profile?.full_name?.split(" ")[0];
  const isEmpty = !isLoading && data && data.groups === 0 && data.products === 0;

  return (
    <>
      <PageHeader
        title={firstName ? `Olá, ${firstName}` : "Dashboard"}
        description="Visão geral da sua operação de divulgação."
        actions={<Button asChild variant="hero"><Link to="/painel/disparo"><Send /> Novo disparo</Link></Button>}
      />
      <DemoNotice>
        Os números abaixo são <b>reais da sua conta</b>. Enquanto a integração com o WhatsApp está em validação, envios aparecem como <b>simulados (demonstração)</b> e nenhuma mensagem é entregue de verdade.
      </DemoNotice>

      {isEmpty && (
        <div className="surface-card mb-6 p-6">
          <h2 className="text-lg font-bold">Primeiros passos</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { to: "/painel/grupos", t: "1. Cadastre seus grupos", d: "Organize por categoria." },
              { to: "/painel/produtos", t: "2. Cadastre um produto", d: "Preço, cupom e link de afiliado." },
              { to: "/painel/filas", t: "3. Monte uma fila", d: "Programe horários e intervalos." },
            ].map((s) => (
              <Link key={s.to} to={s.to} className="group rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                <p className="font-semibold">{s.t}</p>
                <p className="text-sm text-muted-foreground">{s.d}</p>
                <ArrowRight className="mt-2 size-4 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Grupos cadastrados" value={v(data?.groups)} icon={Users} />
        <StatCard label="Grupos conectados" value={v(data?.connected)} icon={Plug} tone="info" hint="Conexões validadas" />
        <StatCard label="Campanhas" value={v(data?.campaigns)} icon={Megaphone} tone="lime" />
        <StatCard label="Automações ativas" value={v(data?.automations)} icon={Workflow} tone="lime" />
        <StatCard label="Mensagens enviadas" value={v(data?.sentReal)} icon={CheckCircle2} hint={`${v(data?.sentDemo)} simuladas (demo)`} />
        <StatCard label="Agendadas" value={v(data?.scheduled)} icon={CalendarClock} tone="info" />
        <StatCard label="Pendentes" value={v(data?.pending)} icon={Clock} tone="warning" />
        <StatCard label="Com falha" value={v(data?.failed)} icon={AlertTriangle} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Próximos envios</h2>
            <Button asChild variant="ghost" size="sm"><Link to="/painel/filas">Ver filas</Link></Button>
          </div>
          <div className="mt-4 space-y-2">
            {data?.upcoming.length ? data.upcoming.map((u) => (
              <div key={u.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <div className="w-28 shrink-0 font-mono text-sm text-primary">{formatDateTime(u.scheduled_at)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{u.message_body.split("\n").find((l) => l.trim() && !l.includes("OFERTA"))?.trim() ?? u.message_body}</p>
                  <p className="text-xs text-muted-foreground">{(u.queue as { name: string } | null)?.name}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
            )) : (
              <EmptyState icon={CalendarClock} title="Nenhum envio programado" text="Crie uma fila para programar ofertas em horários específicos." action={<Button asChild variant="soft" size="sm"><Link to="/painel/filas">Criar fila</Link></Button>} />
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Conexões</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/painel/conexoes">Gerenciar</Link></Button>
            </div>
            <div className="mt-4 space-y-2">
              {data?.connections.length ? data.connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone_number || "sem número"}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              )) : <p className="text-sm text-muted-foreground">Nenhuma conexão cadastrada.</p>}
            </div>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-lg font-bold">Atividade recente</h2>
            <div className="mt-4 space-y-3">
              {data?.recent.length ? data.recent.map((r) => (
                <div key={r.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate"><b>{r.product_name ?? "Oferta"}</b> → {r.group_name ?? "grupo"}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(r.created_at)} · <StatusBadge status={r.status} /></p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">Suas ações aparecerão aqui.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
