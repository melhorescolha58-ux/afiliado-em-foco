import { describe, expect, it } from "vitest";
import { validateConfiguration, usableMarketplace, configurationStatus, videoEmbed, campaignAllowsStore, detectMarketplace, type Marketplace, type MarketplaceConfig } from "@/lib/marketplaces";
import { encryptCredentials } from "@/lib/marketplace-crypto.server";

const amazon: Marketplace = { id: "amazon", name: "Amazon", description: "", category: "marketplace", logo_url: null, domains: ["amazon.com.br"], fields: [{key:"tag",label:"ID da Loja / Tag",type:"text",required:true,help:""},{key:"prime_url",label:"Link Amazon Prime",type:"url",required:false,help:""}], documentation_url:null,tutorial_url:null,tutorial_video_url:null,tutorial_text:"",is_available:true,sort_order:0,created_at:"",updated_at:"" };
const saved: MarketplaceConfig = { id:"1",user_id:"owner",marketplace_id:"amazon",config:{tag:"minhatag-20"},is_active:true,validation_status:"pending",validation_error:null,has_secret:false,created_at:"",updated_at:"" };
describe("Marketplace configuration rules", () => {
  it("saves Amazon without the optional Prime link", () => { expect(validateConfiguration(amazon,{tag:"minhatag-20"},{},false).config).toEqual({tag:"minhatag-20",prime_url:""}); });
  it("requires the Amazon affiliate ID", () => { expect(() => validateConfiguration(amazon,{}, {},false)).toThrow("ID da Loja / Tag"); });
  it("does not claim validation merely from activation", () => { expect(configurationStatus(saved).key).toBe("active"); expect(saved.validation_status).toBe("pending"); });
  it("excludes a disabled configuration from new dependent operations", () => { expect(usableMarketplace(amazon,{...saved,is_active:false})).toBe(false); });
  it("excludes a marketplace disabled by an administrator without deleting settings", () => { expect(usableMarketplace({...amazon,is_available:false},saved)).toBe(false); expect(saved.config).toEqual({tag:"minhatag-20"}); });
  it("keeps secret fields out of public configuration even if posted there", () => {
    const ml={...amazon,fields:[{key:"token",label:"Token",type:"secret",required:false,help:""}]};
    expect(validateConfiguration(ml,{token:"should-not-be-public"},{token:"sensitive-test-value"},false)).toEqual({config:{},secrets:{token:"sensitive-test-value"}});
  });
  it("preserves a stored token when replacement is blank", () => { const ml={...amazon,fields:[{key:"token",label:"Token",type:"secret",required:true,help:""}]}; expect(validateConfiguration(ml,{}, {},true).secrets).toEqual({}); });
  it("only accepts HTTPS URLs, not executable URLs", () => { expect(() => validateConfiguration(amazon,{tag:"id",prime_url:"javascript:alert(1)"},{},false)).toThrow(); });
  it("only embeds real YouTube video IDs from allowed hosts", () => { expect(videoEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"); expect(videoEmbed("https://youtube.com.attacker.test/watch?v=dQw4w9WgXcQ")).toBeNull(); });
  it("rejects a lookalike marketplace domain", () => { expect(detectMarketplace("https://amazon.com.br.attacker.test/x",[amazon])).toBe("outra"); expect(detectMarketplace("https://www.amazon.com.br/x",[amazon])).toBe("amazon"); });
  it("restricts campaigns to their selected marketplaces", () => { expect(campaignAllowsStore(["amazon"],"shopee")).toBe(false); expect(campaignAllowsStore(["amazon"],"amazon")).toBe(true); });
  it("encrypts credentials with different payloads and rejects another owner", async () => {
    const key="test-only-encryption-key-not-a-real-secret";
    const payload = await encryptCredentials({token:"test-token"},"owner-a","mercadolivre",key);
    expect(payload).not.toContain("test-token"); expect(await encryptCredentials({token:"test-token"},"owner-a","mercadolivre",key)).not.toBe(payload);
    const bytes=Uint8Array.from(atob(payload.slice(3)),c=>c.charCodeAt(0));
    const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(key));
    const cryptoKey=await crypto.subtle.importKey("raw",digest,"AES-GCM",false,["decrypt"]);
    const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes.slice(0,12),additionalData:new TextEncoder().encode("owner-a:mercadolivre")},cryptoKey,bytes.slice(12));
    expect(JSON.parse(new TextDecoder().decode(plain))).toEqual({token:"test-token"});
    await expect(crypto.subtle.decrypt({name:"AES-GCM",iv:bytes.slice(0,12),additionalData:new TextEncoder().encode("owner-b:mercadolivre")},cryptoKey,bytes.slice(12))).rejects.toThrow();
  });
});