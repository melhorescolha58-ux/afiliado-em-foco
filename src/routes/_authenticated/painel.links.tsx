import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Link2, Save, Trash2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, EmptyState, ConfirmButton, DevNotice } from "@/components/app/ui";
import { CopyButton } from "@/components/app/CopyButton";
import { useRows, useSaveRow, useDeleteRows } from "@/lib/db";
import { STORES, detectStore, isValidUrl, storeLabel, type StoreId } from "@/lib/stores";
import { formatDate } from "@/lib/format";
import { useMarketplaces } from "@/hooks/use-marketplaces";
import { detectMarketplace, usableMarketplace } from "@/lib/marketplaces";

export const Route = createFileRoute("/_authenticated/painel/links")({
  head: () => ({ meta: [{ title: "Gerador de links — Afiliado Automático" }] }),
  component: LinksPage,
});

function LinksPage() {
  const { catalogue, configs } = useMarketplaces();
  const { data: links = [] } = useRows("affiliate_links");
  const { data: products = [] } = useRows("products");
  const save = useSaveRow("affiliate_links", [], "Link salvo");
  const saveProduct = useSaveRow("products", [], "");
  const del = useDeleteRows("affiliate_links");
  const [original, setOriginal] = useState("");
  const [store, setStore] = useState<string | null>(null);
  const [tag, setTag] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [productId, setProductId] = useState("none");

  function identify() {
    if (!isValidUrl(original)) { toast.error("Cole um link válido começando com https://"); return; }
    const id = detectMarketplace(original, catalogue);
    setStore(id);
    const saved = configs.find((c) => c.marketplace_id === id);
    const values = saved?.config;
    if (values && typeof values === "object" && !Array.isArray(values)) {
      const identifier = values["tag"] ?? values["affiliate_id"] ?? values["publisher_id"] ?? values["tracking_id"];
      setTag(typeof identifier === "string" ? identifier : "");
    } else setTag("");
  }
  async function submit() {
    if (!store) return;
    if (!isValidUrl(affiliate)) { toast.error("Cole o link de afiliado gerado no programa da loja."); return; }
    await save.mutateAsync({ store, original_url: original.trim(), affiliate_url: affiliate.trim(), affiliate_tag: tag.trim() || null, method: "manual", product_id: productId !== "none" ? productId : null });
    if (productId !== "none") await saveProduct.mutateAsync({ id: productId, affiliate_url: affiliate.trim() });
    setOriginal(""); setAffiliate(""); setStore(null); setProductId("none");
  }
  const info = STORES.find((s) => s.id === store);
  const marketplace = catalogue.find((m) => m.id === store);
  const configuration = configs.find((c) => c.marketplace_id === store);

  return (
    <>
      <PageHeader title="Gerador de links de afiliado" description="Identifique a loja, registre seu link de afiliado e reutilize nos produtos." />
      <DevNotice>
        A geração automática via integrações oficiais (Shopee, Mercado Livre, Amazon e Magazine Luiza) está em desenvolvimento. <b>Não alteramos URLs por conta própria</b>: por enquanto, gere o link no painel do programa de afiliados e cole abaixo.
      </DevNotice>
      {marketplace && !configuration && <div className="mb-5 space-y-3 border-l-2 border-warning pl-4"><p className="text-sm">Você ainda não configurou sua conta de afiliado desta loja. Acesse Configurar Lojas para realizar a configuração.</p><Button asChild variant="outline" size="sm"><Link to="/painel/lojas" search={{ loja: marketplace.id }}>Configurar {marketplace.name}</Link></Button></div>}
      {marketplace && configuration && <div className="mb-5 flex flex-wrap items-center gap-3"><Badge variant={usableMarketplace(marketplace, configuration) ? "lime" : "warning"}>{usableMarketplace(marketplace, configuration) ? "Configuração ativa · validação pendente" : "Loja desativada para novas operações automáticas"}</Badge><Button asChild variant="link" size="sm"><Link to="/painel/lojas" search={{ loja: marketplace.id }}>Editar configuração</Link></Button></div>}
      <div className="surface-card p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>1. Link do produto</Label>
              <div className="flex gap-2">
                <Input value={original} onChange={(e) => { setOriginal(e.target.value); setStore(null); }} placeholder="https://shopee.com.br/..." />
                <Button variant="soft" onClick={identify}><Search /> Identificar</Button>
              </div>
            </div>
            {store && (
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Loja identificada:</span><Badge variant={store === "outra" ? "muted" : "lime"}>{storeLabel(store)}</Badge></div>
                {info?.program && <p className="mt-2 text-sm text-muted-foreground">Gere seu link no <b className="text-foreground">{info.program}</b> e cole no passo 3.</p>}
                <Badge variant="warning" className="mt-3">Integração automática: em desenvolvimento</Badge>
              </div>
            )}
            <div className="space-y-1.5"><Label>2. Sua identificação de afiliado (opcional)</Label><Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ex.: seu ID ou tag no programa" maxLength={80} /></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>3. Link de afiliado gerado</Label><Input value={affiliate} onChange={(e) => setAffiliate(e.target.value)} placeholder="Cole aqui o link oficial do programa" disabled={!store} /></div>
            <div className="space-y-1.5">
              <Label>Vincular a um produto (opcional)</Label>
              <Select value={productId} onValueChange={setProductId} disabled={!store}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">Não vincular</SelectItem>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" onClick={submit} disabled={!store || save.isPending}><Save /> Salvar link</Button>
              <CopyButton text={affiliate} disabled={!affiliate} />
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">Links salvos</h2>
      {!links.length ? <EmptyState icon={Link2} title="Nenhum link salvo" text="Os links de afiliado que você registrar aparecerão aqui." /> : (
        <div className="surface-card overflow-x-auto p-4">
          <Table>
            <TableHeader><TableRow><TableHead>Loja</TableHead><TableHead>Link de afiliado</TableHead><TableHead>Produto</TableHead><TableHead>Origem</TableHead><TableHead>Data</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {links.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><Badge variant="lime">{storeLabel(l.store)}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">{l.affiliate_url}</TableCell>
                  <TableCell className="text-sm">{products.find((p) => p.id === l.product_id)?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="muted">{l.method === "manual" ? "Manual" : "Integração oficial"}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(l.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <CopyButton size="sm" variant="ghost" label="" text={l.affiliate_url} />
                      <Button asChild size="icon" variant="ghost" aria-label="Abrir"><a href={l.affiliate_url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a></Button>
                      <ConfirmButton trigger={<Button size="icon" variant="ghost" aria-label="Excluir"><Trash2 /></Button>} title="Excluir link?" description="O link será removido da lista." confirmLabel="Excluir" onConfirm={() => del.mutate([l.id])} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
