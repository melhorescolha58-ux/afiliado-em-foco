import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { FEATURES, STATUS_LABEL } from "@/lib/features";

export const Route = createFileRoute("/funcionalidades")({
  head: () => ({
    meta: [
      { title: "Funcionalidades — Afiliado Automático" },
      { name: "description", content: "Grupos, produtos, links de afiliado, criador de mensagens, filas, automações e IA para divulgar ofertas no WhatsApp." },
      { property: "og:title", content: "Funcionalidades — Afiliado Automático" },
      { property: "og:description", content: "Conheça cada módulo da plataforma e o status de cada recurso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Funcionalidades"
        title={<>Um painel para toda a sua <span className="text-gradient">operação de ofertas</span></>}
        subtitle="Mostramos com transparência o que já está disponível, o que funciona em modo demonstração e o que está em desenvolvimento."
      />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-lg bg-accent"><f.icon className="size-5 text-lime" /></span>
                <Badge variant={f.status === "disponivel" ? "success" : f.status === "demonstracao" ? "demo" : "warning"}>{STATUS_LABEL[f.status]}</Badge>
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 surface-card p-8">
          <h2 className="text-2xl font-bold">Sobre a integração com o WhatsApp</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            O envio real para grupos só será liberado após uma prova de conceito com uma solução tecnicamente validada e que respeite as políticas da plataforma. Até lá, disparos e filas funcionam em modo demonstração: tudo é registrado, mas nenhuma mensagem é enviada de verdade.
          </p>
          <Button asChild variant="hero" className="mt-6"><Link to="/cadastro">Criar minha conta</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
