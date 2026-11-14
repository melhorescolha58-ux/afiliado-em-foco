export type StoreId = "shopee" | "mercadolivre" | "amazon" | "magalu" | "outra";

export const STORES: { id: StoreId; label: string; hosts: string[]; program: string }[] = [
  { id: "shopee", label: "Shopee", hosts: ["shopee.com.br", "shope.ee", "s.shopee.com.br"], program: "Programa de Afiliados Shopee" },
  { id: "mercadolivre", label: "Mercado Livre", hosts: ["mercadolivre.com.br", "mercadolibre.com", "mlb.", "meli.la"], program: "Programa de Afiliados Mercado Livre" },
  { id: "amazon", label: "Amazon", hosts: ["amazon.com.br", "amazon.com", "amzn.to", "a.co"], program: "Amazon Associados" },
  { id: "magalu", label: "Magazine Luiza", hosts: ["magazineluiza.com.br", "magalu.com", "magazinevoce.com.br"], program: "Parceiro Magalu" },
  { id: "outra", label: "Outra loja", hosts: [], program: "" },
];

export function storeLabel(id: string | null | undefined): string {
  return STORES.find((s) => s.id === id)?.label ?? "Outra loja";
}

/** Identifies the marketplace from a product URL. Returns "outra" when unknown or invalid. */
export function detectStore(rawUrl: string): StoreId {
  let host: string;
  try {
    host = new URL(rawUrl.trim()).hostname.toLowerCase();
  } catch {
    return "outra";
  }
  for (const store of STORES) {
    if (store.hosts.some((h) => host === h || host.endsWith("." + h) || (h.endsWith(".") && host.startsWith(h)))) {
      return store.id;
    }
  }
  return "outra";
}

export function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
