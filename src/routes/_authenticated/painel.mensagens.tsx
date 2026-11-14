import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Sparkles, Trash2, Wand2, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, ConfirmButton, EmptyState } from "@/components/app/ui";
import { CopyButton } from "@/components/app/CopyButton";
import { WhatsPreview } from "@/components/app/WhatsPreview";
import { useAi } from "@/components/app/useAi";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { buildPromoMessage, MESSAGE_STYLES, type MessageStyle } from "@/lib/message-builder";
import { STORES } from "@/lib/stores";

export const Route = createFileRoute("/_authenticated/painel/mensagens")({
  validateSearch: (s: Record<string, unknown>): { produto?: string } => ({ produto: typeof s.produto === "string" ? s.produto : undefined }),
  head: () => ({ meta: [{ title: "Criador de mensagens — Afiliado Automático" }] }),
  component: MessagesPage,
});

const EMOJIS = ["🔥", "⚡", "🎟️", "🛒", "💥", "✅", "📉", "🚚", "⏰", "💰", "🎁", "👉"];
const CTAS = ["🛒 Aproveite aqui:", "👉 Garanta o seu:", "⏰ Corre que acaba:", "🛍️ Compre agora:"];

function MessagesPage() {
  const { produto } = Route.useSearch();
  const { data: products = [] } = useRows("products");
  const { data: templates = [] } = useRows("message_templates");
  const saveTemplate = useSaveRow("message_templates", [], "Modelo salvo");
  const delTemplate = useDeleteRows("message_templates");
  const ai = useAi();

  const [productId, setProductId] = useState<string>(produto ?? "manual");
  const [form, setForm] = useState({ name: "", originalPrice: "", promoPrice: "", coupon: "", link: "", store: "outra", extra: "" });
  const [style, setStyle] = useState<MessageStyle>("imperdivel");
  const [text, setText] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [tone, setTone] = useState("animado");

  useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p) setForm({ name: p.name, originalPrice: p.original_price?.toString() ?? "", promoPrice: p.promo_price?.toString() ?? "", coupon: p.coupon ?? "", link: p.affiliate_url ?? "", store: p.store, extra: "" });
  }, [productId, products]);

  const num = (v: string) => (v ? Number(v.replace(",", ".")) : null);
  function generate(s: MessageStyle = style) {
    if (form.name.trim().length < 2) return toast.error("Informe o nome do produto.");
    setText(buildPromoMessage({ name: form.name, originalPrice: num(form.originalPrice), promoPrice: num(form.promoPrice), coupon: form.coupon, link: form.link, store: form.store, extra: form.extra }, s));
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Criador de mensagens" description="Monte mensagens prontas para os grupos, ajuste o texto e salve seus modelos." actions={<Button asChild variant="outline"><Link to="/painel/disparo"><Send /> Ir para o disparo</Link></Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="surface-card space-y-4 p-6">
          <div className="space-y-1.5">
            <Label>Produto cadastrado</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Preencher manualmente</SelectItem>
                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Nome do produto</Label><Input value={form.name} onChange={set("name")} maxLength={200} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Preço original</Label><Input inputMode="decimal" value={form.originalPrice} onChange={set("originalPrice")} placeholder="199,90" /></div>
            <div className="space-y-1.5"><Label>Preço promocional</Label><Input inputMode="decimal" value={form.promoPrice} onChange={set("promoPrice")} placeholder="129,90" /></div>
            <div className="space-y-1.5"><Label>Cupom</Label><Input value={form.coupon} onChange={set("coupon")} maxLength={60} /></div>
            <div className="space-y-1.5">
              <Label>Loja</Label>
              <Select value={form.store} onValueChange={(v) => setForm({ ...form, store: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STORES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Link de afiliado</Label><Input value={form.link} onChange={set("link")} placeholder="https://..." /></div>
          <div className="space-y-1.5"><Label>Informações adicionais</Label><Textarea rows={2} value={form.extra} onChange={set("extra")} placeholder="Frete grátis, estoque limitado..." maxLength={500} /></div>
          <div className="space-y-2">
            <Label>Estilo</Label>
            <Tabs value={style} onValueChange={(v) => { setStyle(v as MessageStyle); if (text) generate(v as MessageStyle); }}>
              <TabsList className="flex h-auto flex-wrap">
                {MESSAGE_STYLES.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>
          <Button variant="hero" className="w-full" onClick={() => generate()}><Wand2 /> Gerar mensagem</Button>
        </div>

        <div className="space-y-4">
          <div className="surface-card space-y-3 p-6">
            <div className="flex items-center justify-between"><Label>Texto da mensagem (editável)</Label><span className="text-xs text-muted-foreground">{text.length} caracteres</span></div>
            <Textarea rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder="Preencha os dados e clique em Gerar mensagem, ou escreva livremente." className="font-mono text-sm" />
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((e) => <Button key={e} variant="ghost" size="sm" onClick={() => setText(text + e)} aria-label={`Adicionar ${e}`}>{e}</Button>)}
            </div>
            <div className="flex flex-wrap gap-2">
              {CTAS.map((c) => <Button key={c} variant="soft" size="sm" onClick={() => setText(text + (text.endsWith("\n") || !text ? "" : "\n\n") + c + "\n" + (form.link || "[LINK DO PRODUTO]"))}>{c}</Button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <CopyButton text={text} disabled={!text} />
              <Button variant="outline" disabled={!text || ai.isPending} onClick={() => ai.mutate({ task: "rewrite", text }, { onSuccess: setText })}><Sparkles /> Reescrever com IA</Button>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>{["animado", "urgente", "profissional", "divertido", "minimalista"].map((t) => <SelectItem key={t} value={t}>Tom {t}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" disabled={!text || ai.isPending} onClick={() => ai.mutate({ task: "tone", text, tone }, { onSuccess: setText })}>Ajustar tom</Button>
              {ai.isPending && <span className="text-xs text-muted-foreground">A IA está escrevendo...</span>}
            </div>
            <p className="text-xs text-muted-foreground">Revise sempre o texto gerado pela IA antes de usar.</p>
          </div>
          <WhatsPreview text={text} />
          <div className="surface-card flex flex-wrap gap-2 p-4">
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Nome do modelo" className="flex-1" maxLength={80} />
            <Button variant="lime" disabled={!text || saveTemplate.isPending} onClick={() => { if (templateName.trim().length < 2) return toast.error("Dê um nome ao modelo."); saveTemplate.mutate({ name: templateName.trim(), body: text }, { onSuccess: () => setTemplateName("") }); }}><Save /> Salvar modelo</Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Meus modelos</h2>
        {templates.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <div key={t.id} className="surface-card flex flex-col p-4">
                <p className="font-semibold">{t.name}</p>
                <pre className="mt-2 line-clamp-6 flex-1 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{t.body}</pre>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="soft" onClick={() => { setText(t.body); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Usar</Button>
                  <CopyButton size="sm" text={t.body} />
                  <ConfirmButton trigger={<Button size="sm" variant="ghost" aria-label="Excluir modelo" className="ml-auto"><Trash2 /></Button>} title="Excluir modelo?" description={`"${t.name}" será removido.`} confirmLabel="Excluir" onConfirm={() => delTemplate.mutate([t.id])} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="Nenhum modelo salvo" text="Salve suas melhores mensagens para reutilizar em disparos e filas." />
        )}
      </div>
    </>
  );
}
