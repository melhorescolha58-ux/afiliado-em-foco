import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/ui";

export const Route = createFileRoute("/_authenticated/painel/suporte")({
  head: () => ({ meta: [{ title: "Suporte e tutoriais — Afiliado Automático" }] }),
  component: () => (
    <>
      <PageHeader title="Suporte e tutoriais" description="Guias rápidos para tirar o máximo da plataforma." actions={<Button asChild variant="hero"><Link to="/contato">Falar com o suporte</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { t: "Organizando grupos por categoria", to: "/painel/grupos", d: "Crie categorias como Eletrônicos ou Moda e use-as para selecionar destinos em lote." },
          { t: "Cadastrando sua primeira oferta", to: "/painel/produtos", d: "Informe preços, cupom e cole o link de afiliado gerado no programa da loja." },
          { t: "Criando mensagens que convertem", to: "/painel/mensagens", d: "Use os estilos prontos, ajuste com IA e salve como modelo." },
          { t: "Programando uma fila", to: "/painel/filas", d: "Escolha produtos, grupos, início e intervalo — a plataforma calcula os horários." },
        ].map((x) => (
          <Link key={x.t} to={x.to} className="surface-card block p-5 transition-colors hover:border-primary/40">
            <p className="font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
          </Link>
        ))}
      </div>
    </>
  ),
});
