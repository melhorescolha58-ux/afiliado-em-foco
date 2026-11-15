import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { marketplaceQuery } from "@/hooks/use-marketplaces";
import { categories, fieldSchema, fieldsOf, secureUrl, videoEmbed, type Marketplace, type MarketplaceField } from "@/lib/marketplaces";
import { getMarketplaceUsage } from "@/lib/marketplaces.functions";
import { errorMessage } from "@/lib/format";

type Draft = { id: string; name: string; description: string; category: string; logo_url: string; domains: string; documentation_url: string; tutorial_text: string; tutorial_url: string; tutorial_video_url: string; is_available: boolean; sort_order: number; fields: MarketplaceField[] };
const blank: Draft = { id: "", name: "", description: "", category: "marketplace", logo_url: "", domains: "", documentation_url: "", tutorial_text: "", tutorial_url: "", tutorial_video_url: "", is_available: true, sort_order: 100, fields: [] };

export function MarketplaceAdmin() {
  const qc = useQueryClient();
  const { data: catalogue = [] } = useQuery(marketplaceQuery);
  const usageFn = useServerFn(getMarketplaceUsage);
  const { data: usage = {}, error } = useQuery({ queryKey: ["marketplace-usage"], queryFn: () => usageFn() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  function edit(m: Marketplace) { setEditing(true); setDraft({ ...m, fields: fieldsOf(m), domains: m.domains.join(", "), logo_url: m.logo_url ?? "", documentation_url: m.documentation_url ?? "", tutorial_url: m.tutorial_url ?? "", tutorial_video_url: m.tutorial_video_url ?? "" }); }
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!draft) return;
    setBusy(true);
    try {
      if (!/^[a-z][a-z0-9-]{1,59}$/.test(draft.id)) throw new Error("Use um código com letras minúsculas, números e hífens.");
      if (draft.name.trim().length < 2) throw new Error("Informe o nome da loja.");
      for (const url of [draft.tutorial_url, draft.documentation_url]) secureUrl.parse(url);
      // Bundled official logo asset URLs are permitted as well as HTTPS uploads.
      if (draft.logo_url && !draft.logo_url.startsWith("/__l5e/assets-v1/")) secureUrl.parse(draft.logo_url);
      if (draft.tutorial_video_url && !videoEmbed(draft.tutorial_video_url)) throw new Error("Informe um vídeo válido do YouTube.");
      const fields = draft.fields.map((f) => fieldSchema.parse(f));
      if (fields.filter((f) => f.type === "secret").length > 1) throw new Error("Use no máximo um campo de credencial sensível por loja nesta etapa.");
      if (new Set(fields.map((f) => f.key)).size !== fields.length) throw new Error("Os códigos dos campos devem ser únicos.");
      const domains = draft.domains.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
      if (domains.some((d) => !/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(d))) throw new Error("Informe domínios sem https:// ou caminhos.");
      const row = { ...draft, name: draft.name.trim(), fields, domains, logo_url: draft.logo_url || null, documentation_url: draft.documentation_url || null, tutorial_url: draft.tutorial_url || null, tutorial_video_url: draft.tutorial_video_url || null };
      const result = editing ? await supabase.from("marketplaces").update(row).eq("id", draft.id).select().single() : await supabase.from("marketplaces").insert(row).select().single();
      if (result.error) throw result.error;
      await qc.invalidateQueries({ queryKey: ["marketplaces"] }); toast.success("Loja salva"); setDraft(null);
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  const set = (key: keyof Draft, value: string | number | boolean) => draft && setDraft({ ...draft, [key]: value });
  return <section className="mt-10 border-t border-border pt-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><Store className="size-5 text-primary" /> Marketplaces e tutoriais</h2><Button variant="soft" onClick={() => { setEditing(false); setDraft({ ...blank }); }}><Plus /> Nova loja</Button></div>
    {error && <p role="alert" className="text-sm text-destructive">Indicadores indisponíveis.</p>}
    <div className="divide-y divide-border">{catalogue.map((m) => <div key={m.id} className="flex flex-wrap items-center gap-3 py-4"><div className="min-w-40 flex-1"><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{usage[m.id]?.configured ?? 0} configurações · {usage[m.id]?.active ?? 0} ativas</p></div><Badge variant={m.is_available ? "success" : "muted"}>{m.is_available ? "Disponível" : "Indisponível"}</Badge><Button size="sm" variant="outline" onClick={() => edit(m)}><Pencil /> Editar loja</Button></div>)}</div>
    <Dialog open={!!draft} onOpenChange={(o) => !o && !busy && setDraft(null)}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{editing ? "Editar loja" : "Nova loja"}</DialogTitle><DialogDescription>Catálogo, campos e tutoriais do programa de afiliados.</DialogDescription></DialogHeader>
      {draft && <form onSubmit={save} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">{([{key:"id",label:"Código da loja"},{key:"name",label:"Nome"},{key:"logo_url",label:"Link do logotipo"},{key:"domains",label:"Domínios (separados por vírgulas)"},{key:"documentation_url",label:"Documentação oficial"},{key:"tutorial_url",label:"Link do tutorial completo"},{key:"tutorial_video_url",label:"Vídeo do YouTube"}] as const).map(({key,label}) => <div key={key} className="space-y-1.5"><Label htmlFor={`admin-${key}`}>{label}</Label><Input id={`admin-${key}`} value={draft[key]} disabled={editing && key === "id"} onChange={(e) => set(key,e.target.value)} /></div>)}
          <div className="space-y-1.5"><Label htmlFor="admin-order">Ordem</Label><Input id="admin-order" type="number" value={draft.sort_order} onChange={(e) => set("sort_order",Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Categoria</Label><Select value={draft.category} onValueChange={(v) => set("category",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categories).map(([id,label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select></div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={draft.is_available} onCheckedChange={(v) => set("is_available",v)} /> Disponível para novas configurações</label>
        </div>
        <div className="space-y-1.5"><Label htmlFor="admin-description">Descrição</Label><Textarea id="admin-description" value={draft.description} onChange={(e) => set("description",e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="admin-tutorial">Instruções do tutorial</Label><Textarea id="admin-tutorial" rows={4} value={draft.tutorial_text} onChange={(e) => set("tutorial_text",e.target.value)} /></div>
        <div className="space-y-3"><h3 className="font-semibold">Campos do formulário</h3>{draft.fields.map((field,i) => {
          const change = (patch: Partial<MarketplaceField>) => setDraft({ ...draft, fields: draft.fields.map((f,index) => index === i ? { ...f,...patch } : f) });
          return <div key={i} className="space-y-2 border-b border-border pb-3"><div className="grid gap-2 sm:grid-cols-3"><Input aria-label={`Código do campo ${i+1}`} value={field.key} onChange={(e) => change({key:e.target.value})} placeholder="codigo_do_campo" /><Input aria-label={`Rótulo do campo ${i+1}`} value={field.label} onChange={(e) => change({label:e.target.value})} placeholder="Nome do campo" /><Select value={field.type} onValueChange={(v: MarketplaceField["type"]) => change({type:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Identificador / texto</SelectItem><SelectItem value="url">Link https://</SelectItem><SelectItem value="secret">Credencial protegida</SelectItem></SelectContent></Select></div><Input aria-label={`Orientação do campo ${i+1}`} value={field.help} onChange={(e) => change({help:e.target.value})} placeholder="Orientação de preenchimento" /><div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm"><Switch checked={field.required} onCheckedChange={(v) => change({required:v})} /> Obrigatório</label><Button type="button" size="icon" variant="ghost" aria-label={`Remover campo ${i+1}`} onClick={() => setDraft({...draft,fields:draft.fields.filter((_,index) => index!==i)})}><Trash2 /></Button></div></div>;
        })}<Button type="button" variant="outline" size="sm" onClick={() => setDraft({...draft, fields:[...draft.fields,{key:"",label:"",type:"text",required:false,help:""}]})}><Plus /> Adicionar campo</Button></div>
        <DialogFooter><Button variant="hero" disabled={busy}>{busy ? "Salvando..." : "Salvar loja"}</Button></DialogFooter>
      </form>}
    </DialogContent></Dialog>
  </section>;
}