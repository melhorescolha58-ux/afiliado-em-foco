import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plug, Plus, Pencil, Trash2, Info, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, EmptyState, ConfirmButton, StatusBadge, DevNotice } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { useAccount } from "@/hooks/use-account";
import type { Tables } from "@/integrations/supabase/types";
import { formatDateTime } from "@/lib/format";
import { normalizeWhatsAppPhone } from "@/lib/connections";

export const Route = createFileRoute("/_authenticated/painel/conexoes")({
  head: () => ({ meta: [{ title: "Conexões — Afiliado Automático" }, { name: "description", content: "Cadastre seus números de WhatsApp e acompanhe a preparação para a integração no Afiliado Automático." }, { property: "og:title", content: "Conexões — Afiliado Automático" }, { property: "og:description", content: "Cadastre seus números de WhatsApp e acompanhe a preparação para a integração no Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const { data: account } = useAccount();
  const { data: connections = [] } = useRows("connections");
  const { data: groups = [] } = useRows("groups", { select: "id, connection_id" });
  const [editing, setEditing] = useState<Tables<"connections"> | null>(null);
  const save = useSaveRow("connections", [], editing ? "Número atualizado" : "Número cadastrado");
  const del = useDeleteRows("connections", ["groups"]);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Tables<"connections"> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const max = account?.subscription?.plan?.max_connections ?? 1;

  function openNew() {
    setEditing(null);
    setName("");
    setPhone("");
    setOpen(true);
  }

  function openEdit(connection: Tables<"connections">) {
    setEditing(connection);
    setName(connection.name);
    setPhone(connection.phone_number ?? "");
    setOpen(true);
  }

  async function saveConnection() {
    if (name.trim().length < 2) {
      toast.error("Dê um nome ao número.");
      return;
    }
    const normalizedPhone = normalizeWhatsAppPhone(phone);
    if (!normalizedPhone) {
      toast.error("Informe o número com DDI + DDD + número.");
      return;
    }
    try {
      await save.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        name: name.trim(),
        phone_number: normalizedPhone,
        provider: "whatsapp_business_api",
        ...(editing ? {} : { status: "pending_validation" as const }),
      });
      setOpen(false);
      setEditing(null);
      setName("");
      setPhone("");
    } catch {
      // O hook já apresenta o erro e o formulário permanece preenchido.
    }
  }

  return (
    <>
      <PageHeader
        title="Conexões"
        description="Cadastre seus números de WhatsApp e acompanhe o que já está pronto para a futura integração."
        badge={<Badge variant="success">Cadastro disponível</Badge>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/painel/grupos"><Users /> Gerenciar grupos</Link></Button>
            <Button variant="hero" disabled={connections.length >= max} onClick={openNew}><Plus /> Adicionar número</Button>
          </>
        }
      />

      <DevNotice>
        O cadastro de números funciona agora. Somente a <b>autenticação real</b> e a <b>importação automática de grupos</b> aguardam a validação de uma tecnologia oficial compatível. Nenhuma conexão é simulada.
      </DevNotice>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <span className="mr-1 text-muted-foreground">Status:</span>
        <StatusBadge status="connected" />
        <StatusBadge status="disconnected" />
        <StatusBadge status="pending_validation" />
        <span className="ml-auto text-xs text-muted-foreground">“Conectado” só aparece após autenticação real.</span>
      </div>

      {!connections.length ? (
        <EmptyState
          icon={Plug}
          title="Nenhum número cadastrado"
          text={`Cadastre o WhatsApp que você pretende usar. Seu plano permite ${max} conexão(ões); a autenticação continua aguardando integração.`}
          action={<Button variant="hero" onClick={openNew}><Plus /> Adicionar número</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connections.map((connection) => (
            <div key={connection.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent"><Plug className="size-5 text-lime" /></span>
                  <div className="min-w-0"><p className="truncate font-bold">{connection.name}</p><p className="text-sm text-muted-foreground">{connection.phone_number ?? "Sem número"}</p></div>
                </div>
                <StatusBadge status={connection.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{groups.filter((group) => group.connection_id === connection.id).length} grupo(s) vinculados</p>
              <p className="mt-2 text-xs text-muted-foreground">Autenticação e importação automática ainda não executadas.</p>
              {connection.last_error && <p className="mt-2 text-xs text-destructive">{connection.last_error}</p>}
              <div className="mt-4 flex flex-wrap gap-1 border-t border-border pt-3">
                <Button size="sm" variant="ghost" onClick={() => setInfo(connection)}><Info /> Detalhes</Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(connection)}><Pencil /> Editar</Button>
                <ConfirmButton
                  trigger={<Button size="sm" variant="ghost"><Trash2 /> Excluir</Button>}
                  title="Excluir número?"
                  description="O cadastro será removido e os grupos vinculados ficarão sem número associado."
                  confirmLabel="Excluir"
                  onConfirm={() => del.mutate([connection.id])}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2"><Users className="size-5 text-primary" /><h2 className="font-bold">Grupos e organização</h2></div>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>• Cadastro, edição e exclusão manual de grupos.</li>
            <li>• Categorias por tipo, marketplace ou finalidade.</li>
            <li>• Seleção múltipla, busca, filtros e ações em lote.</li>
            <li>• Limite de grupos controlado pela assinatura.</li>
          </ul>
          <Button className="mt-4" variant="outline" asChild><Link to="/painel/grupos">Abrir Meus grupos</Link></Button>
        </div>
        <div className="surface-card p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h2 className="font-bold">Preparação para integração</h2></div>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>• Números já podem ser associados aos grupos cadastrados.</li>
            <li>• Cada grupo possui campo para o identificador externo futuro.</li>
            <li>• A integração deverá atualizar os status somente após validação real.</li>
            <li>• Autenticação e importação automática: aguardando integração.</li>
          </ul>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar número" : "Adicionar número"}</DialogTitle>
            <DialogDescription>O cadastro não autentica o WhatsApp. O número ficará aguardando integração.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void saveConnection(); }} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="connection-name">Nome de identificação</Label><Input id="connection-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="WhatsApp principal" maxLength={80} /></div>
            <div className="space-y-1.5"><Label htmlFor="connection-phone">Número com DDI e DDD</Label><Input id="connection-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+55 11 99999-9999" inputMode="tel" required /></div>
            <DialogFooter><Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar número"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!info} onOpenChange={(isOpen) => !isOpen && setInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{info?.name}</DialogTitle></DialogHeader>
          {info && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={info.status} /></dd>
              <dt className="text-muted-foreground">Número</dt><dd>{info.phone_number ?? "—"}</dd>
              <dt className="text-muted-foreground">Integração prevista</dt><dd>WhatsApp Business — aguardando validação técnica</dd>
              <dt className="text-muted-foreground">Autenticação</dt><dd>Não realizada</dd>
              <dt className="text-muted-foreground">Importação de grupos</dt><dd>Aguardando integração</dd>
              <dt className="text-muted-foreground">Última verificação</dt><dd>{formatDateTime(info.last_checked_at)}</dd>
              <dt className="text-muted-foreground">Cadastrado em</dt><dd>{formatDateTime(info.created_at)}</dd>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
