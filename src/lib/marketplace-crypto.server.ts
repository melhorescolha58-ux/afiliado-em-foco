/** Versioned AES-GCM payload, bound to its owner and resource. Never returned to the browser. */
async function credentialKey(secret: string, usage: "encrypt" | "decrypt") {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [usage]);
}

export async function encryptCredentials(values: Record<string, string>, owner: string, resource: string, secret: string) {
  const key = await credentialKey(secret, "encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = new TextEncoder().encode(`${owner}:${resource}`);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData }, key, new TextEncoder().encode(JSON.stringify(values)));
  const bytes = new Uint8Array(iv.length + encrypted.byteLength);
  bytes.set(iv); bytes.set(new Uint8Array(encrypted), iv.length);
  return `v1:${btoa(String.fromCharCode(...bytes))}`;
}

export async function decryptCredentials(payload: string, owner: string, resource: string, secret: string): Promise<Record<string, string>> {
  if (!payload.startsWith("v1:")) throw new Error("Formato de credenciais não suportado.");
  const bytes = Uint8Array.from(atob(payload.slice(3)), (character) => character.charCodeAt(0));
  if (bytes.length <= 12) throw new Error("Credenciais inválidas.");
  const key = await credentialKey(secret, "decrypt");
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.slice(0, 12), additionalData: new TextEncoder().encode(`${owner}:${resource}`) },
    key,
    bytes.slice(12),
  );
  const parsed: unknown = JSON.parse(new TextDecoder().decode(plain));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Credenciais inválidas.");
  return parsed as Record<string, string>;
}