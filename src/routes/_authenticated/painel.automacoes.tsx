import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Plus, Trash2, Workflow, Pencil, Zap, Filter, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, EmptyState, ConfirmButton, DemoNotice } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { useAccount } from "@/hooks/use-account";
import { TRIGGERS, CONDITIONS, ACTIONS, label } from "@/lib/automation";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/painel/automacoes")({
  head: () => ({ meta: [{ title: "Automações — Afiliado Automático" }, { name: "description", content: "Automações no painel do Afiliado Automático." }, { property: "og:title", content: "Automações — Afiliado Automático" }, { property: "og:description", content: "Automações no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: RulesPage,
});

type Draft = { id?: string; name: string; trigger_type: string; condition_type: string; condition_value: string; action_type: string; action_config: { category_id?: string; queue_id?: string }; is_active: boolean };
const empty: Draft = { name: "", trigger_type: "product_created", condition_type: "always", condition_value: "", action_type: "add_to_queue", action_config: {}, is_active: true };

function RuleDialog({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const save = useSaveRow("automation_rules", [], "Regra salva");
  const { data: categories = [] } = useRows("group_categories", { order: "name", ascending: true });
  const { data: queues = [] } = useRows("queues");
  const cond = CONDITIONS.find((c) => c.id === d.condition_type);
  async function submit() {
    if (d.name.trim().length < 2) { toast.error("Dê um nome à regra."); return; }
    if (cond?.needsValue && !d.condition_value.trim()) { toast.error("Informe o valor da condição."); return; }
    if (d.action_type === "route_to_category" && !d.action_config.category_id) { toast.error("Escolha a categoria de destino."); return; }
    await save.mutateAsync({ ...d, name: d.name.trim(), condition_value: cond?.needsValue ? d.condition_value.trim() : null });
    onClose();
  }
  const Step = ({ icon: I, title, children }: { icon: typeof Zap; title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><I className="size-4" /> {title}</p>
      {children}
    </div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{d.id ? "Editar regra" : "Nova regra"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nome da regra</Label><Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Eletrônicos para grupos de eletrônicos" maxLength={120} /></div>
          <Step icon={Zap} title="Gatilho">
            <Select value={d.trigger_type} onValueChange={(v) => setD({ ...d, trigger_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TRIGGERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Step>
          <Step icon={Filter} title="Condição">
            <div className="flex gap-2">
              <Select value={d.condition_type} onValueChange={(v) => setD({ ...d, condition_type: v })}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CONDITIONS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              {cond?.needsValue && <Input className="w-40" value={d.condition_value} onChange={(e) => setD({ ...d, condition_value: e.target.value })} placeholder="valor" maxLength={60} />}
            </div>
          </Step>
          <Step icon={Play} title="Ação">
            <Select value={d.action_type} onValueChange={(v) => setD({ ...d, action_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIONS.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            {d.action_type === "route_to_category" && (
              <Select value={d.action_config.category_id ?? ""} onValueChange={(v) => setD({ ...d, action_config: { ...d.action_config, category_id: v } })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Categoria de destino" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
            {d.action_type === "add_to_queue" && (
              <Select value={d.action_config.queue_id ?? ""} onValueChange={(v) => setD({ ...d, action_config: { ...d.action_config, queue_id: v } })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Fila de destino (opcional)" /></SelectTrigger>
                <SelectContent>{queues.map((q) => <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </Step>
          <label className="flex items-center gap-3 text-sm"><Switch checked={d.is_active} onCheckedChange={(c) => setD({ ...d, is_active: c })} /> Regra ativa</label>
        </div>
        <DialogFooter><Button variant="hero" onClick={submit} disabled={save.isPending}>Salvar regra</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RulesPage() {
  const { data: account } = useAccount();
  const { data: rules = [] } = useRows("automation_rules");
  const save = useSaveRow("automation_rules", [], "");
  const del = useDeleteRows("automation_rules");
  const [draft, setDraft] = useState<Draft | null>(null);
  const max = account?.subscription?.plan?.max_automations ?? 3;
  const toDraft = (r: Tables<"automation_rules">): Draft => ({ id: r.id, name: r.name, trigger_type: r.trigger_type, condition_type: r.condition_type, condition_value: r.condition_value ?? "", action_type: r.action_type, action_config: (r.action_config ?? {}) as Draft["action_config"], is_active: r.is_active });

  return (
    <>
      <PageHeader title="Regras de automação" description="Monte regras no formato gatilho → condição → ação, sem programar." actions={<Button variant="hero" disabled={rules.length >= max} onClick={() => setDraft({ ...empty })}><Plus /> Nova regra</Button>} />
      <DemoNotice>As regras ficam salvas e prontas. A execução automática será ligada junto com o processamento em segundo plano. Seu plano permite <b>{max}</b> regras ({rules.length} em uso).</DemoNotice>
      {!rules.length ? (
        <EmptyState icon={Workflow} title="Nenhuma regra criada" text="Exemplo: quando uma oferta da categoria Eletrônicos for cadastrada, direcionar para os grupos de Eletrônicos." action={<Button variant="hero" onClick={() => setDraft({ ...empty })}><Plus /> Criar regra</Button>} />
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.id} className="surface-card flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{r.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-md bg-info/15 px-2 py-0.5 text-info">{label(TRIGGERS, r.trigger_type)}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span className="rounded-md bg-warning/15 px-2 py-0.5 text-warning">{label(CONDITIONS, r.condition_type)}{r.condition_value ? `: ${r.condition_value}` : ""}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-primary">{label(ACTIONS, r.action_type)}</span>
                </div>
              </div>
              <Switch checked={r.is_active} onCheckedChange={(c) => save.mutate({ id: r.id, is_active: c }, { onSuccess: () => toast.success(c ? "Regra ativada" : "Regra desativada") })} aria-label="Ativar regra" />
              <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => setDraft(toDraft(r))}><Pencil /></Button>
              <ConfirmButton trigger={<Button variant="ghost" size="icon" aria-label="Excluir"><Trash2 /></Button>} title="Excluir regra?" description={`"${r.name}" será removida.`} confirmLabel="Excluir" onConfirm={() => del.mutate([r.id])} />
            </div>
          ))}
        </div>
      )}
      {draft && <RuleDialog key={draft.id ?? "new"} draft={draft} onClose={() => setDraft(null)} />}
    </>
  );
}
