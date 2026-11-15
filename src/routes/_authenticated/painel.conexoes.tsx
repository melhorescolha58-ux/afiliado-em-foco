import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plug, Plus, Pencil, Trash2, Info, ShieldCheck, Users, KeyRound, QrCode, RefreshCw, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, EmptyState, ConfirmButton, StatusBadge, DevNotice } from "@/components/app/ui";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { useAccount } from "@/hooks/use-account";
import type { Tables } from "@/integrations/supabase/types";
import { formatDateTime, errorMessage } from "@/lib/format";
import { normalizeWhatsAppPhone } from "@/lib/connections";
import { zapiMetadata } from "@/lib/zapi";
import { saveZapiCredentials, getZapiQrCode, checkZapiStatus, importZapiGroups } from "@/lib/zapi.functions";

export const Route = createFileRoute("/_authenticated/painel/conexoes")({
  head: () => ({ meta: [{ title: "Conexões — Afiliado Automático" }, { name: "description", content: "Conecte seu WhatsApp pela Z-API, autentique por QR Code e importe seus grupos no Afiliado Automático." }, { property: "og:title", content: "Conexões — Afiliado Automático" }, { property: "og:description", content: "Conecte seu WhatsApp pela Z-API, autentique por QR Code e importe seus grupos no Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ConnectionsPage,
});

type QrResult = { qrCode: string | null; requiresPasskey: boolean; message: string | null };

function ConnectionsPage() {
  const qc = useQueryClient();
  const { data: account } = useAccount();
  const { data: connections = [] } = useRows("connections");
  const { data: groups = [] } = useRows("groups", { select: "id, connection_id" });
  const [editing, setEditing] = useState<Tables<"connections"> | null>(null);
  const save = useSaveRow("connections", [], editing ? "Número atualizado" : "Número cadastrado");
  const del = useDeleteRows("connections", ["groups"]);
  const saveCredentials = useServerFn(saveZapiCredentials);
  const requestQrCode = useServerFn(getZapiQrCode);
  const requestStatus = useServerFn(checkZapiStatus);
  const requestImport = useServerFn(importZapiGroups);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Tables<"connections"> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [credentialConnection, setCredentialConnection] = useState<Tables<"connections"> | null>(null);
  const [instanceId, setInstanceId] = useState("");
  const [instanceToken, setInstanceToken] = useState("");
  const [clientToken, setClientToken] = useState("");
  const [qrConnection, setQrConnection] = useState<Tables<"connections"> | null>(null);
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [busy, setBusy] = useState("");
  const max = account?.subscription?.plan?.max_connections ?? 1;

  function refreshRows() {
    qc.invalidateQueries({ queryKey: ["connections"] });
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

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

  function openCredentials(connection: Tables<"connections">) {
    setCredentialConnection(connection);
    setInstanceId(zapiMetadata(connection.metadata).instanceId ?? "");
    setInstanceToken("");
    setClientToken("");
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
      });
      setOpen(false);
      setEditing(null);
      setName("");
      setPhone("");
    } catch {
      // O hook já apresenta o erro e o formulário permanece preenchido.
    }
  }

  async function submitCredentials() {
    if (!credentialConnection) return;
    if (instanceId.trim().length < 2 || instanceToken.trim().length < 2 || clientToken.trim().length < 2) {
      toast.error("Preencha o ID da instância, o token e o Client-Token.");
      return;
    }
    setBusy(`credentials:${credentialConnection.id}`);
    try {
      await saveCredentials({ data: { connectionId: credentialConnection.id, instanceId: instanceId.trim(), token: instanceToken.trim(), clientToken: clientToken.trim() } });
      toast.success("Dados da Z-API salvos com proteção. Agora conecte pelo QR Code.");
      const connection = credentialConnection;
      setCredentialConnection(null);
      setInstanceToken("");
      setClientToken("");
      refreshRows();
      await loadQrCode(connection);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function loadQrCode(connection: Tables<"connections">) {
    setQrConnection(connection);
    setQrResult(null);
    setBusy(`qr:${connection.id}`);
    try {
      const result = await requestQrCode({ data: { connectionId: connection.id } });
      setQrResult(result);
      if (result.message && !result.qrCode) toast.error(result.message);
    } catch (error) {
      setQrResult({ qrCode: null, requiresPasskey: false, message: errorMessage(error) });
      toast.error(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function refreshStatus(connection: Tables<"connections">) {
    setBusy(`status:${connection.id}`);
    try {
      const result = await requestStatus({ data: { connectionId: connection.id } });
      if (result.connected) {
        toast.success(result.smartphoneConnected ? "Número conectado e celular on-line." : "Número conectado; o celular aparece off-line na Z-API.");
        setQrConnection(null);
        setQrResult(null);
      } else {
        toast.info("A Z-API confirma que o número ainda não está conectado.");
      }
      refreshRows();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy("");
    }
  }

  async function importGroups(connection: Tables<"connections">) {
    setBusy(`import:${connection.id}`);
    try {
      const result = await requestImport({ data: { connectionId: connection.id } });
      toast.success(`${result.imported} grupo(s) importado(s), ${result.updated} atualizado(s). ${result.total}/${result.limit} no plano.`);
      if (result.skipped) toast.warning(`${result.skipped} grupo(s) não foram importados porque o limite do plano foi atingido.`);
      if (result.truncated) toast.warning("A consulta atingiu 2.000 grupos por vez. Execute a importação novamente para continuar.");
      refreshRows();
    } catch (error) {
      toast.error(errorMessage(error));
      refreshRows();
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <PageHeader
        title="Conexões"
        description="Configure sua instância Z-API, conecte seu WhatsApp por QR Code e importe seus grupos reais."
        badge={<Badge variant="success">Integração Z-API</Badge>}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/painel/grupos"><Users /> Gerenciar grupos</Link></Button>
            <Button variant="hero" disabled={connections.length >= max} onClick={openNew}><Plus /> Adicionar número</Button>
          </>
        }
      />

      <DevNotice>
        A Z-API usa uma integração <b>não oficial</b>. O número pode sofrer instabilidade ou bloqueio pelo WhatsApp. Nenhuma conexão, importação ou mensagem é simulada.
      </DevNotice>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <span className="mr-1 text-muted-foreground">Status:</span>
        <StatusBadge status="connected" />
        <StatusBadge status="disconnected" />
        <StatusBadge status="pending_validation" />
        <span className="ml-auto text-xs text-muted-foreground">“Conectado” só aparece após confirmação da Z-API.</span>
      </div>

      {!connections.length ? (
        <EmptyState
          icon={Plug}
          title="Nenhum número cadastrado"
          text={`Cadastre o WhatsApp que você pretende usar. Seu plano permite ${max} conexão(ões).`}
          action={<Button variant="hero" onClick={openNew}><Plus /> Adicionar número</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connections.map((connection) => {
            const metadata = zapiMetadata(connection.metadata);
            return (
              <div key={connection.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent"><Plug className="size-5 text-lime" /></span>
                    <div className="min-w-0"><p className="truncate font-bold">{connection.name}</p><p className="text-sm text-muted-foreground">{connection.phone_number ?? "Sem número"}</p></div>
                  </div>
                  <StatusBadge status={connection.status} />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{groups.filter((group) => group.connection_id === connection.id).length} grupo(s) vinculados</p>
                <p className="mt-2 text-xs text-muted-foreground">{metadata.hasCredentials ? `Instância Z-API: ${metadata.instanceId ?? "configurada"}` : "Dados da instância Z-API ainda não configurados."}</p>
                {connection.last_error && <p className="mt-2 text-xs text-destructive">{connection.last_error}</p>}
                <div className="mt-4 flex flex-wrap gap-1 border-t border-border pt-3">
                  {metadata.hasCredentials ? (
                    <Button size="sm" variant="soft" disabled={!!busy} onClick={() => void loadQrCode(connection)}><QrCode /> QR Code</Button>
                  ) : (
                    <Button size="sm" variant="soft" onClick={() => openCredentials(connection)}><KeyRound /> Configurar Z-API</Button>
                  )}
                  <Button size="sm" variant="ghost" disabled={!metadata.hasCredentials || !!busy} onClick={() => void refreshStatus(connection)}><RefreshCw className={busy === `status:${connection.id}` ? "animate-spin" : ""} /> Atualizar</Button>
                  <Button size="sm" variant="ghost" disabled={!metadata.hasCredentials || connection.status !== "connected" || !!busy} onClick={() => void importGroups(connection)}><Download /> {busy === `import:${connection.id}` ? "Importando..." : "Importar grupos"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setInfo(connection)}><Info /> Detalhes</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(connection)}><Pencil /> Editar</Button>
                  <ConfirmButton
                    trigger={<Button size="sm" variant="ghost"><Trash2 /> Excluir</Button>}
                    title="Excluir número?"
                    description="O cadastro e suas credenciais protegidas serão removidos. Os grupos vinculados ficarão sem número associado."
                    confirmLabel="Excluir"
                    onConfirm={() => del.mutate([connection.id])}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center gap-2"><Users className="size-5 text-primary" /><h2 className="font-bold">Grupos e organização</h2></div>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>• Importação real após a confirmação da conexão.</li>
            <li>• Cadastro, edição, exclusão e seleção múltipla.</li>
            <li>• Categorias por tipo, marketplace ou finalidade.</li>
            <li>• Limite de grupos controlado pela assinatura.</li>
          </ul>
          <Button className="mt-4" variant="outline" asChild><Link to="/painel/grupos">Abrir Meus grupos</Link></Button>
        </div>
        <div className="surface-card p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h2 className="font-bold">Como conectar</h2></div>
          <ol className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>1. Crie uma instância no painel da Z-API.</li>
            <li>2. Salve aqui o ID, o token da instância e o Client-Token.</li>
            <li>3. Leia o QR Code no WhatsApp em Aparelhos conectados.</li>
            <li>4. Atualize o status e importe seus grupos.</li>
          </ol>
          <Button className="mt-4" variant="outline" asChild><a href="https://app.z-api.io/" target="_blank" rel="noreferrer">Abrir painel Z-API <ExternalLink /></a></Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar número" : "Adicionar número"}</DialogTitle>
            <DialogDescription>O cadastro organiza o número. A conexão só será confirmada pela Z-API.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void saveConnection(); }} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="connection-name">Nome de identificação</Label><Input id="connection-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="WhatsApp principal" maxLength={80} /></div>
            <div className="space-y-1.5"><Label htmlFor="connection-phone">Número com DDI e DDD</Label><Input id="connection-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+55 11 99999-9999" inputMode="tel" required /></div>
            <DialogFooter><Button type="submit" variant="hero" disabled={save.isPending}>{save.isPending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar número"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credentialConnection} onOpenChange={(isOpen) => !isOpen && setCredentialConnection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Z-API</DialogTitle>
            <DialogDescription>Copie os dados da sua instância no painel da Z-API. Para alterá-los, preencha os três campos novamente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); void submitCredentials(); }} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="zapi-instance">ID da instância</Label><Input id="zapi-instance" value={instanceId} onChange={(event) => setInstanceId(event.target.value)} autoComplete="off" required /></div>
            <div className="space-y-1.5"><Label htmlFor="zapi-token">Token da instância</Label><Input id="zapi-token" type="password" value={instanceToken} onChange={(event) => setInstanceToken(event.target.value)} autoComplete="new-password" required /></div>
            <div className="space-y-1.5"><Label htmlFor="zapi-client-token">Client-Token da conta</Label><Input id="zapi-client-token" type="password" value={clientToken} onChange={(event) => setClientToken(event.target.value)} autoComplete="new-password" required /></div>
            <p className="text-xs text-muted-foreground">Os tokens são criptografados no servidor e nunca voltam para a tela.</p>
            <DialogFooter><Button type="submit" variant="hero" disabled={!!busy}>{busy.startsWith("credentials:") ? "Salvando..." : "Salvar e gerar QR Code"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrConnection} onOpenChange={(isOpen) => { if (!isOpen) { setQrConnection(null); setQrResult(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {qrConnection?.name}</DialogTitle>
            <DialogDescription>No WhatsApp, abra Aparelhos conectados → Conectar aparelho e leia o código. Ele expira em cerca de 20 segundos.</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-muted/30 p-4 text-center">
            {busy.startsWith("qr:") ? <p className="text-sm text-muted-foreground">Solicitando QR Code real à Z-API...</p> : qrResult?.qrCode ? (
              <img src={qrResult.qrCode} alt="QR Code real fornecido pela Z-API" className="mx-auto size-64 rounded-lg" />
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{qrResult?.message ?? "Solicite um QR Code para começar."}</p>
                {qrResult?.requiresPasskey && <Button variant="outline" asChild><a href="https://app.z-api.io/" target="_blank" rel="noreferrer">Concluir no painel Z-API <ExternalLink /></a></Button>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={!!busy || !qrConnection} onClick={() => qrConnection && void loadQrCode(qrConnection)}><RefreshCw /> Novo QR Code</Button>
            <Button variant="hero" disabled={!!busy || !qrConnection} onClick={() => qrConnection && void refreshStatus(qrConnection)}>Já li o QR Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!info} onOpenChange={(isOpen) => !isOpen && setInfo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{info?.name}</DialogTitle></DialogHeader>
          {info && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={info.status} /></dd>
              <dt className="text-muted-foreground">Número</dt><dd>{info.phone_number ?? "—"}</dd>
              <dt className="text-muted-foreground">Integração</dt><dd>Z-API — conexão não oficial por QR Code</dd>
              <dt className="text-muted-foreground">Instância</dt><dd>{zapiMetadata(info.metadata).instanceId ?? "Não configurada"}</dd>
              <dt className="text-muted-foreground">Credenciais</dt><dd>{zapiMetadata(info.metadata).hasCredentials ? "Salvas e criptografadas" : "Não configuradas"}</dd>
              <dt className="text-muted-foreground">Última verificação</dt><dd>{formatDateTime(info.last_checked_at)}</dd>
              <dt className="text-muted-foreground">Cadastrado em</dt><dd>{formatDateTime(info.created_at)}</dd>
            </dl>
          )}
          {info && zapiMetadata(info.metadata).hasCredentials && <Button variant="outline" onClick={() => { const connection = info; setInfo(null); openCredentials(connection); }}><KeyRound /> Atualizar credenciais</Button>}
        </DialogContent>
      </Dialog>
    </>
  );
}
