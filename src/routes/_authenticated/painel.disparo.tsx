import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Send, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatusBadge, ConfirmButton, EmptyState, DevNotice } from "@/components/app/ui";
import { GroupPicker } from "@/components/app/GroupPicker";
import { WhatsPreview } from "@/components/app/WhatsPreview";
import { useRows } from "@/lib/db";
import { buildPromoMessage } from "@/lib/message-builder";
import { errorMessage } from "@/lib/format";
import { campaignAllowsStore } from "@/lib/marketplaces";
import { sendZapiMessage } from "@/lib/zapi.functions";

export const Route = createFileRoute("/_authenticated/painel/disparo")({
  head: () => ({ meta: [{ title: "Disparo manual — Afiliado Automático" }, { name: "description", content: "Envie ofertas reais para grupos conectados pela Z-API no Afiliado Automático." }, { property: "og:title", content: "Disparo manual — Afiliado Automático" }, { property: "og:description", content: "Envie ofertas reais para grupos conectados pela Z-API no Afiliado Automático." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: DispatchPage,
});

type SendResult = { name: string; status: "sent" | "failed"; error?: string };

function DispatchPage() {
  const qc = useQueryClient();
  const { data: products = [] } = useRows("products");
  const { data: templates = [] } = useRows("message_templates");
  const { data: groups = [] } = useRows("groups");
  const { data: connections = [] } = useRows("connections");
  const { data: campaigns = [] } = useRows("campaigns");
  const sendMessage = useServerFn(sendZapiMessage);
  const [productId, setProductId] = useState("none");
  const [templateId, setTemplateId] = useState("auto");
  const [campaignId, setCampaignId] = useState("none");
  const [text, setText] = useState("");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SendResult[] | null>(null);

  const eligibleGroups = groups.filter((group) => {
    const connection = connections.find((item) => item.id === group.connection_id);
    return group.is_active && group.send_available && !!group.external_id && connection?.provider === "zapi" && connection.status === "connected";
  });
  const eligibleGroupIds = new Set(eligibleGroups.map((group) => group.id));
  const product = products.find((p) => p.id === productId);
  useEffect(() => {
    if (templateId !== "auto") {
      const template = templates.find((item) => item.id === templateId);
      if (template) setText(template.body);
    } else if (product) {
      setText(buildPromoMessage({ name: product.name, originalPrice: product.original_price, promoPrice: product.promo_price, coupon: product.coupon, link: product.affiliate_url, store: product.store }));
    }
  }, [productId, templateId, product, templates]);

  const inactive = product?.status === "inactive";
  const campaign = campaigns.find((item) => item.id === campaignId);
  const storeAllowed = !campaign?.marketplace_ids.length || (!!product && campaignAllowsStore(campaign.marketplace_ids, product.store));
  const selectedGroups = eligibleGroups.filter((group) => groupIds.includes(group.id));
  const canSend = text.trim().length >= 5 && selectedGroups.length > 0 && !inactive && storeAllowed;

  async function confirm() {
    if (!canSend) return;
    setBusy(true);
    const results: SendResult[] = [];
    try {
      for (const group of selectedGroups) {
        try {
          const response = await sendMessage({ data: {
            connectionId: group.connection_id!,
            groupId: group.id,
            message: text,
            ...(product ? { productId: product.id } : {}),
            ...(campaign ? { campaignId: campaign.id } : {}),
          } });
          results.push({ name: group.name, status: "sent", ...(response.historySaved ? {} : { error: "A Z-API aceitou o envio, mas o histórico não pôde ser salvo." }) });
        } catch (error) {
          results.push({ name: group.name, status: "failed", error: errorMessage(error) });
        }
      }
      setResult(results);
      qc.invalidateQueries({ queryKey: ["send_logs"] });
      qc.invalidateQueries({ queryKey: ["connections"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      const sent = results.filter((item) => item.status === "sent").length;
      const failed = results.length - sent;
      if (sent) toast.success(`A Z-API aceitou ${sent} envio(s)${failed ? `; ${failed} falharam` : ""}.`);
      else toast.error("Nenhum envio foi aceito pela Z-API. Confira os detalhes.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const sent = result.filter((item) => item.status === "sent").length;
    return (
      <>
        <PageHeader title="Resultado do disparo real" badge={<Badge variant="success">Z-API</Badge>} />
        <div className="surface-card p-6">
          <div className="flex items-center gap-3"><CheckCircle2 className="size-6 text-primary" /><p className="font-semibold">{sent} envio(s) aceito(s) pela Z-API; {result.length - sent} falha(s).</p></div>
          <p className="mt-2 text-sm text-muted-foreground">A confirmação abaixo é a resposta da Z-API à solicitação de envio, não uma confirmação de leitura ou entrega final.</p>
          <div className="mt-4 space-y-1.5">
            {result.map((item) => (
              <div key={item.name} className="rounded-lg border border-border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span>{item.name}</span><StatusBadge status={item.status} /></div>
                {item.error && <p className={`mt-1 flex items-start gap-1 text-xs ${item.status === "failed" ? "text-destructive" : "text-warning"}`}>{item.status === "failed" && <XCircle className="mt-0.5 size-3 shrink-0" />}{item.error}</p>}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="hero" onClick={() => { setResult(null); setGroupIds([]); }}>Novo disparo</Button>
            <Button asChild variant="outline"><Link to="/painel/historico">Ver histórico</Link></Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Disparo manual" description="Escolha a oferta, a mensagem e grupos realmente conectados pela Z-API. Confira a prévia e confirme." badge={<Badge variant="success">Envio real</Badge>} />
      <DevNotice>O envio usa a integração <b>não oficial da Z-API</b>. Revise a mensagem e os destinos: após confirmar, a solicitação real será enviada ao WhatsApp.</DevNotice>
      {!eligibleGroups.length ? (
        <EmptyState icon={Users} title="Nenhum grupo pronto para envio real" text="Conecte um número pela Z-API e importe seus grupos. Grupos manuais sem identificador externo não recebem envios reais." action={<Button asChild variant="hero"><Link to="/painel/conexoes">Configurar conexão</Link></Button>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="surface-card space-y-4 p-6">
              <h2 className="font-bold">1. Oferta e mensagem</h2>
              <div className="space-y-1.5">
                <Label>Produto</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Oferta avulsa (escrever mensagem)</SelectItem>
                    {products.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}{item.status === "inactive" ? " (inativo)" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
                {inactive && <p className="text-xs text-destructive">Este produto está inativo e não pode ser enviado.</p>}
                {!storeAllowed && <p className="text-xs text-destructive">Selecione um produto de uma das lojas participantes da campanha.</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Mensagem</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Gerada a partir do produto</SelectItem>
                      {templates.map((item) => <SelectItem key={item.id} value={item.id}>Modelo: {item.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Campanha (opcional)</Label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Nenhuma</SelectItem>{campaigns.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea rows={8} value={text} onChange={(event) => setText(event.target.value)} placeholder="Escreva ou ajuste a mensagem" maxLength={5000} />
            </div>
            <div className="surface-card space-y-4 p-6">
              <h2 className="font-bold">2. Grupos conectados</h2>
              <GroupPicker value={groupIds} onChange={setGroupIds} allowedGroupIds={eligibleGroupIds} />
            </div>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <WhatsPreview text={text} title="3. Prévia da mensagem" />
            <ConfirmButton
              destructive={false}
              trigger={<Button variant="hero" size="xl" className="w-full" disabled={!canSend || busy}><Send /> {busy ? "Enviando..." : `Confirmar disparo real para ${selectedGroups.length} grupo(s)`}</Button>}
              title="Confirmar envio real?"
              description={`A Z-API receberá uma solicitação de envio desta mensagem para ${selectedGroups.length} grupo(s) do WhatsApp.`}
              confirmLabel="Enviar agora"
              onConfirm={confirm}
            />
          </div>
        </div>
      )}
    </>
  );
}
