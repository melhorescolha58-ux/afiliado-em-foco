import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Repeat, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, DemoNotice, DemoBadge, EmptyState, ConfirmButton } from "@/components/app/ui";
import { GroupPicker } from "@/components/app/GroupPicker";
import { WeekdayPicker } from "@/components/app/WeekdayPicker";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import type { Tables } from "@/integrations/supabase/types";
import { WEEKDAYS } from "@/lib/queue-schedule";

export const Route = createFileRoute("/_authenticated/painel/divulgador")({
  head: () => ({ meta: [{ title: "Divulgador automático — Afiliado Automático" }] }),
  component: PublisherPage,
});

type Draft = { id?: string; name: string; product_ids: string[]; group_ids: string[]; start_time: string; end_time: string; interval_minutes: number; days_of_week: number[]; max_per_period: number; is_active: boolean };
const empty: Draft = { name: "", product_ids: [], group_ids: [], start_time: "08:00", end_time: "22:00", interval_minutes: 15, days_of_week: [1, 2, 3, 4, 5], max_per_period: 20, is_active: false };

function PublisherDialog({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { data: products = [] } = useRows("products");
  const save = useSaveRow("schedules", [], "Rotina salva");
  const [d, setD] = useState<Draft>(draft ?? empty);
  if (!draft) return null;
  async function submit() {
    if (d.name.trim().length < 2) { toast.error("Dê um nome à rotina."); return; }
    if (!d.product_ids.length || !d.group_ids.length) { toast.error("Selecione produtos e grupos."); return; }
    if (d.end_time <= d.start_time) { toast.error("O horário final deve ser depois do inicial."); return; }
    if (!d.days_of_week.length) { toast.error("Escolha ao menos um dia."); return; }
    await save.mutateAsync({ ...d, name: d.name.trim() });
    onClose();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{d.id ? "Editar rotina" : "Nova rotina de divulgação"}</DialogTitle></DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nome</Label><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Vitrine 24h eletrônicos" maxLength={120} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Horário inicial</Label><Input type="time" value={d.start_time} onChange={(e) => setD({ ...d, start_time: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Horário final</Label><Input type="time" value={d.end_time} onChange={(e) => setD({ ...d, end_time: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Intervalo entre ofertas: <b className="text-primary">{d.interval_minutes} min</b></Label>
              <Slider min={1} max={120} step={1} value={[d.interval_minutes]} onValueChange={([v]) => setD({ ...d, interval_minutes: v ?? d.interval_minutes })} />
            </div>
            <div className="space-y-1.5"><Label>Máximo de ofertas por dia</Label><Input type="number" min={1} max={1000} value={d.max_per_period} onChange={(e) => setD({ ...d, max_per_period: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Dias da semana</Label><WeekdayPicker value={d.days_of_week} onChange={(v) => setD({ ...d, days_of_week: v })} /></div>
            <div className="space-y-1.5">
              <Label>Produtos em rotação</Label>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {products.filter((p) => p.status === "active").map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                    <Checkbox checked={d.product_ids.includes(p.id)} onCheckedChange={() => setD({ ...d, product_ids: d.product_ids.includes(p.id) ? d.product_ids.filter((x) => x !== p.id) : [...d.product_ids, p.id] })} />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Grupos</Label><GroupPicker value={d.group_ids} onChange={(v) => setD({ ...d, group_ids: v })} /></div>
        </div>
        <DialogFooter><Button variant="hero" onClick={submit} disabled={save.isPending}>Salvar rotina</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PublisherPage() {
  const { data: schedules = [] } = useRows("schedules");
  const save = useSaveRow("schedules", [], "");
  const del = useDeleteRows("schedules");
  const [draft, setDraft] = useState<Draft | null>(null);
  const toDraft = (s: Tables<"schedules">): Draft => ({ id: s.id, name: s.name, product_ids: s.product_ids, group_ids: s.group_ids, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5), interval_minutes: s.interval_minutes, days_of_week: s.days_of_week, max_per_period: s.max_per_period, is_active: s.is_active });

  return (
    <>
      <PageHeader title="Divulgador automático" description="Rotinas contínuas de divulgação com janela de horário, intervalo e limite diário." badge={<DemoBadge />} actions={<Button variant="hero" onClick={() => setDraft({ ...empty })}><Plus /> Nova rotina</Button>} />
      <DemoNotice>Você pode configurar, ativar e pausar rotinas. A execução real começa quando a integração com o WhatsApp for validada, respeitando os limites técnicos e as políticas do provedor.</DemoNotice>
      {!schedules.length ? (
        <EmptyState icon={Repeat} title="Nenhuma rotina configurada" text="Crie uma vitrine de ofertas que roda no horário que você definir." action={<Button variant="hero" onClick={() => setDraft({ ...empty })}><Plus /> Criar rotina</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {schedules.map((s) => (
            <div key={s.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · a cada {s.interval_minutes} min · até {s.max_per_period}/dia</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={s.is_active} onCheckedChange={(c) => save.mutate({ id: s.id, is_active: c }, { onSuccess: () => toast.success(c ? "Rotina ativada (demonstração)" : "Rotina pausada") })} />
                  {s.is_active ? "Ativa" : "Pausada"}
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {WEEKDAYS.filter((w) => s.days_of_week.includes(w.id)).map((w) => <Badge key={w.id} variant="muted">{w.short}</Badge>)}
                <Badge variant="lime">{s.product_ids.length} produtos</Badge>
                <Badge variant="info">{s.group_ids.length} grupos</Badge>
              </div>
              <div className="mt-4 flex gap-1 border-t border-border pt-3">
                <Button size="sm" variant="ghost" onClick={() => setDraft(toDraft(s))}><Pencil /> Editar</Button>
                <ConfirmButton trigger={<Button size="sm" variant="ghost"><Trash2 /> Excluir</Button>} title="Excluir rotina?" description={`"${s.name}" será removida.`} confirmLabel="Excluir" onConfirm={() => del.mutate([s.id])} />
              </div>
            </div>
          ))}
        </div>
      )}
      {draft && <PublisherDialog key={draft.id ?? "new"} draft={draft} onClose={() => setDraft(null)} />}
    </>
  );
}
