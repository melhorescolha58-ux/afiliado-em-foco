import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Megaphone, Send, Info } from "lucide-react";
import { PageHeader, StatCard, EmptyState } from "@/components/app/ui";
import { useRows } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/painel/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Afiliado Automático" }] }),
  component: ReportsPage,
});

function Ranking({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="surface-card p-6">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.length ? rows.map(([name, n]) => (
          <div key={name}>
            <div className="flex justify-between text-sm"><span className="truncate">{name}</span><b>{n}</b></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
          </div>
        )) : <p className="text-sm text-muted-foreground">Sem dados ainda.</p>}
      </div>
    </div>
  );
}

function ReportsPage() {
  const { data: logs = [] } = useRows("send_logs", { limit: 5000 });
  const { data: campaigns = [] } = useRows("campaigns", { select: "id" });

  const stats = useMemo(() => {
    const top = (key: "product_name" | "group_name") => {
      const m = new Map<string, number>();
      logs.forEach((l) => { const k = l[key] ?? "—"; m.set(k, (m.get(k) ?? 0) + 1); });
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    };
    const days = Array.from({ length: 14 }).map((_, i) => format(subDays(new Date(), 13 - i), "yyyy-MM-dd"));
    const series = days.map((d) => ({
      dia: format(new Date(d + "T12:00:00"), "dd/MM"),
      Simulados: logs.filter((l) => l.created_at.startsWith(d) && l.status === "demo").length,
      Enviados: logs.filter((l) => l.created_at.startsWith(d) && l.status === "sent").length,
      Falhas: logs.filter((l) => l.created_at.startsWith(d) && l.status === "failed").length,
    }));
    return {
      requested: logs.length, sent: logs.filter((l) => l.status === "sent").length, failed: logs.filter((l) => l.status === "failed").length,
      demo: logs.filter((l) => l.status === "demo").length, products: top("product_name"), groups: top("group_name"), series,
    };
  }, [logs]);

  return (
    <>
      <PageHeader title="Relatórios" description="Indicadores calculados a partir do seu histórico de envios." />
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" /> Cliques, vendas e comissões não são exibidos: só mostraremos esses números quando houver uma integração oficial que os comprove.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mensagens solicitadas" value={stats.requested} icon={Send} hint={`${stats.demo} simuladas (demo)`} />
        <StatCard label="Enviadas com sucesso" value={stats.sent} icon={CheckCircle2} tone="lime" />
        <StatCard label="Com falha" value={stats.failed} icon={AlertTriangle} tone="danger" />
        <StatCard label="Campanhas" value={campaigns.length} icon={Megaphone} tone="info" />
      </div>
      <div className="surface-card mt-6 p-6">
        <h2 className="font-bold">Evolução dos envios — últimos 14 dias</h2>
        {stats.requested ? (
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.series}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="Simulados" stackId="a" fill="var(--color-demo)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Enviados" stackId="a" fill="var(--color-chart-1)" />
                <Bar dataKey="Falhas" stackId="a" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="mt-4"><EmptyState icon={Send} title="Sem envios no período" text="Faça um disparo ou crie uma fila para ver a evolução aqui." /></div>}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Ranking title="Produtos mais divulgados" rows={stats.products} />
        <Ranking title="Grupos mais utilizados" rows={stats.groups} />
      </div>
    </>
  );
}
