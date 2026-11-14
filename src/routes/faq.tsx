import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — Afiliado Automático" },
      { name: "description", content: "Tire dúvidas sobre grupos, envios, links de afiliado, limites e segurança da plataforma." },
      { property: "og:title", content: "Perguntas frequentes — Afiliado Automático" },
      { property: "og:description", content: "Respostas diretas sobre como a plataforma funciona." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const FAQ = [
  ["A plataforma já envia mensagens de verdade para os grupos?", "Ainda não. Estamos em fase de prova de conceito com uma solução oficial. Até a validação, disparos e filas funcionam em modo demonstração: tudo é registrado no histórico, marcado como demonstração, sem envio real."],
  ["Preciso deixar o computador ligado?", "Não. As filas e agendamentos foram projetados para rodar em segundo plano nos nossos servidores quando o envio real for liberado."],
  ["Vocês geram meu link de afiliado automaticamente?", "Só faremos isso por meio dos mecanismos oficiais de cada programa. Enquanto as integrações não estão disponíveis, você cola o link que já gerou no painel da loja e nós organizamos tudo."],
  ["Quais lojas são suportadas?", "Qualquer loja pode ser cadastrada manualmente. Shopee, Mercado Livre, Amazon e Magazine Luiza são reconhecidas automaticamente pelo link."],
  ["Quantos grupos posso cadastrar?", "Depende do plano: de 10 a mais de 1.000 grupos. Capacidades muito altas dependem de validação técnica."],
  ["A IA envia mensagens sozinha?", "Não. A IA ajuda a escrever e revisar textos. Nada gerado por IA é enviado sem que suas regras e permissões permitam."],
  ["Meus dados ficam seguros?", "Sim. Cada conta só acessa os próprios dados, com regras de segurança aplicadas diretamente no banco. Seguimos os cuidados da LGPD."],
  ["Posso cancelar quando quiser?", "Sim. Quando os pagamentos forem lançados, você poderá alterar ou cancelar o plano a qualquer momento pelo painel."],
];

function Page() {
  return (
    <PublicLayout>
      <PageHero eyebrow="Dúvidas" title="Perguntas frequentes" subtitle="Se não encontrar sua resposta, fale com a gente pela página de contato." />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <Accordion type="single" collapsible className="surface-card px-6">
          {FAQ.map(([q, a], i) => (
            <AccordionItem key={q} value={`i${i}`}>
              <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  );
}
