import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TASKS = {
  create: "Crie uma mensagem promocional para WhatsApp a partir dos dados do produto.",
  rewrite: "Reescreva a mensagem promocional mantendo preços, cupom e link exatamente iguais.",
  cta: "Sugira 5 chamadas para ação curtas e diferentes para esta oferta, uma por linha.",
  variations: "Crie 3 versões diferentes desta mensagem, separadas por uma linha contendo apenas ---.",
  tone: "Reescreva a mensagem no tom solicitado, mantendo preços, cupom e link exatamente iguais.",
  summarize: "Resuma as informações do produto em até 3 linhas objetivas para uma mensagem de oferta.",
  titles: "Sugira 5 títulos chamativos (com emoji) para esta oferta, um por linha.",
} as const;

const input = z.object({
  task: z.enum(Object.keys(TASKS) as [keyof typeof TASKS, ...(keyof typeof TASKS)[]]),
  text: z.string().trim().min(3).max(4000),
  tone: z.string().trim().max(40).optional(),
});

export const runAiAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Assistente de IA indisponível no momento.");

    const system =
      "Você é um redator especialista em marketing de afiliados no Brasil e escreve mensagens para grupos de WhatsApp. " +
      "Escreva em português do Brasil, use emojis com moderação, frases curtas e formatação compatível com WhatsApp (*negrito*). " +
      "Nunca invente preços, cupons, links, prazos, estoque ou benefícios que não estejam no texto fornecido. " +
      "Se um link não for informado, use [LINK DO PRODUTO]. Responda apenas com o conteúdo pedido, sem explicações.";
    const user = `${TASKS[data.task]}${data.tone ? `\nTom desejado: ${data.tone}.` : ""}\n\nConteúdo:\n${data.text}`;

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (runId && !headers.has("X-Lovable-AIG-Run-ID")) headers.set("X-Lovable-AIG-Run-ID", runId);
        const response = await fetch(input, { ...init, headers });
        runId ??= response.headers.get("X-Lovable-AIG-Run-ID")?.trim() || undefined;
        if (response.status === 429) throw new Error("Muitas solicitações à IA agora. Aguarde alguns segundos e tente de novo.");
        if (response.status === 402) throw new Error("Os créditos de IA da plataforma acabaram. Avise o administrador.");
        if (!response.ok) {
          const body = await response.clone().text();
          console.error(`AI gateway error [${response.status}]: ${body}`);
        }
        return response;
      },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: system,
      messages: [{ role: "user", content: user }],
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    let content = "";
    try {
      content = (await result.text).trim();
    } catch (err) {
      console.error("AI generation failed", err);
      throw new Error(err instanceof Error && err.message.startsWith("Muitas") || (err instanceof Error && err.message.startsWith("Os créditos")) ? err.message : "Não foi possível gerar o texto agora.");
    }
    if (!content) throw new Error("A IA não retornou conteúdo.");
    return { content };
  });
