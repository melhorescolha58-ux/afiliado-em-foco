import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search, Users, Pencil, Trash2, Tags, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, EmptyState, LoadingRows, ConfirmButton, FieldError, StatusBadge } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { useAccount, groupLimit } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatDate, errorMessage } from "@/lib/format";
import { groupSendStatus } from "@/lib/connections";

export const Route = createFileRoute("/_authenticated/painel/grupos")({
  head: () => ({ meta: [{ title: "Meus grupos — Afiliado Automático" }, { name: "description", content: "Meus grupos no painel do Afiliado Automático." }, { property: "og:title", content: "Meus grupos — Afiliado Automático" }, { property: "og:description", content: "Meus grupos no painel do Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: GroupsPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  external_id: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  category_id: z.string().optional(),
  connection_id: z.string().optional(),
  is_active: z.boolean(),
});
type Form = z.infer<typeof schema>;

function GroupDialog({ open, onOpenChange, group, categories, connections }: {
  open: boolean; onOpenChange: (o: boolean) => void; group: Tables<"groups"> | null;
  categories: Tables<"group_categories">[]; connections: Tables<"connections">[];
}) {
  const save = useSaveRow("groups", [], group ? "Grupo atualizado" : "Grupo cadastrado");
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    values: {
      name: group?.name ?? "", external_id: group?.external_id ?? "", description: group?.description ?? "",
      category_id: group?.category_id ?? "none", connection_id: group?.connection_id ?? "none", is_active: group?.is_active ?? true,
    },
  });
  async function onSubmit(v: Form) {
    await save.mutateAsync({
      ...(group ? { id: group.id } : {}),
      name: v.name, external_id: v.external_id || null, description: v.description || null,
      category_id: v.category_id && v.category_id !== "none" ? v.category_id : null,
      connection_id: v.connection_id && v.connection_id !== "none" ? v.connection_id : null,
      is_active: v.is_active,
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{group ? "Editar grupo" : "Novo grupo"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5"><Label htmlFor="group-name">Nome do grupo</Label><Input id="group-name" {...register("name")} placeholder="Ofertas Eletrônicos #1" /><FieldError msg={errors.name?.message} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="group-category">Categoria</Label>
              <Select value={watch("category_id") ?? "none"} onValueChange={(v) => setValue("category_id", v)}>
                <SelectTrigger id="group-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group-connection">Conexão</Label>
              <Select value={watch("connection_id") ?? "none"} onValueChange={(v) => setValue("connection_id", v)}>
                <SelectTrigger id="group-connection"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {connections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="group-external-id">Identificador do grupo (opcional)</Label><Input id="group-external-id" {...register("external_id")} placeholder="Preenchido automaticamente quando houver integração" /></div>
          <div className="space-y-1.5"><Label htmlFor="group-description">Descrição</Label><Textarea id="group-description" rows={3} {...register("description")} /></div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={watch("is_active")} onCheckedChange={(c) => setValue("is_active", c)} /> Grupo ativo para divulgação</label>
          <DialogFooter><Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoriesDialog({ open, onOpenChange, categories }: { open: boolean; onOpenChange: (o: boolean) => void; categories: Tables<"group_categories">[] }) {
  const [name, setName] = useState("");
  const save = useSaveRow("group_categories", ["groups"], "Categoria criada");
  const del = useDeleteRows("group_categories", ["groups"]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Categorias de grupos</DialogTitle></DialogHeader>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim().length < 2) { toast.error("Nome muito curto"); return; } save.mutate({ name: name.trim() }, { onSuccess: () => setName("") }); }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Promoções Shopee" maxLength={60} />
          <Button type="submit" variant="hero" disabled={save.isPending}><Plus /> Criar</Button>
        </form>
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              {c.name}
              <ConfirmButton trigger={<Button variant="ghost" size="icon" aria-label="Excluir categoria"><Trash2 /></Button>} title="Excluir categoria?" description="Os grupos desta categoria ficarão sem categoria." confirmLabel="Excluir" onConfirm={() => del.mutate([c.id])} />
            </div>
          ))}
          {!categories.length && <p className="text-sm text-muted-foreground">Nenhuma categoria ainda.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GroupsPage() {
  const qc = useQueryClient();
  const { data: account } = useAccount();
  const { data: groups, isLoading } = useRows("groups");
  const { data: categories = [] } = useRows("group_categories", { order: "name", ascending: true });
  const { data: connections = [] } = useRows("connections");
  const del = useDeleteRows("groups");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Tables<"groups"> | null>(null);
  const [dialog, setDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);

  const limit = groupLimit(account);
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name;
  const filtered = useMemo(
    () => (groups ?? []).filter((g) => (cat === "all" || (cat === "none" ? !g.category_id : g.category_id === cat)) && g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, cat, search],
  );
  const allSelected = filtered.length > 0 && filtered.every((g) => selected.has(g.id));

  function toggleAll() {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((g) => next.delete(g.id));
    else filtered.forEach((g) => next.add(g.id));
    setSelected(next);
  }
  async function setActive(active: boolean) {
    const { error } = await supabase.from("groups").update({ is_active: active }).in("id", [...selected]);
    if (error) { toast.error(errorMessage(error)); return; }
    toast.success(`${selected.size} grupo(s) ${active ? "ativados" : "desativados"}`);
    qc.invalidateQueries({ queryKey: ["groups"] });
    setSelected(new Set());
  }

  return (
    <>
      <PageHeader
        title="Meus grupos"
        description="Cadastre e organize seus grupos por categoria para direcionar cada oferta ao público certo."
        badge={<Badge variant="muted">{groups?.length ?? 0} / {limit.toLocaleString("pt-BR")} do plano</Badge>}
        actions={<>
          <Button variant="outline" onClick={() => setCatDialog(true)}><Tags /> Categorias</Button>
          <Button variant="hero" onClick={() => { setEditing(null); setDialog(true); }} disabled={(groups?.length ?? 0) >= limit}><Plus /> Novo grupo</Button>
        </>}
      />

      <div className="surface-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar pelo nome" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm">
            <b>{selected.size} selecionado(s)</b>
            <Button size="sm" variant="ghost" onClick={() => setActive(true)}><Power /> Ativar</Button>
            <Button size="sm" variant="ghost" onClick={() => setActive(false)}><PowerOff /> Desativar</Button>
            <ConfirmButton trigger={<Button size="sm" variant="ghost" className="text-destructive"><Trash2 /> Excluir</Button>} title={`Excluir ${selected.size} grupo(s)?`} description="Essa ação não pode ser desfeita." confirmLabel="Excluir" onConfirm={() => del.mutate([...selected], { onSuccess: () => setSelected(new Set()) })} />
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar seleção</Button>
          </div>
        )}

        <div className="mt-4">
          {isLoading ? <LoadingRows /> : !groups?.length ? (
            <EmptyState icon={Users} title="Nenhum grupo cadastrado" text="Cadastre seus grupos de WhatsApp para começar a direcionar ofertas." action={<Button variant="hero" onClick={() => { setEditing(null); setDialog(true); }}><Plus /> Cadastrar grupo</Button>} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Selecionar todos" /></TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conexão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Envio</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((g) => (
                    <TableRow key={g.id} data-state={selected.has(g.id) ? "selected" : undefined}>
                      <TableCell><Checkbox checked={selected.has(g.id)} onCheckedChange={() => { const n = new Set(selected); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); setSelected(n); }} aria-label={`Selecionar ${g.name}`} /></TableCell>
                      <TableCell><p className="font-medium">{g.name}</p>{g.description && <p className="max-w-xs truncate text-xs text-muted-foreground">{g.description}</p>}</TableCell>
                      <TableCell>{catName(g.category_id) ? <Badge variant="lime">{catName(g.category_id)}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{connections.find((c) => c.id === g.connection_id)?.name ?? "—"}</TableCell>
                      <TableCell>{g.is_active ? <Badge variant="success">Ativo</Badge> : <Badge variant="muted">Inativo</Badge>}</TableCell>
                      <TableCell><StatusBadge status={groupSendStatus(g, connections.find((c) => c.id === g.connection_id))} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(g.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => { setEditing(g); setDialog(true); }}><Pencil /></Button>
                          <ConfirmButton trigger={<Button variant="ghost" size="icon" aria-label="Excluir"><Trash2 /></Button>} title="Excluir grupo?" description={`"${g.name}" será removido.`} confirmLabel="Excluir" onConfirm={() => del.mutate([g.id])} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum grupo encontrado com esses filtros.</p>}
            </div>
          )}
        </div>
      </div>

      <GroupDialog open={dialog} onOpenChange={setDialog} group={editing} categories={categories} connections={connections} />
      <CategoriesDialog open={catDialog} onOpenChange={setCatDialog} categories={categories} />
    </>
  );
}
