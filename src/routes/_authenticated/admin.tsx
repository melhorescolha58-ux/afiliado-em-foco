import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users, Send, AlertTriangle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatCard, StatusBadge } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, errorMessage } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administração — Afiliado Automático" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ context }) => {
    const userId = (context as { user?: { id: string } }).user?.id;
    const { data } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
    if (!data) throw redirect({ to: "/painel" });
  },
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, subs, logs, failed, queues] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*, plan:plans(name)"),
        supabase.from("send_logs").select("id", { count: "exact", head: true }),
        supabase.from("send_logs").select("id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("queues").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return { profiles: profiles.data ?? [], subs: subs.data ?? [], logs: logs.count ?? 0, failed: failed.count ?? 0, queues: queues.count ?? 0 };
    },
  });

  async function toggle(id: string, status: string) {
    const next = status === "active" ? "suspended" : "active";
    const { error } = await supabase.from("profiles").update({ status: next }).eq("id", id);
    if (error) return toast.error(errorMessage(error));
    const { data: u } = await supabase.auth.getUser();
    await supabase.from("admin_logs").insert({ admin_id: u.user!.id, action: next === "suspended" ? "suspend_account" : "activate_account", target_user_id: id });
    toast.success(next === "suspended" ? "Conta suspensa" : "Conta reativada");
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  return (
    <AppShell>
      <PageHeader title="Administração da plataforma" description="Visão geral de clientes, planos e uso." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuários" value={data?.profiles.length ?? "…"} icon={Users} />
        <StatCard label="Envios registrados" value={data?.logs ?? "…"} icon={Send} tone="lime" />
        <StatCard label="Falhas" value={data?.failed ?? "…"} icon={AlertTriangle} tone="danger" />
        <StatCard label="Filas ativas" value={data?.queues ?? "…"} icon={CalendarClock} tone="info" />
      </div>
      <div className="surface-card mt-6 overflow-x-auto p-4">
        <Table>
          <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Plano</TableHead><TableHead>Assinatura</TableHead><TableHead>Conta</TableHead><TableHead>Cadastro</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data?.profiles.map((p) => {
              const s = data.subs.find((x) => x.user_id === p.id);
              return (
                <TableRow key={p.id}>
                  <TableCell><p className="font-medium">{p.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{p.email}</p></TableCell>
                  <TableCell>{(s?.plan as { name: string } | null)?.name ?? "—"}</TableCell>
                  <TableCell>{s ? <StatusBadge status={s.status} /> : "—"}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.created_at)}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => toggle(p.id, p.status)}>{p.status === "active" ? "Suspender" : "Reativar"}</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
