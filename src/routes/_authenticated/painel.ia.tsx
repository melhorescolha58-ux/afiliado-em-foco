import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bot, Sparkles, MessageSquareReply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, DevNotice } from "@/components/app/ui";
import { CopyButton } from "@/components/app/CopyButton";
import { useAi, type AiTask } from "@/components/app/useAi";
import { useRows } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { storeLabel } from "@/lib/stores";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/painel/ia")({
  head: () => ({ meta: [{ title: "Inteligência artificial — Afiliado Automático" }] }),
  component: AiPage,
});

const TOOLS: { id: AiTask; title: string; text: string }[] = [
  { id: "create", title: "Criar mensagem", text: "A partir dos dados do produto." },
  { id: "rewrite", title: "Reescrever", text: "Nova redação, mesmos preços e link." },
  { id: "variations", title: "3 versões", text: "Variações para não repetir texto." },
  { id: "tone", title: "Ajustar tom", text: "Urgente, divertido, profissional..." },
  { id: "cta", title: "Chamadas para ação", text: "5 opções de CTA curtas." },
  { id: "titles", title: "Títulos chamativos", text: "5 títulos com emoji." },
  { id: "summarize", title: "Resumir produto", text: "Descrição em até 3 linhas." },
];

function AiPage() {
  const ai = useAi();
  const { data: products = [] } = useRows("products");
  const [task, setTask] = useState<AiTask>("create");
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("urgente");
  const [output, setOutput] = useState("");

  function loadProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setInput([
      `Produto: ${p.name}`, p.description && `Descrição: ${p.description}`, `Loja: ${storeLabel(p.store)}`,
      p.original_price && `Preço original: ${formatBRL(p.original_price)}`, p.promo_price && `Preço promocional: ${formatBRL(p.promo_price)}`,
      p.coupon && `Cupom: ${p.coupon}`, `Link: ${p.affiliate_url ?? "[LINK DO PRODUTO]"}`,
    ].filter(Boolean).join("\n"));
  }
  function run() {
    if (input.trim().length < 3) return toast.error("Escreva ou carregue um conteúdo primeiro.");
    ai.mutate({ task, text: input, tone: task === "tone" ? tone : undefined }, { onSuccess: setOutput });
  }

  return (
    <>
      <PageHeader title="Inteligência artificial" description="Um assistente para escrever e variar suas mensagens. Você revisa e decide o que usar." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTask(t.id)} className={cn("surface-card p-4 text-left transition-colors", task === t.id ? "border-primary/60 shadow-glow" : "hover:border-primary/30")}>
            <Sparkles className="size-4 text-lime" />
            <p className="mt-2 font-semibold">{t.title}</p>
            <p className="text-xs text-muted-foreground">{t.text}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="surface-card space-y-4 p-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label>Carregar produto</Label>
              <Select onValueChange={loadProduct}>
                <SelectTrigger><SelectValue placeholder="Escolha um produto cadastrado" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {task === "tone" && (
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{["urgente", "animado", "profissional", "divertido", "minimalista", "exclusivo"].map((t) => <SelectItem key={t} value={t}>Tom {t}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5"><Label>Conteúdo de entrada</Label><Textarea rows={12} value={input} onChange={(e) => setInput(e.target.value)} maxLength={4000} placeholder="Cole uma mensagem ou os dados do produto" /></div>
          <Button variant="hero" className="w-full" onClick={run} disabled={ai.isPending}><Bot /> {ai.isPending ? "Gerando..." : "Gerar com IA"}</Button>
        </div>
        <div className="surface-card space-y-4 p-6">
          <div className="flex items-center justify-between"><Label>Resultado</Label><CopyButton size="sm" text={output} disabled={!output} /></div>
          <Textarea rows={14} value={output} onChange={(e) => setOutput(e.target.value)} placeholder="O texto gerado aparecerá aqui. Você pode editar antes de copiar." />
          <p className="text-xs text-muted-foreground">A IA não envia nada sozinha. Confira preços, cupons e links antes de usar.</p>
        </div>
      </div>
      <div className="mt-6">
        <DevNotice>
          <div className="flex items-center gap-2 font-semibold"><MessageSquareReply className="size-4" /> Respostas automáticas inteligentes</div>
          Estrutura preparada. Será ativada apenas para os eventos que a integração oficial do WhatsApp disponibilizar e somente com sua permissão nas configurações.
        </DevNotice>
      </div>
    </>
  );
}
