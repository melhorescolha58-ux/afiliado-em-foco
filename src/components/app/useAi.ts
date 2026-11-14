import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { runAiAssistant } from "@/lib/ai.functions";
import { errorMessage } from "@/lib/format";

export type AiTask = "create" | "rewrite" | "cta" | "variations" | "tone" | "summarize" | "titles";

export function useAi() {
  const run = useServerFn(runAiAssistant);
  return useMutation({
    mutationFn: (vars: { task: AiTask; text: string; tone?: string }) => run({ data: vars }).then((r) => r.content),
    onError: (e) => toast.error(errorMessage(e)),
  });
}
