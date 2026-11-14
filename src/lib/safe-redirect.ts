/** Only allows same-origin relative paths like "/painel/grupos". */
export function safeRedirect(value: unknown, fallback = "/painel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
