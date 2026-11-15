import { describe, expect, it } from "vitest";
import { groupSendStatus, normalizeWhatsAppPhone } from "@/lib/connections";
import { groupLimit, type Account } from "@/hooks/use-account";

describe("WhatsApp number registration", () => {
  it("normalizes a valid number with country and area codes", () => {
    expect(normalizeWhatsAppPhone("+55 (11) 99999-9999")).toBe("+5511999999999");
  });

  it("rejects incomplete numbers", () => {
    expect(normalizeWhatsAppPhone("11 9999")).toBeNull();
    expect(normalizeWhatsAppPhone("")).toBeNull();
  });
});

describe("group connection status", () => {
  it("is available only with a connected number and send permission", () => {
    expect(groupSendStatus({ send_available: true }, { status: "connected" })).toBe("available");
    expect(groupSendStatus({ send_available: false }, { status: "connected" })).toBe("pending_integration");
  });

  it("distinguishes waiting for connection from waiting for integration", () => {
    expect(groupSendStatus({ send_available: false }, { status: "disconnected" })).toBe("pending_connection");
    expect(groupSendStatus({ send_available: false }, { status: "pending_validation" })).toBe("pending_integration");
  });
});

describe("plan group limit", () => {
  it("uses the subscribed plan limit", () => {
    const account = { subscription: { custom_max_groups: null, plan: { max_groups: 50 } } } as Account;
    expect(groupLimit(account)).toBe(50);
  });

  it("uses an account-specific limit when one is set", () => {
    const account = { subscription: { custom_max_groups: 500, plan: { max_groups: 50 } } } as Account;
    expect(groupLimit(account)).toBe(500);
  });
});
