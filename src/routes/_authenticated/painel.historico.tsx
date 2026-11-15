import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, EmptyState, LoadingRows, StatusBadge } from "@/components/app/ui";
import { WhatsPreview } from "@/components/app/WhatsPreview";
import { useRows } from "@/lib/db";
import type { Tables } from "@/integrations/supabase/types";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/historico")({
  head: () => ({ meta: [{ title: "Histórico de envios — Afiliado Automático" }, { name: "description", content: "Histórico de envios no painel do Afiliado Automático." }, { property: "og:title", content: "Histórico de envios — Afiliado Automático" }, { property: "og:description", content: "Histórico de envios no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HistoryPage,
});

const ORIGIN: Record<string, string> = { manual: "Disparo manual", queue: "Fila", auto: "Divulgador", automation: "Automação" };

function HistoryPage() {
  const { data: logs, isLoading } = useRows("send_logs", { limit: 1000 });
  const { data: groups = [] } = useRows("groups", { select: "id, name" });
  const { data: products = [] } = useRows("products", { select: "id, name" });
  const { data: campaigns = [] } = useRows("campaigns", { select: "id, name" });
  const [f, setF] = useState({ from: "", to: "", group: "all", product: "all", campaign: "all", status: "all" });
  const [view, setView] = useState<Tables<"send_logs"> | null>(null);

  const filtered = useMemo(() => (logs ?? []).filter((l) => {
    const d = l.created_at.slice(0, 10);
    return (!f.from || d >= f.from) && (!f.to || d <= f.to) && (f.group === "all" || l.group_id === f.group) && (f.product === "all" || l.product_id === f.product) && (f.campaign === "all" || l.campaign_id === f.campaign) && (f.status === "all" || l.status === f.status);
  }), [logs, f]);

  const Sel = ({ k, label, items }: { k: keyof typeof f; label: string; items: { id: string; name: string }[] }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={f[k]} onValueChange={(v) => setF({ ...f, [k]: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="all">Todos</SelectItem>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <PageHeader title="Histórico de envios" description="Todas as solicitações de envio registradas na sua conta." />
      <div className="surface-card mb-4 grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-1.5"><Label className="text-xs">De</Label><Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Até</Label><Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
        <Sel k="group" label="Grupo" items={groups} />
        <Sel k="product" label="Produto" items={products} />
        <Sel k="campaign" label="Campanha" items={campaigns} />
        <Sel k="status" label="Status" items={[{ id: "demo", name: "Simulado (demo)" }, { id: "requested", name: "Solicitado" }, { id: "sent", name: "Enviado" }, { id: "failed", name: "Falhou" }]} />
      </div>
      <div className="surface-card p-4">
        {isLoading ? <LoadingRows /> : !logs?.length ? (
          <EmptyState icon={History} title="Nenhum envio registrado" text="Os disparos e itens de fila processados aparecerão aqui." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Data e hora</TableHead><TableHead>Produto</TableHead><TableHead>Grupo</TableHead><TableHead>Origem</TableHead><TableHead>Status</TableHead><TableHead>ID da operação</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap font-mono text-sm">{formatDateTime(l.created_at)}</TableCell>
                    <TableCell>{l.product_name ?? "—"}</TableCell>
                    <TableCell>{l.group_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ORIGIN[l.origin] ?? l.origin}{campaigns.find((c) => c.id === l.campaign_id) && ` · ${campaigns.find((c) => c.id === l.campaign_id)!.name}`}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{l.external_id ?? "—"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" aria-label="Ver detalhes" onClick={() => setView(l)}><Eye /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum registro com esses filtros.</p>}
          </div>
        )}
      </div>
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Detalhes do envio</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm"><StatusBadge status={view.status} /><span className="text-muted-foreground">{formatDateTime(view.created_at)}</span></div>
              {view.is_demo && <p className="text-xs text-demo">Registro em modo demonstração — nenhuma mensagem foi entregue.</p>}
              {view.error_detail && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{view.error_detail}</p>}
              <WhatsPreview text={view.message_body} title="Mensagem utilizada" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
