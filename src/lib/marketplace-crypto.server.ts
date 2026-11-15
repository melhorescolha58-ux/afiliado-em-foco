/** Versioned AES-GCM payload, bound to its owner and marketplace. Never returned to the browser. */
export async function encryptCredentials(values: Record<string, string>, owner: string, marketplace: string, secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const key = await crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = new TextEncoder().encode(`${owner}:${marketplace}`);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData }, key, new TextEncoder().encode(JSON.stringify(values)));
  const bytes = new Uint8Array(iv.length + encrypted.byteLength);
  bytes.set(iv); bytes.set(new Uint8Array(encrypted), iv.length);
  return `v1:${btoa(String.fromCharCode(...bytes))}`;
}