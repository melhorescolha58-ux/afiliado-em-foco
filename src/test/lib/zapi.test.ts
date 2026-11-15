import { describe, expect, it } from "vitest";
import { normalizeZapiQrCode, sanitizeZapiGroups, zapiMetadata } from "@/lib/zapi";
import { decryptCredentials, encryptCredentials } from "@/lib/marketplace-crypto.server";

describe("Z-API connection metadata", () => {
  it("exposes only the instance ID and whether credentials exist", () => {
    expect(zapiMetadata({ instance_id: "INSTANCE123", has_credentials: true })).toEqual({ instanceId: "INSTANCE123", hasCredentials: true });
    expect(zapiMetadata({ token: "must-not-be-read" })).toEqual({ instanceId: null, hasCredentials: false });
  });

  it("accepts only base64 image QR codes", () => {
    const image = `data:image/png;base64,${"A".repeat(120)}`;
    expect(normalizeZapiQrCode(image)).toBe(image);
    expect(normalizeZapiQrCode("javascript:alert(1)")).toBeNull();
    expect(normalizeZapiQrCode("not-a-qr-code")).toBeNull();
  });
});

describe("Z-API group imports", () => {
  it("keeps real groups, removes contacts and deduplicates by external ID", () => {
    const groups = sanitizeZapiGroups([
      { name: "Ofertas", phone: "120-group", isGroup: true },
      { name: "Contato", phone: "5511999999999", isGroup: false },
      { name: "Ofertas atualizado", phone: "120-group", isGroup: true },
    ]);
    expect(groups).toEqual([{ name: "Ofertas atualizado", phone: "120-group", isGroup: true }]);
  });

  it("rejects an invalid provider response", () => {
    expect(() => sanitizeZapiGroups({ groups: [] })).toThrow("lista de grupos inválida");
  });
});

describe("Z-API credential encryption", () => {
  it("round-trips only for the same owner and connection", async () => {
    const key = "test-only-encryption-key-not-a-real-secret";
    const encrypted = await encryptCredentials({ instanceId: "instance", token: "token", clientToken: "client" }, "owner-a", "connection-a", key);
    expect(encrypted).not.toContain("token");
    await expect(decryptCredentials(encrypted, "owner-a", "connection-a", key)).resolves.toEqual({ instanceId: "instance", token: "token", clientToken: "client" });
    await expect(decryptCredentials(encrypted, "owner-b", "connection-a", key)).rejects.toThrow();
    await expect(decryptCredentials(encrypted, "owner-a", "connection-b", key)).rejects.toThrow();
  });
});
