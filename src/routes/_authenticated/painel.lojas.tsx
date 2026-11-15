import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Store, Settings2, Check, Power, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, LoadingRows, EmptyState } from "@/components/app/ui";
import { MarketplaceDialog } from "@/components/app/MarketplaceDialog";
import { useMarketplaces } from "@/hooks/use-marketplaces";
import { categories, configurationStatus, usableMarketplace, type Marketplace } from "@/lib/marketplaces";

export const Route = createFileRoute("/_authenticated/painel/lojas")({
  validateSearch: (search: Record<string, unknown>): { loja?: string } => typeof search["loja"] === "string" ? { loja: search["loja"] } : {},
  head: () => ({ meta: [{ title: "Lojas — Afiliado Automático" }, { name: "description", content: "Configure e gerencie suas contas de afiliado, identificadores e tutoriais de marketplaces." }, { property: "og:title", content: "Lojas — Afiliado Automático" }, { property: "og:description", content: "Suas contas de afiliado organizadas em um só lugar." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: StoresPage,
});

function StoresPage() {
  const { catalogue, configs, isLoading, error } = useMarketplaces();
  const { loja } = Route.useSearch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Marketplace | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const visible = catalogue.filter((m) => m.is_available || configs.some((c) => c.marketplace_id === m.id));
  const filtered = visible.filter((m) => {
    const c = configs.find((c) => c.marketplace_id === m.id);
    return m.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")) && (category === "all" || category === m.category) && (status === "all" || (status === "configured" ? !!c : status === "pending" ? c?.validation_status === "pending" : configurationStatus(c).key === status));
  });
  const current = selected ?? (!dismissed && loja ? visible.find((m) => m.id === loja) : null);
  return <>
    <PageHeader title="Lojas" description="Configure suas contas de afiliado e gerencie suas lojas em um só lugar." />
    <div className="mb-7 grid grid-cols-3 gap-3 border-y border-border py-5">
      {[{ label: "Disponíveis", value: catalogue.filter((m) => m.is_available).length, icon: Store }, { label: "Configuradas", value: configs.length, icon: Check }, { label: "Ativas", value: catalogue.filter((m) => usableMarketplace(m, configs.find((c) => c.marketplace_id === m.id))).length, icon: Power }].map((item) => <div key={item.label} className="flex items-center gap-3"><item.icon className="hidden size-5 text-primary sm:block" /><div><p className="text-xs text-muted-foreground">{item.label}</p><p className="font-display text-2xl font-bold">{isLoading ? "—" : item.value}</p></div></div>)}
    </div>
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="relative min-w-48 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Pesquisar lojas" placeholder="Pesquisar lojas" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
      <Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Filtrar categoria" className="w-full sm:w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{Object.entries(categories).map(([id,label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={setStatus}><SelectTrigger aria-label="Filtrar status" className="w-full sm:w-48"><SelectValue /></SelectTrigger><SelectContent>{([{id:"all",label:"Todos os status"},{id:"none",label:"Não configurado"},{id:"configured",label:"Configurado"},{id:"active",label:"Ativo"},{id:"inactive",label:"Desativado"},{id:"pending",label:"Validação pendente"},{id:"error",label:"Erro de configuração"}]).map(({id,label}) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select>
    </div>
    {error ? <p role="alert" className="text-destructive">Não foi possível carregar as lojas. Atualize a página para tentar novamente.</p> : isLoading ? <LoadingRows rows={3} /> : !filtered.length ? <EmptyState icon={Store} title="Nenhuma loja encontrada" text="Não há lojas para os filtros selecionados." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((m) => {
        const config = configs.find((c) => c.marketplace_id === m.id);
        const state = configurationStatus(config);
        return <article key={m.id} aria-label={m.name} className="flex min-h-64 flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
          <div className="mb-5 flex items-center justify-between gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">{m.logo_url ? <img src={m.logo_url} alt={`Logotipo ${m.name}`} className="size-9 object-contain" /> : <Store className="size-6 text-muted-foreground" />}</span><Badge variant={!m.is_available ? "warning" : state.variant}>{!m.is_available ? "Indisponível" : state.label}</Badge></div>
          <p className="text-xs text-muted-foreground">{categories[m.category as keyof typeof categories] ?? m.category}</p>
          <h2 className="mt-1 text-lg font-bold">{m.name}</h2><p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
          {config && <p className="mt-3 text-xs text-warning">{config.validation_status === "validated" ? "Validação confirmada" : "Validação pendente · conversão em desenvolvimento"}</p>}
          <Button variant={config ? "outline" : "soft"} className="mt-auto w-full justify-between gap-2 pt-2" onClick={() => setSelected(m)}><span className="flex items-center gap-2"><Settings2 className="size-4" />{config ? "Editar configuração" : "Configurar"}</span><ArrowUpRight className="size-4" /></Button>
        </article>;
      })}
    </div>}
    {current && <MarketplaceDialog key={current.id} marketplace={current} config={configs.find((c) => c.marketplace_id === current.id)} onClose={() => { setSelected(null); setDismissed(true); }} />}
  </>;
}