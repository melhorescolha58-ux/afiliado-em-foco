export const TRIGGERS = [
  { id: "product_created", label: "Quando uma nova oferta for cadastrada" },
  { id: "schedule_reached", label: "Quando chegar o horário programado" },
  { id: "product_inactivated", label: "Quando uma oferta for marcada como inativa" },
  { id: "send_failed", label: "Quando uma mensagem apresentar falha" },
  { id: "campaign_paused", label: "Quando uma campanha for pausada" },
] as const;

export const CONDITIONS = [
  { id: "always", label: "Sempre", needsValue: false },
  { id: "category_is", label: "Categoria do produto é", needsValue: true },
  { id: "store_is", label: "Loja do produto é", needsValue: true },
  { id: "discount_at_least", label: "Desconto de pelo menos (%)", needsValue: true },
] as const;

export const ACTIONS = [
  { id: "add_to_queue", label: "Adicionar à fila" },
  { id: "process_send", label: "Processar o envio" },
  { id: "block_sends", label: "Impedir novos envios" },
  { id: "log_error", label: "Registrar o erro e notificar" },
  { id: "stop_upcoming", label: "Interromper os próximos envios" },
  { id: "route_to_category", label: "Direcionar para os grupos da categoria" },
] as const;

export const label = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id)?.label ?? id;
