import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? brl.format(n) : "—";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export function timeAgo(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
}

export function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "Algo deu errado. Tente novamente.";
}
