import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Afiliado Automático" },
      { name: "description", content: "Planos por quantidade de grupos: de 10 a mais de 1.000 grupos de WhatsApp." },
      { property: "og:title", content: "Planos — Afiliado Automático" },
      { property: "og:description", content: "Escolha o plano ideal para o tamanho da sua rede de grupos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

export const publicPlansQuery = {
  queryKey: ["public-plans"],
  queryFn: async () => {
    const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
};

function Page() {
  const { data: plans, isLoading } = useQuery(publicPlansQuery);
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Planos"
        title={<>Pague pelo tamanho da <span className="text-gradient">sua rede</span></>}
        subtitle="Todos os planos começam com 14 dias de teste. Valores serão divulgados no lançamento comercial."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          {plans?.map((p) => {
            const featured = p.slug === "profissional";
            const features = Array.isArray(p.features) ? (p.features as string[]) : [];
            return (
              <div key={p.id} className={cn("surface-card flex flex-col p-6", featured && "shadow-glow")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  {featured && <Badge variant="lime">Mais escolhido</Badge>}
                </div>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-5">
                  <span className="font-display text-4xl font-extrabold">{p.max_groups.toLocaleString("pt-BR")}{p.requires_validation ? "+" : ""}</span>
                  <span className="ml-1 text-sm text-muted-foreground">grupos</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.price_monthly ? `${formatBRL(p.price_monthly)}/mês` : "Preço em definição"}
                </p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> {p.max_connections} conexão(ões)</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> {p.max_automations} automações</li>
                  {features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}</li>
                  ))}
                </ul>
                <Button asChild variant={featured ? "hero" : "outline"} className="mt-6">
                  {p.requires_validation ? <Link to="/contato">Falar com a equipe</Link> : <Link to="/cadastro">Começar teste</Link>}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Capacidades acima de 500 grupos dependem de validação técnica da integração. Pagamento mensal ou anual chegará em breve.
        </p>
      </section>
    </PublicLayout>
  );
}
