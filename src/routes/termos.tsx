import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Afiliado Automático" },
      { name: "description", content: "Condições de uso da plataforma Afiliado Automático." },
      { property: "og:title", content: "Termos de uso — Afiliado Automático" },
      { property: "og:description", content: "Regras e responsabilidades no uso da plataforma." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage title="Termos de uso" updated="novembro de 2026">
      <h2>1. Sobre o serviço</h2>
      <p>O Afiliado Automático é uma ferramenta para organizar e programar a divulgação de ofertas e links de afiliado em canais de comunicação, como grupos de WhatsApp, por meio de integrações tecnicamente validadas.</p>
      <h2>2. Conta do usuário</h2>
      <p>Você é responsável pelas informações da sua conta, pela guarda da sua senha e por todas as ações realizadas com ela.</p>
      <h2>3. Uso permitido</h2>
      <ul>
        <li>Enviar conteúdo apenas para grupos que você administra ou nos quais tem autorização para divulgar.</li>
        <li>Respeitar as políticas do WhatsApp, da Meta e dos programas de afiliados utilizados.</li>
        <li>Não enviar spam, conteúdo enganoso, ilegal ou que viole direitos de terceiros.</li>
      </ul>
      <h2>4. Links de afiliado</h2>
      <p>Os links devem ser gerados pelos mecanismos oficiais de cada programa. A plataforma não cria, altera nem garante comissões.</p>
      <h2>5. Limites e disponibilidade</h2>
      <p>Os limites de uso dependem do plano contratado e das restrições técnicas das integrações. Recursos marcados como demonstração não realizam envios reais.</p>
      <h2>6. Suspensão</h2>
      <p>Contas que violem estes termos podem ser suspensas, com ou sem aviso prévio, conforme a gravidade.</p>
      <h2>7. Alterações</h2>
      <p>Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas pelo painel ou por e-mail.</p>
    </LegalPage>
  ),
});
