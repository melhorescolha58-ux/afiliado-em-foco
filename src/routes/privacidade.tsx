import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Afiliado Automático" },
      { name: "description", content: "Como o Afiliado Automático coleta, usa e protege seus dados, conforme a LGPD." },
      { property: "og:title", content: "Política de privacidade — Afiliado Automático" },
      { property: "og:description", content: "Transparência sobre o tratamento de dados pessoais." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage title="Política de privacidade" updated="novembro de 2026">
      <h2>1. Dados que coletamos</h2>
      <ul>
        <li>Dados de cadastro: nome, e-mail e preferências.</li>
        <li>Dados operacionais que você cadastra: grupos, produtos, links, mensagens, filas e regras.</li>
        <li>Registros técnicos de uso e de envio, para segurança e suporte.</li>
      </ul>
      <h2>2. Para que usamos</h2>
      <p>Para prestar o serviço, aplicar limites do plano, oferecer suporte, prevenir abusos e cumprir obrigações legais. Não vendemos seus dados.</p>
      <h2>3. Isolamento e segurança</h2>
      <p>Cada conta acessa apenas os próprios dados, com regras de segurança aplicadas no banco de dados. Credenciais de integrações nunca ficam expostas no navegador.</p>
      <h2>4. Inteligência artificial</h2>
      <p>Quando você usa o assistente de IA, o texto enviado é processado por um provedor de IA apenas para gerar a resposta solicitada.</p>
      <h2>5. Seus direitos (LGPD)</h2>
      <p>Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados pela página de contato.</p>
      <h2>6. Retenção</h2>
      <p>Mantemos os dados enquanto a conta estiver ativa ou pelo prazo exigido por lei.</p>
    </LegalPage>
  ),
});
