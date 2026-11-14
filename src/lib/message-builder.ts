import { formatBRL } from "./format";
import { storeLabel } from "./stores";

export interface OfferInput {
  name: string;
  originalPrice?: number | null;
  promoPrice?: number | null;
  coupon?: string | null;
  link?: string | null;
  store?: string | null;
  extra?: string | null;
}

export type MessageStyle = "imperdivel" | "relampago" | "direto" | "cupom";

export const MESSAGE_STYLES: { id: MessageStyle; label: string }[] = [
  { id: "imperdivel", label: "Oferta imperdível" },
  { id: "relampago", label: "Promoção relâmpago" },
  { id: "direto", label: "Direto ao ponto" },
  { id: "cupom", label: "Foco no cupom" },
];

const HEADLINES: Record<MessageStyle, string> = {
  imperdivel: "🔥 OFERTA IMPERDÍVEL!",
  relampago: "⚡ PROMOÇÃO RELÂMPAGO — corre que acaba!",
  direto: "✅ Achado do dia",
  cupom: "🎟️ CUPOM LIBERADO!",
};

const CTAS: Record<MessageStyle, string> = {
  imperdivel: "🛒 Aproveite aqui:",
  relampago: "⏰ Garanta o seu antes que esgote:",
  direto: "👉 Compre aqui:",
  cupom: "🛍️ Use o cupom e compre aqui:",
};

export function discountPercent(original?: number | null, promo?: number | null): number | null {
  if (!original || !promo || promo >= original || original <= 0) return null;
  return Math.round(((original - promo) / original) * 100);
}

/** Builds a WhatsApp-ready promotional message from offer data. */
export function buildPromoMessage(input: OfferInput, style: MessageStyle = "imperdivel"): string {
  const lines: string[] = [HEADLINES[style], "", input.name.trim()];

  const hasOriginal = input.originalPrice != null && input.originalPrice > 0;
  const hasPromo = input.promoPrice != null && input.promoPrice > 0;
  if (hasOriginal && hasPromo && input.promoPrice! < input.originalPrice!) {
    lines.push("", `De ${formatBRL(input.originalPrice)} por apenas ${formatBRL(input.promoPrice)}!`);
    const pct = discountPercent(input.originalPrice, input.promoPrice);
    if (pct && pct >= 5) lines.push(`📉 ${pct}% de desconto`);
  } else if (hasPromo) {
    lines.push("", `Por apenas ${formatBRL(input.promoPrice)}!`);
  }

  if (input.store && input.store !== "outra") lines.push(`🏬 ${storeLabel(input.store)}`);
  if (input.coupon?.trim()) lines.push("", `🎟️ Cupom: ${input.coupon.trim().toUpperCase()}`);
  if (input.extra?.trim()) lines.push("", input.extra.trim());

  lines.push("", CTAS[style], input.link?.trim() || "[LINK DO PRODUTO]");
  return lines.join("\n");
}
