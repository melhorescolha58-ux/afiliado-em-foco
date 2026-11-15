import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, DemoNotice, DemoBadge, StatusBadge, ConfirmButton, EmptyState } from "@/components/app/ui";
import { GroupPicker } from "@/components/app/GroupPicker";
import { WhatsPreview } from "@/components/app/WhatsPreview";
import { useRows, insertMany } from "@/lib/db";
import { buildPromoMessage } from "@/lib/message-builder";
import { errorMessage } from "@/lib/format";
import { campaignAllowsStore } from "@/lib/marketplaces";

export const Route = createFileRoute("/_authenticated/painel/disparo")({
  head: () => ({ meta: [{ title: "Disparo manual — Afiliado Automático" }] }),
  component: DispatchPage,
});

function DispatchPage() {
  const qc = useQueryClient();
  const { data: products = [] } = useRows("products");
  const { data: templates = [] } = useRows("message_templates");
  const { data: groups = [] } = useRows("groups");
  const { data: campaigns = [] } = useRows("campaigns");
  const [productId, setProductId] = useState("none");
  const [templateId, setTemplateId] = useState("auto");
  const [campaignId, setCampaignId] = useState("none");
  const [text, setText] = useState("");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ name: string }[] | null>(null);

  const product = products.find((p) => p.id === productId);
  useEffect(() => {
    if (templateId !== "auto") {
      const t = templates.find((x) => x.id === templateId);
      if (t) setText(t.body);
    } else if (product) {
      setText(buildPromoMessage({ name: product.name, originalPrice: product.original_price, promoPrice: product.promo_price, coupon: product.coupon, link: product.affiliate_url, store: product.store }));
    }
  }, [productId, templateId, product, templates]);

  const inactive = product?.status === "inactive";
  const campaign = campaigns.find((c) => c.id === campaignId);
  const storeAllowed = !campaign?.marketplace_ids.length || (!!product && campaignAllowsStore(campaign.marketplace_ids, product.store));
  const canSend = text.trim().length >= 5 && groupIds.length > 0 && !inactive && storeAllowed;

  async function confirm() {
    if (!canSend) return;
    setBusy(true);
    try {
      const targets = groups.filter((g) => groupIds.includes(g.id));
      await insertMany("send_logs", targets.map((g) => ({
        product_id: product?.id ?? null, product_name: product?.name ?? "Oferta avulsa", group_id: g.id, group_name: g.name,
        campaign_id: campaignId !== "none" ? campaignId : null, origin: "manual", message_body: text, status: "demo", is_demo: true,
      })));
      setResult(targets.map((g) => ({ name: g.name })));
      qc.invalidateQueries({ queryKey: ["send_logs"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`${targets.length} envio(s) registrados em modo demonstração`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <>
        <PageHeader title="Disparo registrado" badge={<DemoBadge />} />
        <div className="surface-card p-6">
          <div className="flex items-center gap-3"><CheckCircle2 className="size-6 text-primary" /><p className="font-semibold">{result.length} solicitação(ões) registradas no histórico.</p></div>
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma mensagem foi entregue: o envio real será liberado após a validação da integração com o WhatsApp.</p>
          <div className="mt-4 space-y-1.5">
            {result.map((r) => <div key={r.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">{r.name}<StatusBadge status="demo" /></div>)}
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
      <PageHeader title="Disparo manual" description="Escolha a oferta, a mensagem e os grupos. Confira a prévia e confirme." badge={<DemoBadge />} />
      <DemoNotice>O disparo está em <b>modo demonstração</b>: cada envio é registrado no histórico como simulado, sem entregar mensagens no WhatsApp.</DemoNotice>
      {!groups.length ? (
        <EmptyState icon={Users} title="Cadastre grupos primeiro" text="Você precisa de pelo menos um grupo ativo para fazer um disparo." action={<Button asChild variant="hero"><Link to="/painel/grupos">Cadastrar grupos</Link></Button>} />
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
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}{p.status === "inactive" ? " (inativo)" : ""}</SelectItem>)}
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
                      {templates.map((t) => <SelectItem key={t.id} value={t.id}>Modelo: {t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Campanha (opcional)</Label>
                  <Select value={campaignId} onValueChange={setCampaignId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Nenhuma</SelectItem>{campaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva ou ajuste a mensagem" />
            </div>
            <div className="surface-card space-y-4 p-6">
              <h2 className="font-bold">2. Grupos de destino</h2>
              <GroupPicker value={groupIds} onChange={setGroupIds} />
            </div>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <WhatsPreview text={text} title="3. Prévia da mensagem" />
            <ConfirmButton
              destructive={false}
              trigger={<Button variant="hero" size="xl" className="w-full" disabled={!canSend || busy}><Send /> Confirmar disparo para {groupIds.length} grupo(s)</Button>}
              title="Confirmar disparo?"
              description={`A mensagem será registrada para ${groupIds.length} grupo(s) em modo demonstração (sem envio real).`}
              confirmLabel="Confirmar"
              onConfirm={confirm}
            />
          </div>
        </div>
      )}
    </>
  );
}
