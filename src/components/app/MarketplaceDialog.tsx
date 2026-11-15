import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Save, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmButton } from "./ui";
import { fieldsOf, videoEmbed, type Marketplace, type MarketplaceConfig } from "@/lib/marketplaces";
import { saveMarketplaceConfig, deleteMarketplaceConfig } from "@/lib/marketplaces.functions";
import { errorMessage } from "@/lib/format";

export function MarketplaceDialog({ marketplace: m, config, onClose }: { marketplace: Marketplace; config: MarketplaceConfig | undefined; onClose: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(saveMarketplaceConfig);
  const remove = useServerFn(deleteMarketplaceConfig);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(config?.config ?? {}).filter((entry): entry is [string,string] => typeof entry[1] === "string")));
  const [secrets, setSecrets] = useState<Record<string,string>>({});
  const [active, setActive] = useState(config?.is_active ?? false);
  const [busy, setBusy] = useState(false);
  const video = videoEmbed(m.tutorial_video_url);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      await save({ data: { marketplaceId: m.id, config: values, secrets, active } });
      await qc.invalidateQueries({ queryKey: ["marketplace-configs"] });
      toast.success("Configuração salva"); setSecrets({}); onClose();
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  async function clear() {
    setBusy(true);
    try {
      await remove({ data: { marketplaceId: m.id } });
      await qc.invalidateQueries({ queryKey: ["marketplace-configs"] });
      toast.success("Dados da loja removidos"); onClose();
    } catch (error) { toast.error(errorMessage(error)); } finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{m.name}</DialogTitle><DialogDescription>{config ? "Editar configuração de afiliado" : "Configurar conta de afiliado"}</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-5">
        <div className="flex flex-wrap gap-2"><Badge variant={config ? "lime" : "muted"}>{config ? "Configurado" : "Não configurado"}</Badge><Badge variant="warning">Validação pendente</Badge></div>
        <p className="text-sm text-muted-foreground">Conversão automática em desenvolvimento. Salvar identificadores não valida sua conta no programa.</p>
        {fieldsOf(m).map((field) => <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`market-${field.key}`}>{field.label}{field.required ? " *" : " (opcional)"}</Label>
          <Input id={`market-${field.key}`} type={field.type === "secret" ? "password" : field.type === "url" ? "url" : "text"} autoComplete="off" required={field.required && !(field.type === "secret" && config?.has_secret)} maxLength={field.type === "secret" ? 8000 : 2000} disabled={!m.is_available || busy} value={(field.type === "secret" ? secrets : values)[field.key] ?? ""} onChange={(e) => field.type === "secret" ? setSecrets({ ...secrets, [field.key]: e.target.value }) : setValues({ ...values, [field.key]: e.target.value })} placeholder={field.type === "secret" && config?.has_secret ? "Token salvo; preencha apenas para substituí-lo" : undefined} />
          {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
          {field.type === "secret" && config?.has_secret && <p className="flex items-center gap-1 text-xs text-primary"><ShieldCheck className="size-3" /> Credencial protegida; não será exibida novamente.</p>}
        </div>)}
        <section className="space-y-2 border-y border-border py-4">
          <div className="flex items-center justify-between gap-4"><Label htmlFor="activate-marketplace">Ativar integração</Label><Switch id="activate-marketplace" checked={active} disabled={!m.is_available || busy} onCheckedChange={setActive} /></div>
          <p className="text-xs text-muted-foreground">Quando desativada, esta loja não será utilizada nas novas operações de geração e divulgação.</p>
          <p className="text-xs text-warning">A ativação libera o uso dos dados salvos, não uma conexão externa validada.</p>
        </section>
        <section className="space-y-3">
          <h3 className="font-semibold">Tutorial de configuração</h3>
          {m.tutorial_text ? <p className="whitespace-pre-line text-sm text-muted-foreground">{m.tutorial_text}</p> : <p className="text-sm text-muted-foreground">O tutorial desta loja estará disponível em breve.</p>}
          {video && <iframe title={`Tutorial ${m.name}`} src={video} className="aspect-video w-full rounded-lg" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
          <div className="flex flex-wrap gap-2">
            {m.tutorial_url && <Button variant="outline" size="sm" asChild><a href={m.tutorial_url} target="_blank" rel="noopener noreferrer"><ExternalLink /> Ver tutorial completo</a></Button>}
            {m.documentation_url && <Button variant="ghost" size="sm" asChild><a href={m.documentation_url} target="_blank" rel="noopener noreferrer"><ExternalLink /> Programa oficial</a></Button>}
          </div>
        </section>
        {!m.is_available && <p className="text-sm text-warning">Esta loja está indisponível para novas configurações. Seus dados permanecem salvos.</p>}
        <DialogFooter className="gap-2">
          {config && <ConfirmButton trigger={<Button type="button" variant="ghost" className="text-destructive" disabled={busy}><Trash2 /> Limpar dados</Button>} title={`Limpar dados de ${m.name}?`} description="Somente a configuração desta loja na sua conta será removida. Produtos, campanhas e outras lojas serão preservados." confirmLabel="Limpar dados" onConfirm={clear} />}
          <Button type="submit" variant="hero" disabled={busy || !m.is_available}><Save /> {busy ? "Salvando..." : config ? "Salvar alterações" : "Salvar configuração"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}