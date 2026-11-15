import {
  LayoutDashboard, Plug, Users, ShoppingBag, Link2, MessageSquareText, Megaphone, Send, CalendarClock, Repeat,
  Workflow, Bot, Radar, History, BarChart3, Settings, CreditCard, LifeBuoy, Store,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    label: "Visão geral",
    items: [
      { to: "/painel", label: "Dashboard", icon: LayoutDashboard },
      { to: "/painel/conexoes", label: "Conexões", icon: Plug },
      { to: "/painel/grupos", label: "Meus grupos", icon: Users },
    ],
  },
  {
    label: "Ofertas",
    items: [
      { to: "/painel/lojas", label: "Configurar Lojas", icon: Store },
      { to: "/painel/produtos", label: "Produtos e ofertas", icon: ShoppingBag },
      { to: "/painel/links", label: "Gerador de links", icon: Link2 },
      { to: "/painel/mensagens", label: "Criador de mensagens", icon: MessageSquareText },
      { to: "/painel/campanhas", label: "Campanhas", icon: Megaphone },
    ],
  },
  {
    label: "Envios",
    items: [
      { to: "/painel/disparo", label: "Disparo manual", icon: Send },
      { to: "/painel/filas", label: "Filas e agendamentos", icon: CalendarClock },
      { to: "/painel/divulgador", label: "Divulgador automático", icon: Repeat },
      { to: "/painel/automacoes", label: "Automações", icon: Workflow },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { to: "/painel/ia", label: "Inteligência artificial", icon: Bot },
      { to: "/painel/monitoramento", label: "Monitoramento", icon: Radar },
      { to: "/painel/historico", label: "Histórico de envios", icon: History },
      { to: "/painel/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    label: "Conta",
    items: [
      { to: "/painel/configuracoes", label: "Configurações", icon: Settings },
      { to: "/painel/plano", label: "Meu plano", icon: CreditCard },
      { to: "/painel/suporte", label: "Suporte e tutoriais", icon: LifeBuoy },
    ],
  },
] as const;
