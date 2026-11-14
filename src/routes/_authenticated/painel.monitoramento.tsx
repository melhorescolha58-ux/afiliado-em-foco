import { createFileRoute } from "@tanstack/react-router";
import { Radar, Search, FileSearch, Link2, Eye, Send } from "lucide-react";
import { PageHeader, DevNotice, DevBadge } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/painel/monitoramento")({
  head: () => ({ meta: [{ title: "Monitoramento de ofertas — Afiliado Automático" }] }),
  component: () => (
    <>
      <PageHeader title="Monitoramento de ofertas" description="Acompanhe fontes autorizadas e transforme novas ofertas em divulgações suas." badge={<DevBadge />} />
      <DevNotice>Este recurso será desenvolvido somente após validarmos a viabilidade técnica e a autorização das fontes de ofertas.</DevNotice>
      <div className="surface-card p-6">
        <h2 className="font-bold">Como vai funcionar</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { i: Radar, t: "Detectar", d: "Nova oferta em uma fonte conectada." },
            { i: FileSearch, t: "Extrair", d: "Dados disponíveis da oferta." },
            { i: Search, t: "Identificar", d: "Produto e link original." },
            { i: Link2, t: "Substituir", d: "Pelo seu link, via integração válida." },
            { i: Eye, t: "Revisar", d: "Você aprova a mensagem." },
            { i: Send, t: "Encaminhar", d: "Para os destinos escolhidos." },
          ].map((s, n) => (
            <li key={s.t} className="rounded-xl border border-border p-4">
              <span className="font-mono text-xs text-primary">0{n + 1}</span>
              <s.i className="mt-2 size-5 text-lime" />
              <p className="mt-2 font-semibold">{s.t}</p>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </>
  ),
});
