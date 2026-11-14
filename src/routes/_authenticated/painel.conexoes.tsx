import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plug, Plus, RefreshCw, Trash2, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, EmptyState, ConfirmButton, StatusBadge, DevNotice, DevBadge } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { useAccount } from "@/hooks/use-account";
import type { Tables } from "@/integrations/supabase/types";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/painel/conexoes")({
  head: () => ({ meta: [{ title: "Conexões — Afiliado Automático" }] }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  const { data: account } = useAccount();
  const { data: connections = [] } = useRows("connections");
  const { data: groups = [] } = useRows("groups", { select: "id, connection_id" });
  const save = useSaveRow("connections", [], "Conexão registrada");
  const del = useDeleteRows("connections", ["groups"]);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Tables<"connections"> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const max = account?.subscription?.plan?.max_connections ?? 1;

  async function add() {
    if (name.trim().length < 2) return toast.error("Dê um nome à conexão.");
    const digits = phone.replace(/\D/g, "");
    if (digits && (digits.length < 10 || digits.length > 15)) return toast.error("Número inválido. Use DDI + DDD + número.");
    await save.mutateAsync({ name: name.trim(), phone_number: digits ? `+${digits}` : null, status: "pending_validation", provider: "whatsapp_business_api" });
    setOpen(false); setName(""); setPhone("");
  }

  return (
    <>
      <PageHeader title="Conexões" description="Gerencie as contas de WhatsApp usadas para divulgar suas ofertas." badge={<DevBadge />} actions={<Button variant="hero" disabled={connections.length >= max} onClick={() => setOpen(true)}><Plus /> Adicionar conexão</Button>} />
      <DevNotice>
        A conexão real com o WhatsApp está em <b>prova de conceito</b>. Você já pode registrar seus números; eles ficam como <b>“Aguardando validação”</b> até a integração oficial ser liberada. Nenhuma conexão é simulada como ativa.
      </DevNotice>
      {!connections.length ? (
        <EmptyState icon={Plug} title="Nenhuma conexão registrada" text={`Registre o número de WhatsApp que você usa nos grupos. Seu plano permite ${max} conexão(ões).`} action={<Button variant="hero" onClick={() => setOpen(true)}><Plus /> Adicionar conexão</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connections.map((c) => (
            <div key={c.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-accent"><Plug className="size-5 text-lime" /></span>
                  <div><p className="font-bold">{c.name}</p><p className="text-sm text-muted-foreground">{c.phone_number ?? "Sem número"}</p></div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{groups.filter((g) => g.connection_id === c.id).length} grupo(s) vinculados</p>
              {c.last_error && <p className="mt-2 text-xs text-destructive">{c.last_error}</p>}
              <div className="mt-4 flex gap-1 border-t border-border pt-3">
                <Button size="sm" variant="ghost" onClick={() => setInfo(c)}><Info /> Detalhes</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.info("A reconexão ficará disponível quando a integração oficial for validada.")}><RefreshCw /> Reconectar</Button>
                <ConfirmButton trigger={<Button size="sm" variant="ghost"><Trash2 /> Remover</Button>} title="Remover conexão?" description="Os grupos vinculados ficarão sem conexão." confirmLabel="Remover" onConfirm={() => del.mutate([c.id])} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 surface-card p-6">
        <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h2 className="font-bold">Como será a integração</h2></div>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <li>• Conexão por uma solução oficial e tecnicamente validada.</li>
          <li>• Credenciais guardadas apenas no servidor, nunca no navegador.</li>
          <li>• Limites de envio respeitando as políticas do provedor.</li>
          <li>• Teste real obrigatório antes de liberar envios para grupos.</li>
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar conexão</DialogTitle>
            <DialogDescription>A conexão ficará aguardando validação até a integração oficial ser liberada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Nome da conexão</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="WhatsApp principal" maxLength={80} /></div>
            <div className="space-y-1.5"><Label>Número (com DDI e DDD)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" inputMode="tel" /></div>
          </div>
          <DialogFooter><Button variant="hero" onClick={add} disabled={save.isPending}>Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!info} onOpenChange={(o) => !o && setInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{info?.name}</DialogTitle></DialogHeader>
          {info && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={info.status} /></dd>
              <dt className="text-muted-foreground">Número</dt><dd>{info.phone_number ?? "—"}</dd>
              <dt className="text-muted-foreground">Provedor</dt><dd>WhatsApp Business (oficial) — em validação</dd>
              <dt className="text-muted-foreground">Última verificação</dt><dd>{formatDateTime(info.last_checked_at)}</dd>
              <dt className="text-muted-foreground">Registrada em</dt><dd>{formatDateTime(info.created_at)}</dd>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
