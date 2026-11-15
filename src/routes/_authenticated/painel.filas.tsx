import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarClock, Pause, Play, Plus, XCircle, Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, DemoNotice, DemoBadge, StatusBadge, EmptyState, LoadingRows, ConfirmButton } from "@/components/app/ui";
import { GroupPicker } from "@/components/app/GroupPicker";
import { WeekdayPicker } from "@/components/app/WeekdayPicker";
import { useRows, useDeleteRows, currentUserId } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { computeSchedule } from "@/lib/queue-schedule";
import { buildPromoMessage } from "@/lib/message-builder";
import { formatDateTime, errorMessage } from "@/lib/format";
import { campaignAllowsStore } from "@/lib/marketplaces";

export const Route = createFileRoute("/_authenticated/painel/filas")({
  head: () => ({ meta: [{ title: "Filas e agendamentos — Afiliado Automático" }] }),
  component: QueuesPage,
});

function NewQueueDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const { data: products = [] } = useRows("products");
  const { data: campaigns = [] } = useRows("campaigns");
  const active = products.filter((p) => p.status === "active");
  const [name, setName] = useState("");
  const [campaignId, setCampaignId] = useState("none");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [start, setStart] = useState(() => format(new Date(Date.now() + 15 * 60000), "yyyy-MM-dd'T'HH:mm"));
  const [interval, setIntervalMin] = useState(15);
  const [ws, setWs] = useState("08:00");
  const [we, setWe] = useState("22:00");
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(
    () => computeSchedule({ start: new Date(start), count: productIds.length, intervalMinutes: interval, windowStart: ws, windowEnd: we, daysOfWeek: days }),
    [start, productIds.length, interval, ws, we, days],
  );

  async function create() {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (campaign && productIds.some((id) => { const p = products.find((p) => p.id === id); return !p || !campaignAllowsStore(campaign.marketplace_ids, p.store); })) { toast.error("A fila contém produtos de lojas não selecionadas na campanha."); return; }
    if (name.trim().length < 2) { toast.error("Dê um nome à fila."); return; }
    if (!productIds.length) { toast.error("Adicione ao menos um produto."); return; }
    if (!groupIds.length) { toast.error("Selecione os grupos de destino."); return; }
    if (interval < 1 || interval > 1440) { toast.error("Intervalo deve ficar entre 1 e 1440 minutos."); return; }
    if (preview.length !== productIds.length) { toast.error("Revise a janela de horário e os dias da semana."); return; }
    setSaving(true);
    try {
      const user_id = await currentUserId();
      const { data: queue, error } = await supabase.from("queues").insert({
        user_id, name: name.trim(), campaign_id: campaignId !== "none" ? campaignId : null, start_at: new Date(start).toISOString(),
        interval_minutes: interval, window_start: ws, window_end: we, days_of_week: days, status: "active", is_demo: true,
      }).select().single();
      if (error) throw error;
      const { error: e1 } = await supabase.from("queue_groups").insert(groupIds.map((group_id) => ({ user_id, queue_id: queue.id, group_id })));
      if (e1) throw e1;
      const items = productIds.map((pid, i) => {
        const p = products.find((x) => x.id === pid);
        const date = preview[i];
        if (!p || !date) throw new Error("Produto ou horário não encontrado.");
        return {
          user_id, queue_id: queue.id, product_id: pid, position: i, status: "scheduled", scheduled_at: date.toISOString(),
          message_body: buildPromoMessage({ name: p.name, originalPrice: p.original_price, promoPrice: p.promo_price, coupon: p.coupon, link: p.affiliate_url, store: p.store }),
        };
      });
      const { error: e2 } = await supabase.from("queue_items").insert(items);
      if (e2) throw e2;
      toast.success("Fila criada");
      qc.invalidateQueries({ queryKey: ["queues"] });
      qc.invalidateQueries({ queryKey: ["queue_items"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
      setName(""); setProductIds([]); setGroupIds([]);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Nova fila de envio</DialogTitle></DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nome da fila</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ofertas da manhã" maxLength={120} /></div>
            <div className="space-y-1.5">
              <Label>Campanha (opcional)</Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">Nenhuma</SelectItem>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Produtos (na ordem de envio)</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {active.map((p) => {
                  const idx = productIds.indexOf(p.id);
                  return (
                    <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                      <Checkbox checked={idx >= 0} onCheckedChange={() => setProductIds(idx >= 0 ? productIds.filter((x) => x !== p.id) : [...productIds, p.id])} />
                      <span className="flex-1 truncate">{p.name}</span>
                      {idx >= 0 && <span className="font-mono text-xs text-primary">#{idx + 1}</span>}
                    </label>
                  );
                })}
                {!active.length && <p className="p-2 text-sm text-muted-foreground">Cadastre produtos ativos primeiro.</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label>Início</Label><Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Intervalo (min)</Label><Input type="number" min={1} max={1440} value={interval} onChange={(e) => setIntervalMin(Number(e.target.value))} /></div>
              <div />
              <div className="space-y-1.5"><Label>Funciona das</Label><Input type="time" value={ws} onChange={(e) => setWs(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Até</Label><Input type="time" value={we} onChange={(e) => setWe(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Dias da semana</Label><WeekdayPicker value={days} onChange={setDays} /></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Grupos de destino</Label><GroupPicker value={groupIds} onChange={setGroupIds} /></div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Programação prevista</p>
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
                {preview.map((d, i) => (
                  <div key={i} className="flex justify-between"><span className="truncate">{products.find((p) => p.id === productIds[i])?.name}</span><span className="font-mono text-primary">{formatDateTime(d)}</span></div>
                ))}
                {!preview.length && <p className="text-muted-foreground">Selecione produtos para ver os horários.</p>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter><Button variant="hero" onClick={create} disabled={saving}>{saving ? "Criando..." : "Criar fila"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QueueDetail({ queue, onBack }: { queue: Tables<"queues">; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["queue_items", queue.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("queue_items").select("*, product:products(name)").eq("queue_id", queue.id).order("scheduled_at");
      if (error) throw error;
      return data;
    },
  });
  const { data: targets = [] } = useQuery({
    queryKey: ["queue_groups", queue.id],
    queryFn: async () => (await supabase.from("queue_groups").select("group:groups(name)").eq("queue_id", queue.id)).data ?? [],
  });
  const [edit, setEdit] = useState<{ id: string; body: string } | null>(null);

  async function saveEdit() {
    if (!edit) return;
    const { error } = await supabase.from("queue_items").update({ message_body: edit.body }).eq("id", edit.id).in("status", ["waiting", "scheduled"]);
    if (error) { toast.error(errorMessage(error)); return; }
    toast.success("Mensagem atualizada");
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["queue_items"] });
  }

  return (
    <>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft /> Voltar para filas</Button>
      <PageHeader title={queue.name} description={`Intervalo de ${queue.interval_minutes} min · funciona das ${queue.window_start.slice(0, 5)} às ${queue.window_end.slice(0, 5)}`} badge={<StatusBadge status={queue.status} />} />
      <div className="mb-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
        Destinos: {targets.map((t, i) => <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-foreground">{(t.group as { name: string } | null)?.name}</span>)}
      </div>
      <div className="surface-card p-4">
        {isLoading ? <LoadingRows /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Horário</TableHead><TableHead>Produto</TableHead><TableHead>Mensagem</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-mono text-sm text-primary">{formatDateTime(it.scheduled_at)}</TableCell>
                  <TableCell>{(it.product as { name: string } | null)?.name ?? "—"}</TableCell>
                  <TableCell className="max-w-sm truncate text-sm text-muted-foreground">{it.message_body.replace(/\n+/g, " · ")}</TableCell>
                  <TableCell><StatusBadge status={it.status} /></TableCell>
                  <TableCell>{["waiting", "scheduled"].includes(it.status) && <Button variant="ghost" size="icon" aria-label="Editar mensagem" onClick={() => setEdit({ id: it.id, body: it.message_body })}><Pencil /></Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar mensagem</DialogTitle></DialogHeader>
          <Textarea rows={10} value={edit?.body ?? ""} onChange={(e) => edit && setEdit({ ...edit, body: e.target.value })} />
          <DialogFooter><Button variant="hero" onClick={saveEdit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function QueuesPage() {
  const qc = useQueryClient();
  const { data: queues, isLoading } = useRows("queues");
  const { data: items = [] } = useRows("queue_items", { order: "scheduled_at", ascending: true });
  const del = useDeleteRows("queues", ["queue_items"]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Tables<"queues"> | null>(null);

  async function setStatus(q: Tables<"queues">, status: "active" | "paused" | "canceled") {
    const { error } = await supabase.from("queues").update({ status }).eq("id", q.id);
    if (error) { toast.error(errorMessage(error)); return; }
    if (status === "canceled") await supabase.from("queue_items").update({ status: "canceled" }).eq("queue_id", q.id).in("status", ["waiting", "scheduled"]);
    toast.success(status === "paused" ? "Fila pausada" : status === "active" ? "Fila retomada" : "Fila cancelada");
    qc.invalidateQueries({ queryKey: ["queues"] });
    qc.invalidateQueries({ queryKey: ["queue_items"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  if (detail) return <QueueDetail queue={queues?.find((q) => q.id === detail.id) ?? detail} onBack={() => setDetail(null)} />;

  const upcoming = items.filter((i) => ["scheduled", "waiting"].includes(i.status)).slice(0, 8);

  return (
    <>
      <PageHeader title="Filas e agendamentos" description="Programe vários envios com intervalos, horário de funcionamento e dias da semana." badge={<DemoBadge />} actions={<Button variant="hero" onClick={() => setOpen(true)}><Plus /> Nova fila</Button>} />
      <DemoNotice>As filas são salvas e organizadas normalmente. O <b>processamento automático em segundo plano</b> será ativado após a validação da integração com o WhatsApp; até lá, nenhum item é enviado.</DemoNotice>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {isLoading ? <LoadingRows /> : !queues?.length ? (
            <EmptyState icon={CalendarClock} title="Nenhuma fila criada" text="Crie uma fila para programar produtos em sequência, por exemplo: 09h00, 09h15, 09h30..." action={<Button variant="hero" onClick={() => setOpen(true)}><Plus /> Criar fila</Button>} />
          ) : queues.map((q) => {
            const qi = items.filter((i) => i.queue_id === q.id);
            const done = qi.filter((i) => ["sent", "failed", "canceled"].includes(i.status)).length;
            return (
              <div key={q.id} className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-bold">{q.name}</h3><StatusBadge status={q.status} /></div>
                    <p className="mt-1 text-sm text-muted-foreground">{qi.length} item(ns) · a cada {q.interval_minutes} min · início {formatDateTime(q.start_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="soft" onClick={() => setDetail(q)}>Ver itens</Button>
                    {q.status === "active" && <Button size="sm" variant="ghost" onClick={() => setStatus(q, "paused")}><Pause /> Pausar</Button>}
                    {q.status === "paused" && <Button size="sm" variant="ghost" onClick={() => setStatus(q, "active")}><Play /> Retomar</Button>}
                    {["active", "paused"].includes(q.status) && <ConfirmButton trigger={<Button size="sm" variant="ghost"><XCircle /> Cancelar</Button>} title="Cancelar fila?" description="Os itens ainda não enviados serão cancelados." confirmLabel="Cancelar fila" onConfirm={() => setStatus(q, "canceled")} />}
                    <ConfirmButton trigger={<Button size="icon" variant="ghost" aria-label="Excluir fila"><Trash2 /></Button>} title="Excluir fila?" description="A fila e seus itens serão removidos." confirmLabel="Excluir" onConfirm={() => del.mutate([q.id])} />
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-primary" style={{ width: `${qi.length ? (done / qi.length) * 100 : 0}%` }} /></div>
              </div>
            );
          })}
        </div>
        <div className="surface-card h-fit p-5">
          <h2 className="font-bold">Próximos envios</h2>
          <div className="mt-4 space-y-2">
            {upcoming.length ? upcoming.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5 text-sm">
                <span className="font-mono text-primary">{formatDateTime(u.scheduled_at)}</span>
                <StatusBadge status={queues?.find((q) => q.id === u.queue_id)?.status === "paused" ? "paused" : u.status} />
              </div>
            )) : <p className="text-sm text-muted-foreground">Nada programado.</p>}
          </div>
          <Button asChild variant="link" className="mt-2 px-0"><Link to="/painel/divulgador">Prefere rotina contínua? Use o divulgador automático</Link></Button>
        </div>
      </div>
      <NewQueueDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
