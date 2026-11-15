import { describe, expect, it } from "vitest";
import { buildPromoMessage, discountPercent } from "@/lib/message-builder";
import { computeSchedule } from "@/lib/queue-schedule";
import { detectStore } from "@/lib/stores";

describe("message builder", () => {
  it("builds the example message with prices, coupon and link", () => {
    const msg = buildPromoMessage({
      name: "Fone Bluetooth com cancelamento de ruído",
      originalPrice: 199.9,
      promoPrice: 129.9,
      coupon: "desconto10",
      link: "https://exemplo.com/p",
    });
    expect(msg.startsWith("🔥 OFERTA IMPERDÍVEL!")).toBe(true);
    expect(msg).toContain("De R$\u00a0199,90 por apenas R$\u00a0129,90!");
    expect(msg).toContain("🎟️ Cupom: DESCONTO10");
    expect(msg.trim().endsWith("https://exemplo.com/p")).toBe(true);
  });
  it("uses a link placeholder when no affiliate link is given", () => {
    expect(buildPromoMessage({ name: "X" })).toContain("[LINK DO PRODUTO]");
  });
  it("computes discount percent", () => {
    expect(discountPercent(200, 150)).toBe(25);
    expect(discountPercent(100, 120)).toBeNull();
  });
});

describe("queue schedule", () => {
  it("spaces sends by the interval (09:00, 09:15, 09:30, 09:45)", () => {
    const start = new Date(2026, 10, 16, 9, 0); // segunda
    const out = computeSchedule({ start, count: 4, intervalMinutes: 15, windowStart: "08:00", windowEnd: "22:00", daysOfWeek: [1, 2, 3, 4, 5] });
    expect(out.map((d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`)).toEqual(["9:00", "9:15", "9:30", "9:45"]);
  });
  it("rolls over to the next allowed day after the window ends", () => {
    const start = new Date(2026, 10, 20, 21, 50); // sexta
    const out = computeSchedule({ start, count: 2, intervalMinutes: 15, windowStart: "08:00", windowEnd: "22:00", daysOfWeek: [1, 2, 3, 4, 5] });
    expect(out[1]?.getDay()).toBe(1);
    expect(out[1]?.getHours()).toBe(8);
  });
});

describe("store detection", () => {
  it("detects the priority marketplaces", () => {
    expect(detectStore("https://shopee.com.br/produto-i.1.2")).toBe("shopee");
    expect(detectStore("https://produto.mercadolivre.com.br/MLB-123")).toBe("mercadolivre");
    expect(detectStore("https://www.amazon.com.br/dp/B0")).toBe("amazon");
    expect(detectStore("https://www.magazineluiza.com.br/x/p/1")).toBe("magalu");
    expect(detectStore("não é url")).toBe("outra");
  });
});
