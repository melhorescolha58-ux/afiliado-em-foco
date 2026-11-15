import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, EmptyState, ConfirmButton, StatusBadge } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";
import { useMarketplaces } from "@/hooks/use-marketplaces";
import { usableMarketplace } from "@/lib/marketplaces";

export const Route = createFileRoute("/_authenticated/painel/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — Afiliado Automático" }, { name: "description", content: "Campanhas no painel do Afiliado Automático." }, { property: "og:title", content: "Campanhas — Afiliado Automático" }, { property: "og:description", content: "Campanhas no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: CampaignsPage,
});

type Draft = { id?: string; name: string; description: string; status: string; marketplace_ids?: string[] };

function CampaignsPage() {
  const { catalogue, configs } = useMarketplaces();
  const { data: campaigns = [] } = useRows("campaigns");
  const { data: logs = [] } = useRows("send_logs", { select: "id, campaign_id" });
  const { data: queues = [] } = useRows("queues", { select: "id, campaign_id" });
  const save = useSaveRow("campaigns", [], "Campanha salva");
  const del = useDeleteRows("campaigns");
  const [d, setD] = useState<Draft | null>(null);

  async function submit() {
    if (!d) return;
    if (d.name.trim().length < 2) { toast.error("Dê um nome à campanha."); return; }
    await save.mutateAsync({ ...d, name: d.name.trim(), description: d.description.trim() || null });
    setD(null);
  }

  return (
    <>
      <PageHeader title="Campanhas" description="Agrupe filas e disparos de uma mesma ação, como Black Friday ou Semana do Consumidor." actions={<Button variant="hero" onClick={() => setD({ name: "", description: "", status: "active" })}><Plus /> Nova campanha</Button>} />
      {!campaigns.length ? (
        <EmptyState icon={Megaphone} title="Nenhuma campanha" text="Crie campanhas para organizar e comparar resultados de cada ação." action={<Button variant="hero" onClick={() => setD({ name: "", description: "", status: "active" })}><Plus /> Criar campanha</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <div key={c.id} className="surface-card flex flex-col p-5">
              <div className="flex items-center justify-between"><h3 className="font-bold">{c.name}</h3><StatusBadge status={c.status} /></div>
              {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted p-2.5"><p className="text-xs text-muted-foreground">Filas</p><p className="font-bold">{queues.filter((q) => q.campaign_id === c.id).length}</p></div>
                <div className="rounded-lg bg-muted p-2.5"><p className="text-xs text-muted-foreground">Envios registrados</p><p className="font-bold">{logs.filter((l) => l.campaign_id === c.id).length}</p></div>
              </div>
              <p className="mt-auto pt-4 text-xs text-muted-foreground">Criada em {formatDate(c.created_at)}</p>
              <div className="mt-3 flex gap-1 border-t border-border pt-3">
                <Button size="sm" variant="ghost" onClick={() => setD({ id: c.id, name: c.name, description: c.description ?? "", status: c.status, marketplace_ids: c.marketplace_ids })}><Pencil /> Editar</Button>
                <ConfirmButton trigger={<Button size="sm" variant="ghost"><Trash2 /> Excluir</Button>} title="Excluir campanha?" description="Filas e envios continuam no histórico, sem vínculo com a campanha." confirmLabel="Excluir" onConfirm={() => del.mutate([c.id])} />
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!d} onOpenChange={(o) => !o && setD(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{d?.id ? "Editar campanha" : "Nova campanha"}</DialogTitle></DialogHeader>
          {d && (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Nome</Label><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} maxLength={120} /></div>
              <div className="space-y-1.5"><Label>Descrição</Label><Textarea rows={3} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} maxLength={500} /></div>
              <div className="space-y-2"><Label>Lojas participantes</Label><p className="text-xs text-muted-foreground">Nenhuma seleção: todas as lojas. Operações automáticas exigirão configurações ativas e integração disponível.</p>{catalogue.map((m) => <label key={m.id} className="flex items-center gap-2 text-sm"><Checkbox checked={d.marketplace_ids?.includes(m.id) ?? false} disabled={!usableMarketplace(m, configs.find((c) => c.marketplace_id === m.id)) && !d.marketplace_ids?.includes(m.id)} onCheckedChange={(checked) => setD({...d, marketplace_ids: checked ? [...(d.marketplace_ids ?? []), m.id] : (d.marketplace_ids ?? []).filter((id) => id !== m.id)})} />{m.name}</label>)}</div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={d.status} onValueChange={(v) => setD({ ...d, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="active">Ativa</SelectItem><SelectItem value="paused">Pausada</SelectItem><SelectItem value="finished">Concluída</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="hero" onClick={submit} disabled={save.isPending}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
