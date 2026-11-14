import {
  Bot, CalendarClock, Layers, Link2, MessageSquareText, Plug, Repeat, Send, ShoppingBag, Users, Workflow, History, BarChart3, Radar,
} from "lucide-react";

export type FeatureStatus = "disponivel" | "demonstracao" | "em-breve";

export const FEATURES = [
  { icon: Users, title: "Gestão de grupos", text: "Cadastre, categorize e selecione centenas de grupos com busca, filtros e ações em lote.", status: "disponivel" },
  { icon: ShoppingBag, title: "Produtos e ofertas", text: "Preço original, promocional, cupom, código e link de afiliado em um só cadastro reutilizável.", status: "disponivel" },
  { icon: Link2, title: "Links de afiliado", text: "Identificamos a loja e organizamos seus links. Integrações oficiais com marketplaces em validação.", status: "demonstracao" },
  { icon: MessageSquareText, title: "Criador de mensagens", text: "Monte textos prontos com emojis, chamadas para ação e salve seus modelos favoritos.", status: "disponivel" },
  { icon: Bot, title: "Assistente de IA", text: "Reescreva ofertas, crie variações, ajuste o tom e gere títulos mais chamativos.", status: "disponivel" },
  { icon: Send, title: "Disparo manual", text: "Escolha a oferta, os grupos e confira a prévia antes de confirmar.", status: "demonstracao" },
  { icon: CalendarClock, title: "Filas e agendamentos", text: "Programe vários envios com intervalos, horário de funcionamento e dias da semana.", status: "demonstracao" },
  { icon: Repeat, title: "Divulgador automático", text: "Rotina contínua de ofertas com intervalo, janela de horário e limite por período.", status: "demonstracao" },
  { icon: Workflow, title: "Regras de automação", text: "Gatilho → condição → ação, configurado visualmente, sem programar.", status: "disponivel" },
  { icon: Plug, title: "Conexões WhatsApp", text: "Integração por solução oficial e validada. Prova de conceito em andamento.", status: "em-breve" },
  { icon: History, title: "Histórico de envios", text: "Cada solicitação registrada com grupo, produto, origem, status e detalhes de erro.", status: "disponivel" },
  { icon: BarChart3, title: "Relatórios", text: "Volume de envios, falhas, produtos mais divulgados e grupos mais utilizados.", status: "disponivel" },
  { icon: Radar, title: "Monitoramento de ofertas", text: "Acompanhe fontes autorizadas e transforme achados em divulgações próprias.", status: "em-breve" },
  { icon: Layers, title: "Planos e limites", text: "Limites de grupos, conexões e automações controlados por plano.", status: "disponivel" },
] as const;

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  disponivel: "Disponível",
  demonstracao: "Modo demonstração",
  "em-breve": "Em desenvolvimento",
};
