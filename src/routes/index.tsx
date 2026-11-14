import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/site/PublicLayout";
import { FEATURES, STATUS_LABEL } from "@/lib/features";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afiliado Automático — Divulgue ofertas no WhatsApp no piloto automático" },
      { name: "description", content: "Plataforma para afiliados organizarem grupos, produtos, links e mensagens e automatizarem a divulgação de ofertas no WhatsApp." },
      { property: "og:title", content: "Afiliado Automático — Ofertas no piloto automático" },
      { property: "og:description", content: "Grupos, produtos, links de afiliado, filas e automações em um único painel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STORES = ["Shopee", "Mercado Livre", "Amazon", "Magazine Luiza"];

function PhoneMock() {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-float">
      <div className="absolute -inset-6 rounded-[3rem] bg-primary/20 blur-3xl" />
      <div className="relative rounded-[2.5rem] border border-border bg-sidebar p-3 shadow-card">
        <div className="rounded-[2rem] bg-surface p-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">OF</div>
            <div>
              <p className="text-sm font-semibold">Ofertas Eletrônicos #12</p>
              <p className="text-xs text-muted-foreground">exemplo ilustrativo</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-accent p-3 leading-relaxed">
              <p className="font-bold">🔥 OFERTA IMPERDÍVEL!</p>
              <p className="mt-2">Fone Bluetooth com cancelamento de ruído</p>
              <p className="mt-2">De <s className="text-muted-foreground">R$ 199,90</s> por apenas <b className="text-lime">R$ 129,90</b>!</p>
              <p className="mt-2">🎟️ Cupom: DESCONTO10</p>
              <p className="mt-2">🛒 Aproveite aqui:</p>
              <p className="text-primary underline">seu-link-de-afiliado</p>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">09:00 ✓✓</p>
            </div>
            <div className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm bg-accent/60 p-3">
              <p className="font-bold">⚡ Próxima oferta às 09:15</p>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">fila programada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-primary" /> Feito para afiliados brasileiros
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] md:text-6xl">
              Suas ofertas nos grupos de WhatsApp, <span className="text-gradient">no piloto automático.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Cadastre produtos, organize grupos, gere mensagens e programe filas de envio com intervalos. Tudo em um painel simples, pensado para quem vive de cupom e link de afiliado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/cadastro">Começar grátis <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/funcionalidades">Ver funcionalidades</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>Pensado para:</span>
              {STORES.map((s) => (
                <span key={s} className="font-semibold text-foreground/80">{s}</span>
              ))}
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Timer, title: "Horas de volta no seu dia", text: "Pare de copiar e colar a mesma oferta grupo por grupo. Monte uma fila e deixe o horário trabalhar." },
            { icon: Sparkles, title: "Mensagens que convertem", text: "Modelos prontos e um assistente de IA para variar textos, chamadas e títulos." },
            { icon: ShieldCheck, title: "Seguro e transparente", text: "Seus dados isolados, integrações oficiais e nenhum número inventado nos relatórios." },
          ].map((b) => (
            <div key={b.title} className="surface-card p-6">
              <b.icon className="size-6 text-lime" />
              <h3 className="mt-4 text-xl font-bold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-sidebar">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold">Do link à mensagem no grupo, em 4 passos</h2>
            <p className="mt-3 text-muted-foreground">O fluxo completo de quem divulga ofertas todos os dias.</p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              ["Cadastre o produto", "Nome, preços, cupom e seu link de afiliado."],
              ["Gere a mensagem", "Modelo pronto ou com ajuda da IA."],
              ["Escolha os grupos", "Por categoria ou seleção individual."],
              ["Programe a fila", "Intervalos, horários e dias da semana."],
            ].map(([t, d], i) => (
              <li key={t} className="relative rounded-xl border border-border p-6">
                <span className="font-mono text-sm text-primary">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xl font-extrabold">Tudo que sua operação precisa</h2>
          <Button asChild variant="link"><Link to="/funcionalidades">Ver todas <ArrowRight /></Link></Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(0, 6).map((f) => (
            <div key={f.title} className="surface-card p-6">
              <div className="flex items-center justify-between">
                <f.icon className="size-5 text-primary" />
                <Badge variant={f.status === "disponivel" ? "success" : f.status === "demonstracao" ? "demo" : "warning"}>{STATUS_LABEL[f.status]}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 p-10 md:p-14">
          <div className="absolute inset-0 bg-hero" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">De 10 a 1.000+ grupos, a plataforma cresce com você.</h2>
              <ul className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {["Limites configuráveis por plano", "Seus dados isolados e protegidos", "Sem precisar deixar o navegador aberto", "Cuidados com a LGPD"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> {t}</li>
                ))}
              </ul>
            </div>
            <Button asChild variant="lime" size="xl"><Link to="/planos">Conhecer os planos</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
